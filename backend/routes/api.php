<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CurrencyController; // Add this import

// Public routes (no authentication required)
Route::post('/register-admin', [AuthController::class, 'registerAdmin']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Admin only routes
    Route::post('/create-staff', [AuthController::class, 'createStaff']);
    Route::post('/create-customer', [AuthController::class, 'createCustomer']);
    Route::post('/create-saraf', [AuthController::class, 'createSaraf']);

    Route::put('/users/{id}', [AuthController::class, 'updateUser']);
    Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
    
    // User listing routes
    Route::get('/users', [AuthController::class, 'getUsers']);
    Route::get('/my-users', [AuthController::class, 'getMyUsers']);
    Route::get('/users/{role}', [AuthController::class, 'getUsersByRole']);

    // Permission routes
    Route::get('/users/{id}/permissions', [AuthController::class, 'getUserPermissions']);
    Route::put('/users/{id}/permissions', [AuthController::class, 'updateUserPermissions']);

    // ==============================================
    // Currency Management Routes (Admin only)
    // ==============================================
    Route::get('/currencies', [CurrencyController::class, 'index']);
    Route::get('/currencies/default', [CurrencyController::class, 'getDefault']);
    Route::get('/currencies/{currency}', [CurrencyController::class, 'show']);
    Route::post('/currencies', [CurrencyController::class, 'store']);
    Route::put('/currencies/{currency}', [CurrencyController::class, 'update']);
    Route::delete('/currencies/{currency}', [CurrencyController::class, 'destroy']);
    Route::patch('/currencies/{currency}/default', [CurrencyController::class, 'setDefault']);
});