<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    // Register first Admin (no authentication required)
    public function registerAdmin(Request $request)
    {
        try {
            // Check if any admin already exists
            $adminExists = User::where('role', 'admin')->exists();
            if ($adminExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin already registered. Please login.'
                ], 403);
            }

            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'phone'    => 'nullable|string|max:20',
                'password' => 'required|string|min:6|confirmed',
            ]);

            $user = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'phone'      => $validated['phone'] ?? null,
                'password'   => Hash::make($validated['password']),
                'role'       => 'admin',
                'permissions' => ['create_customer', 'create_saraf', 'create_staff'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin registered successfully. Please login.',
                'user'    => $user->only(['id', 'name', 'email', 'role']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Create Staff user (Admin only)
    public function createStaff(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Only admin can create staff
            if (!$user || !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only admin can create staff.'
                ], 403);
            }

            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'phone'    => 'nullable|string|max:20',
                'password' => 'required|string|min:6',
                'permissions' => 'nullable|array',
                'permissions.*' => 'string|in:create_customer,create_saraf'
            ]);

            $staff = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'phone'      => $validated['phone'] ?? null,
                'password'   => Hash::make($validated['password']),
                'role'       => 'staff',
                'created_by' => Auth::id(),
                'permissions' => $validated['permissions'] ?? [],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Staff created successfully.',
                'user'    => $staff->only(['id', 'name', 'email', 'role', 'permissions']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Staff creation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Create Customer user (Admin or Staff with permission)
    public function createCustomer(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Check if user has permission
            if (!$user || (!$user->isAdmin() && !$user->hasPermission('create_customer'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. You don\'t have permission to create customers.'
                ], 403);
            }

            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'phone'    => 'nullable|string|max:20',
            ]);

            $customer = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'phone'      => $validated['phone'] ?? null,
                'password'   => Hash::make('customer123'),
                'role'       => 'customer',
                'created_by' => Auth::id(),
                'permissions' => [],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully.',
                'user'    => $customer->only(['id', 'name', 'email', 'role']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Customer creation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Create Saraf user (Admin or Staff with permission)
    public function createSaraf(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Check if user has permission
            if (!$user || (!$user->isAdmin() && !$user->hasPermission('create_saraf'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. You don\'t have permission to create saraf users.'
                ], 403);
            }

            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'phone'    => 'nullable|string|max:20',
            ]);

            $saraf = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'phone'      => $validated['phone'] ?? null,
                'password'   => Hash::make('saraf123'),
                'role'       => 'saraf',
                'created_by' => Auth::id(),
                'permissions' => [],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Saraf created successfully.',
                'user'    => $saraf->only(['id', 'name', 'email', 'role']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Saraf creation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Update user permissions (Admin only)
    public function updateUserPermissions(Request $request, $id)
    {
        try {
            if (!Auth::user() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only admin can update permissions.'
                ], 403);
            }

            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.'
                ], 404);
            }

            // Only staff can have permissions
            if ($user->role !== 'staff') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only staff users can have permissions.'
                ], 422);
            }

            $validated = $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'string|in:create_customer,create_saraf'
            ]);

            $user->permissions = $validated['permissions'];
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Permissions updated successfully.',
                'permissions' => $user->permissions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Update failed: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get user permissions (Admin only)
    public function getUserPermissions($id)
    {
        try {
            if (!Auth::user() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.'
                ], 403);
            }

            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'permissions' => $user->permissions ?? []
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch permissions: ' . $e->getMessage()
            ], 500);
        }
    }

    // Update user (Admin only)
    public function updateUser(Request $request, $id)
    {
        try {
            if (!Auth::user() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.'
                ], 403);
            }

            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.'
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'password' => 'nullable|string|min:6',
                'role' => 'required|in:admin,staff,customer,saraf'
            ]);

            $user->name = $validated['name'];
            $user->email = $validated['email'];
            $user->phone = $validated['phone'] ?? null;
            $user->role = $validated['role'];
            
            if (!empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully.',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Update failed: ' . $e->getMessage()
            ], 500);
        }
    }

    // Delete user (Admin only)
    public function deleteUser($id)
    {
        try {
            if (!Auth::user() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.'
                ], 403);
            }

            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.'
                ], 404);
            }

            // Prevent deleting yourself
            if ($user->id === Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot delete your own account.'
                ], 403);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage()
            ], 500);
        }
    }

    // Login - Only Admin and Staff
    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'email'    => 'required|email',
                'password' => 'required|string',
            ]);

            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The provided credentials are incorrect.'
                ], 401);
            }

            /** @var User $user */
            $user = Auth::user();

            // Only admin and staff can login
            if (!$user->isAdmin() && !$user->isStaff()) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Only admin and staff can login.'
                ], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'token'   => $token,
                'user'    => $user->only(['id', 'name', 'email', 'role', 'permissions']),
                'message' => 'Login successful!'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Get all users - Modified to allow staff to see their created users
    public function getUsers()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.'
                ], 401);
            }

            // Admin can see all users they created
            if ($user->isAdmin()) {
                $users = User::where('created_by', Auth::id())
                    ->orWhere('id', Auth::id())
                    ->with('creator')
                    ->get();
            } 
            // Staff can see users they created (customers and saraf) plus themselves
            else if ($user->isStaff()) {
                $users = User::where('created_by', Auth::id())
                    ->whereIn('role', ['customer', 'saraf'])
                    ->with('creator')
                    ->get();
                
                // Also include the staff member themselves
                $staffUser = User::where('id', Auth::id())->with('creator')->first();
                if ($staffUser) {
                    $users = $users->push($staffUser);
                }
            } 
            // Other roles cannot access
            else {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. You don\'t have permission to view users.'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'users' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get users created by staff (only customers and saraf)
    public function getMyUsers()
    {
        try {
            $user = Auth::user();
            
            if (!$user || !$user->isStaff()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.'
                ], 403);
            }

            $users = User::where('created_by', Auth::id())
                ->whereIn('role', ['customer', 'saraf'])
                ->with('creator')
                ->get();

            // Also include the staff member themselves
            $staffUser = User::where('id', Auth::id())->with('creator')->first();
            if ($staffUser) {
                $users = $users->push($staffUser);
            }

            return response()->json([
                'success' => true,
                'users' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get users by role
    public function getUsersByRole($role)
    {
        try {
            if (!Auth::user() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.'
                ], 403);
            }

            $users = User::where('role', $role)
                ->where('created_by', Auth::id())
                ->get();

            return response()->json([
                'success' => true,
                'users' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users: ' . $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            /** @var User $user */
            $user = Auth::user();
            if ($user) {
                $user->currentAccessToken()->delete();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed: ' . $e->getMessage()
            ], 500);
        }
    }
}