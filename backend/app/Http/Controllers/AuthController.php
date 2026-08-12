<?php
// app/Http/Controllers/AuthController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use App\Models\Currency;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Register a new company and admin user
     */
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'company_name' => 'required|string|max:255',
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
                'password_confirmation' => 'required|string|min:8',
                'role' => 'nullable|string|in:admin,staff,customer,saraf',
                'phone' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // ✅ Create company with slug
            $company = Company::create([
                'name' => $request->company_name,
                'slug' => Str::slug($request->company_name) . '-' . time(),
                'email' => $request->email,
                'phone' => $request->phone ?? null,
                'is_active' => true,
            ]);

            // ✅ Create admin user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'admin',
                'company_id' => $company->id,
                'phone' => $request->phone ?? null,
                'is_active' => true,
                'can_login' => true,
            ]);

            // ✅ Create default currencies for the company
            $this->createDefaultCurrencies($company);

            // ✅ Generate token
            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration successful!',
                'data' => [
                    'user' => $user->load('company'),
                    'token' => $token,
                    'company' => $company,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Registration error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create default currencies for a new company
     */
    private function createDefaultCurrencies($company)
    {
        // ✅ Check if system currencies exist, if not create them
        $currencies = Currency::where('is_system', true)->get();
        
        if ($currencies->isEmpty()) {
            // ✅ Create default system currencies
            $defaultCurrencies = [
                ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'is_system' => true],
                ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'is_system' => true],
                ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£', 'is_system' => true],
                ['code' => 'AFN', 'name' => 'Afghan Afghani', 'symbol' => '؋', 'is_system' => true],
            ];
            
            foreach ($defaultCurrencies as $currencyData) {
                Currency::create(array_merge($currencyData, [
                    'exchange_rate' => 1.0000,
                    'is_active' => true,
                    'company_id' => null,
                    'created_by' => null,
                ]));
            }
            
            $currencies = Currency::where('is_system', true)->get();
        }
        
        // ✅ Attach currencies to company
        $isFirst = true;
        foreach ($currencies as $currency) {
            $company->currencies()->attach($currency->id, [
                'is_default' => $isFirst,
                'is_active' => true,
            ]);
            $isFirst = false;
        }
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is deactivated'
                ], 401);
            }

            if (!$user->can_login) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account does not have login access'
                ], 401);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful!',
                'data' => [
                    'user' => $user->load('company'),
                    'token' => $token,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        try {
            $user = $request->user()->load(['company', 'company.currencies']);
            
            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 400);
            }

            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get company settings
     */
    public function getCompanySettings(Request $request)
    {
        try {
            $company = $request->user()->company()->with('currencies')->first();
            
            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'company' => $company,
                    'currencies' => $company->currencies,
                    'default_currency' => $company->defaultCurrency(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get company settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update company settings
     */
    public function updateCompanySettings(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:companies,email,' . $request->user()->company_id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
                'timezone' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $company = $request->user()->company;
            $company->update($request->only(['name', 'email', 'phone', 'address', 'timezone']));

            return response()->json([
                'success' => true,
                'message' => 'Company settings updated successfully',
                'data' => $company
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update company settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convert currency
     */
    public function convertCurrency(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0',
                'from_currency' => 'required|string|exists:currencies,code',
                'to_currency' => 'required|string|exists:currencies,code',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $fromCurrency = Currency::where('code', $request->from_currency)->first();
            $toCurrency = Currency::where('code', $request->to_currency)->first();

            $amount = floatval($request->amount);
            $convertedAmount = ($amount / $fromCurrency->exchange_rate) * $toCurrency->exchange_rate;

            return response()->json([
                'success' => true,
                'data' => [
                    'amount' => $amount,
                    'from_currency' => $fromCurrency,
                    'to_currency' => $toCurrency,
                    'converted_amount' => round($convertedAmount, 2),
                    'rate' => round($toCurrency->exchange_rate / $fromCurrency->exchange_rate, 4),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Currency conversion failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard stats
     */
    public function getDashboardStats(Request $request)
    {
        try {
            $companyId = $request->user()->company_id;
            
            $stats = [
                'staff' => User::where('company_id', $companyId)->where('role', 'staff')->count(),
                'customers' => User::where('company_id', $companyId)->where('role', 'customer')->count(),
                'saraf' => User::where('company_id', $companyId)->where('role', 'saraf')->count(),
                'total_users' => User::where('company_id', $companyId)->count(),
            ];

            // Get currency stats
            $company = Company::with('currencies')->find($companyId);
            $defaultCurrency = $company->defaultCurrency();
            
            $stats['currencies'] = [
                'total' => $company->currencies->count(),
                'default' => $defaultCurrency,
                'list' => $company->currencies->map(function ($currency) {
                    return [
                        'id' => $currency->id,
                        'code' => $currency->code,
                        'name' => $currency->name,
                        'symbol' => $currency->symbol,
                        'pivot' => $currency->pivot,
                    ];
                }),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get dashboard stats: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get company users
     */
    public function getCompanyUsers(Request $request)
    {
        try {
            $companyId = $request->user()->company_id;
            
            $users = User::where('company_id', $companyId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'address' => $user->address,
                        'role' => $user->role,
                        'is_active' => $user->is_active,
                        'can_login' => $user->can_login,
                        'created_at' => $user->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get company users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get company users by role
     */
    public function getCompanyUsersByRole(Request $request, $role)
    {
        try {
            $companyId = $request->user()->company_id;
            
            $users = User::where('company_id', $companyId)
                ->where('role', $role)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get users by role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create staff user
     */
    public function createStaff(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'role' => 'required|string|in:staff',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'staff',
                'company_id' => $request->user()->company_id,
                'phone' => $request->phone ?? null,
                'address' => $request->address ?? null,
                'is_active' => true,
                'can_login' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Staff created successfully',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create staff: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create customer user
     */
    public function createCustomer(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make(Str::random(12)),
                'role' => 'customer',
                'company_id' => $request->user()->company_id,
                'phone' => $request->phone ?? null,
                'address' => $request->address ?? null,
                'is_active' => true,
                'can_login' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create customer: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create Saraf user
     */
    public function createSaraf(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make(Str::random(12)),
                'role' => 'saraf',
                'company_id' => $request->user()->company_id,
                'phone' => $request->phone ?? null,
                'address' => $request->address ?? null,
                'is_active' => true,
                'can_login' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Saraf created successfully',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create saraf: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users by role (Admin only)
     */
    public function getUsersByRole(Request $request, $role = null)
    {
        try {
            $query = User::where('company_id', $request->user()->company_id);
            
            if ($role) {
                $query->where('role', $role);
            }

            $users = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user (Admin only)
     */
    public function updateUser(Request $request, $id)
    {
        try {
            $user = User::where('company_id', $request->user()->company_id)
                ->where('id', $id)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
                'role' => 'sometimes|string|in:admin,staff,customer,saraf',
                'is_active' => 'sometimes|boolean',
                'can_login' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->update($request->only(['name', 'email', 'phone', 'address', 'role', 'is_active', 'can_login']));

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user (Admin only)
     */
    public function deleteUser(Request $request, $id)
    {
        try {
            $user = User::where('company_id', $request->user()->company_id)
                ->where('id', $id)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            if ($user->role === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete admin user'
                ], 400);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete company user (Admin only)
     */
    public function deleteCompanyUser(Request $request, $id)
    {
        return $this->deleteUser($request, $id);
    }

    /**
     * Update company user (Admin only)
     */
    public function updateCompanyUser(Request $request, $id)
    {
        return $this->updateUser($request, $id);
    }

    /**
     * Get single company user
     */
    public function getCompanyUser(Request $request, $id)
    {
        try {
            $user = User::where('company_id', $request->user()->company_id)
                ->where('id', $id)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user: ' . $e->getMessage()
            ], 500);
        }
    }
}