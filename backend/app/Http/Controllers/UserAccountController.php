<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserAccountController extends Controller
{
    public function getUser($id)
    {
        try {
            $user = User::with(['company'])->find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $currentUser = auth()->user();
            if ($currentUser->role !== 'admin' && $currentUser->id != $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this user'
                ], 403);
            }

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

    public function getBalance(Request $request, $id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $currentUser = auth()->user();
            if ($currentUser->role !== 'admin' && $currentUser->id != $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this balance'
                ], 403);
            }

            $currencyId = $request->get('currency_id');
            $allBalances = $user->getAllBalances();
            
            $defaultCurrency = Currency::whereHas('companies', function($query) use ($user) {
                $query->where('company_id', $user->company_id);
            })->first();

            if (!$defaultCurrency) {
                $defaultCurrency = Currency::first();
            }

            if ($currencyId) {
                $balance = $user->getBalanceForCurrency($currencyId);
                $currency = Currency::find($currencyId);
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'balance' => $balance,
                        'currency' => $currency ?: $defaultCurrency,
                        'all_balances' => $allBalances
                    ]
                ]);
            }

            $balance = $user->getBalanceForCurrency($defaultCurrency->id);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'balance' => $balance,
                    'currency' => $defaultCurrency,
                    'all_balances' => $allBalances
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch balance: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTransactions(Request $request, $id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $currentUser = auth()->user();
            if ($currentUser->role !== 'admin' && $currentUser->id != $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view these transactions'
                ], 403);
            }

            $query = Transaction::forUser($id)->with('currency');

            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            if ($request->has('currency_id') && $request->currency_id) {
                $query->where('currency_id', $request->currency_id);
            }

            if ($request->has('currency_code') && $request->currency_code) {
                $query->where('currency_code', $request->currency_code);
            }

            if ($request->has('start_date')) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            $perPage = $request->get('per_page', 50);
            $transactions = $query->orderBy('created_at', 'desc')->paginate($perPage);

            $allBalances = $user->getAllBalances();

            $perCurrencyStats = Transaction::forUser($id)
                ->completed()
                ->select(
                    'currency_id',
                    'currency_code',
                    DB::raw('SUM(CASE WHEN type = "deposit" THEN amount ELSE 0 END) as total_deposits'),
                    DB::raw('SUM(CASE WHEN type = "withdrawal" THEN amount ELSE 0 END) as total_withdrawals'),
                    DB::raw('COUNT(CASE WHEN type = "deposit" THEN 1 END) as deposit_count'),
                    DB::raw('COUNT(CASE WHEN type = "withdrawal" THEN 1 END) as withdrawal_count'),
                    DB::raw('COUNT(*) as transaction_count')
                )
                ->groupBy('currency_id', 'currency_code')
                ->get()
                ->map(function($item) use ($allBalances) {
                    return [
                        'currency_id' => $item->currency_id,
                        'currency_code' => $item->currency_code,
                        'balance' => $allBalances[$item->currency_code] ?? 0,
                        'total_deposits' => floatval($item->total_deposits),
                        'total_withdrawals' => floatval($item->total_withdrawals),
                        'deposit_count' => intval($item->deposit_count),
                        'withdrawal_count' => intval($item->withdrawal_count),
                        'transaction_count' => intval($item->transaction_count),
                    ];
                });

            $totalStats = [
                'total_deposits' => $perCurrencyStats->sum('total_deposits'),
                'total_withdrawals' => $perCurrencyStats->sum('total_withdrawals'),
                'deposit_count' => $perCurrencyStats->sum('deposit_count'),
                'withdrawal_count' => $perCurrencyStats->sum('withdrawal_count'),
                'transaction_count' => $perCurrencyStats->sum('transaction_count'),
            ];

            return response()->json([
                'success' => true,
                'data' => $transactions->items(),
                'meta' => [
                    'total' => $transactions->total(),
                    'per_page' => $transactions->perPage(),
                    'current_page' => $transactions->currentPage(),
                    'last_page' => $transactions->lastPage(),
                ],
                'stats' => [
                    'per_currency' => $perCurrencyStats,
                    'all_balances' => $allBalances,
                    'totals' => $totalStats
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transactions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ FIXED: Add money to user's account
     */
    public function addMoney(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.01',
                'currency_id' => 'required|exists:currencies,id',
                'description' => 'nullable|string|max:255',
                'reference' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $currentUser = auth()->user();
            if ($currentUser->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to add money'
                ], 403);
            }

            $currency = Currency::find($request->currency_id);
            
            // ✅ Ensure currency belongs to the user's company
            $companyCurrency = $user->company->currencies()
                ->where('currencies.id', $currency->id)
                ->first();
                
            if (!$companyCurrency) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency not available for this company'
                ], 400);
            }

            $amount = floatval($request->amount);
            $description = $request->description ?? 'Deposit';

            // Get current balance
            $currentBalance = $user->getBalanceForCurrency($currency->id);
            $newBalance = $currentBalance + $amount;

            // ✅ Create transaction with proper decimal formatting
            $transaction = Transaction::create([
                'user_id' => $id,
                'currency_id' => $currency->id,
                'type' => 'deposit',
                'amount' => $amount, // This will be formatted by the mutator
                'balance_after' => $newBalance,
                'currency_code' => $currency->code,
                'description' => $description,
                'reference' => $request->reference ?? 'ADMIN_DEPOSIT_' . time(),
                'status' => 'completed',
                'metadata' => [
                    'performed_by' => $currentUser->id,
                    'performed_by_name' => $currentUser->name,
                    'performed_at' => now()->toISOString(),
                ]
            ]);

            $allBalances = $user->getAllBalances();

            return response()->json([
                'success' => true,
                'message' => "Added {$amount} {$currency->code} successfully",
                'data' => [
                    'balance' => $newBalance,
                    'currency' => $currency,
                    'all_balances' => $allBalances,
                    'transaction' => $transaction->load('currency')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add money: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ FIXED: Withdraw money from user's account
     */
    public function withdrawMoney(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.01',
                'currency_id' => 'required|exists:currencies,id',
                'description' => 'nullable|string|max:255',
                'reference' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $currentUser = auth()->user();
            if ($currentUser->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to withdraw money'
                ], 403);
            }

            $currency = Currency::find($request->currency_id);
            
            // ✅ Ensure currency belongs to the user's company
            $companyCurrency = $user->company->currencies()
                ->where('currencies.id', $currency->id)
                ->first();
                
            if (!$companyCurrency) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency not available for this company'
                ], 400);
            }

            $amount = floatval($request->amount);
            $currentBalance = $user->getBalanceForCurrency($currency->id);

            if ($currentBalance < $amount) {
                return response()->json([
                    'success' => false,
                    'message' => "Insufficient balance in {$currency->code}",
                    'data' => [
                        'current_balance' => $currentBalance,
                        'requested_amount' => $amount,
                        'currency' => $currency->code,
                        'difference' => $amount - $currentBalance,
                        'all_balances' => $user->getAllBalances()
                    ]
                ], 400);
            }

            $newBalance = $currentBalance - $amount;
            $description = $request->description ?? 'Withdrawal';

            // ✅ Create transaction with proper decimal formatting
            $transaction = Transaction::create([
                'user_id' => $id,
                'currency_id' => $currency->id,
                'type' => 'withdrawal',
                'amount' => $amount,
                'balance_after' => $newBalance,
                'currency_code' => $currency->code,
                'description' => $description,
                'reference' => $request->reference ?? 'ADMIN_WITHDRAWAL_' . time(),
                'status' => 'completed',
                'metadata' => [
                    'performed_by' => $currentUser->id,
                    'performed_by_name' => $currentUser->name,
                    'performed_at' => now()->toISOString(),
                ]
            ]);

            $allBalances = $user->getAllBalances();

            return response()->json([
                'success' => true,
                'message' => "Withdrew {$amount} {$currency->code} successfully",
                'data' => [
                    'balance' => $newBalance,
                    'currency' => $currency,
                    'all_balances' => $allBalances,
                    'transaction' => $transaction->load('currency')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to withdraw money: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSummary($id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $allBalances = $user->getAllBalances();
            
            $perCurrencyStats = Transaction::forUser($id)
                ->completed()
                ->select(
                    'currency_code',
                    DB::raw('COUNT(*) as total_transactions'),
                    DB::raw('SUM(CASE WHEN type = "deposit" THEN amount ELSE 0 END) as total_deposits'),
                    DB::raw('SUM(CASE WHEN type = "withdrawal" THEN amount ELSE 0 END) as total_withdrawals'),
                    DB::raw('COUNT(CASE WHEN type = "deposit" THEN 1 END) as deposit_count'),
                    DB::raw('COUNT(CASE WHEN type = "withdrawal" THEN 1 END) as withdrawal_count')
                )
                ->groupBy('currency_code')
                ->get()
                ->map(function($item) use ($allBalances) {
                    return [
                        'currency_code' => $item->currency_code,
                        'balance' => $allBalances[$item->currency_code] ?? 0,
                        'total_transactions' => intval($item->total_transactions),
                        'total_deposits' => floatval($item->total_deposits),
                        'total_withdrawals' => floatval($item->total_withdrawals),
                        'deposit_count' => intval($item->deposit_count),
                        'withdrawal_count' => intval($item->withdrawal_count),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'per_currency' => $perCurrencyStats,
                    'all_balances' => $allBalances,
                    'totals' => [
                        'total_transactions' => $perCurrencyStats->sum('total_transactions'),
                        'total_deposits' => $perCurrencyStats->sum('total_deposits'),
                        'total_withdrawals' => $perCurrencyStats->sum('total_withdrawals'),
                        'deposit_count' => $perCurrencyStats->sum('deposit_count'),
                        'withdrawal_count' => $perCurrencyStats->sum('withdrawal_count'),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch summary: ' . $e->getMessage()
            ], 500);
        }
    }
}