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
            if (!Auth::user() || !Auth::user()->isAdmin()) {
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
            ]);

            $user = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'phone'      => $validated['phone'] ?? null,
                'password'   => Hash::make($validated['password']),
                'role'       => 'staff',
                'created_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Staff created successfully.',
                'user'    => $user->only(['id', 'name', 'email', 'role']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Staff creation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Create Customer user (Admin only)
    public function createCustomer(Request $request)
    {
        try {
            if (!Auth::user() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only admin can create customers.'
                ], 403);
            }

            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'phone'    => 'nullable|string|max:20',
                // Customer doesn't need password (they don't login)
            ]);

            $user = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'phone'      => $validated['phone'] ?? null,
                'password'   => Hash::make('customer123'), // Default password
                'role'       => 'customer',
                'created_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully.',
                'user'    => $user->only(['id', 'name', 'email', 'role']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Customer creation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Create Saraf user (Admin only)
    public function createSaraf(Request $request)
    {
        try {
            if (!Auth::user() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only admin can create saraf.'
                ], 403);
            }

            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'phone'    => 'nullable|string|max:20',
                // Saraf doesn't need password (they don't login)
            ]);

            $user = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'phone'      => $validated['phone'] ?? null,
                'password'   => Hash::make('saraf123'), // Default password
                'role'       => 'saraf',
                'created_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Saraf created successfully.',
                'user'    => $user->only(['id', 'name', 'email', 'role']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Saraf creation failed: ' . $e->getMessage(),
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
                'user'    => $user->only(['id', 'name', 'email', 'role']),
                'message' => 'Login successful!'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Get all users created by admin
    public function getUsers()
    {
        try {
            if (!Auth::user() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.'
                ], 403);
            }

            $users = User::where('created_by', Auth::id())
                ->orWhere('id', Auth::id())
                ->with('creator')
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