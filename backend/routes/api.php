<?php
// routes/api.php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserAccountController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================

Route::middleware(['auth:sanctum'])->group(function () {
    
    // ============================================
    // AUTHENTICATION ROUTES
    // ============================================
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // ============================================
    // COMPANY SETTINGS
    // ============================================
    Route::get('/company-settings', [AuthController::class, 'getCompanySettings']);
    Route::put('/company-settings', [AuthController::class, 'updateCompanySettings']);
    
    // ============================================
    // PASSWORD MANAGEMENT
    // ============================================
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    
    // ============================================
    // CURRENCY CONVERSION
    // ============================================
    Route::post('/convert-currency', [AuthController::class, 'convertCurrency']);
    
    // ============================================
    // DASHBOARD STATS - Admin & Staff
    // ============================================
    Route::get('/dashboard-stats', [AuthController::class, 'getDashboardStats']);
    
    // ============================================
    // COMPANY USERS - Admin & Staff (view only)
    // ============================================
    Route::get('/company-users', [AuthController::class, 'getCompanyUsers']);
    Route::get('/company-users/{role}', [AuthController::class, 'getCompanyUsersByRole']);
    
    // ============================================
    // NOTIFICATIONS ROUTES
    // ============================================
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        
        // These must come BEFORE the {id} routes
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/read/all', [NotificationController::class, 'deleteAllRead']);
        
        // These {id} routes must come AFTER specific routes
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        
        // Admin only
        Route::middleware(['admin'])->group(function () {
            Route::post('/create', [NotificationController::class, 'store']);
            Route::post('/broadcast', [NotificationController::class, 'broadcastToCompany']);
            Route::post('/broadcast/staff', [NotificationController::class, 'broadcastToStaff']);
            Route::post('/broadcast/admins', [NotificationController::class, 'broadcastToAdmins']);
        });
    });
    
    // ============================================
    // CURRENCY MANAGEMENT ROUTES
    // ============================================
    Route::prefix('currencies')->group(function () {
        Route::get('/', [CurrencyController::class, 'index']);
        Route::get('/settings', [CurrencyController::class, 'getSettings']);
        Route::get('/stats', [CurrencyController::class, 'getStats']);
        Route::get('/company', [CurrencyController::class, 'companyCurrencies']);
        Route::get('/available', [CurrencyController::class, 'available']);
        
        Route::middleware(['admin'])->group(function () {
            Route::post('/create', [CurrencyController::class, 'store']);
            Route::get('/{id}', [CurrencyController::class, 'show']);
            Route::put('/{id}', [CurrencyController::class, 'update']);
            Route::delete('/{id}', [CurrencyController::class, 'destroy']);
            Route::post('/add', [CurrencyController::class, 'addToCompany']);
            Route::post('/bulk-add', [CurrencyController::class, 'bulkAddToCompany']);
            Route::delete('/remove/{currencyId}', [CurrencyController::class, 'removeFromCompany']);
            Route::put('/{currencyId}/default', [CurrencyController::class, 'setDefault']);
            Route::put('/{currencyId}/exchange-rate', [CurrencyController::class, 'updateExchangeRate']);
        });
    });
    
    // ============================================
    // USER MANAGEMENT ROUTES
    // ============================================
    Route::middleware(['admin'])->group(function () {
        Route::post('/create-staff', [AuthController::class, 'createStaff']);
        Route::get('/users/{role?}', [AuthController::class, 'getUsersByRole']);
        Route::put('/users/{id}', [AuthController::class, 'updateUser']);
        Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
        Route::delete('/company-users/{id}', [AuthController::class, 'deleteCompanyUser']);
        Route::put('/company-users/{id}', [AuthController::class, 'updateCompanyUser']);
        Route::get('/company-users/{id}', [AuthController::class, 'getCompanyUser']);
    });
    
    Route::middleware(['admin_or_staff'])->group(function () {
        Route::post('/create-customer', [AuthController::class, 'createCustomer']);
        Route::post('/create-saraf', [AuthController::class, 'createSaraf']);
    });
});

// ============================================
// USER ACCOUNT ROUTES - Admin only
// ============================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('users')->group(function () {
    Route::get('/{id}', [UserAccountController::class, 'getUser']);
    Route::get('/{id}/balance', [UserAccountController::class, 'getBalance']);
    Route::get('/{id}/transactions', [UserAccountController::class, 'getTransactions']);
    Route::get('/{id}/summary', [UserAccountController::class, 'getSummary']);
    Route::post('/{id}/add-money', [UserAccountController::class, 'addMoney']);
    Route::post('/{id}/withdraw-money', [UserAccountController::class, 'withdrawMoney']);
});

// ============================================
// TRANSACTION ROUTES - Admin only
// ============================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('transactions')->group(function () {
    Route::get('/{id}', [TransactionController::class, 'show']);
    Route::put('/{id}', [TransactionController::class, 'update']);
    Route::delete('/{id}', [TransactionController::class, 'destroy']);
});