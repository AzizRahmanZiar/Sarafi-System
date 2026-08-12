<?php
// app/Http/Controllers/TransactionController.php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Get a single transaction
     */
    public function show($id)
    {
        try {
            $transaction = Transaction::with(['user', 'currency'])->find($id);
            
            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }

            $currentUser = auth()->user();
            if ($currentUser->role !== 'admin' && $currentUser->id !== $transaction->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this transaction'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $transaction
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a transaction
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.01',
                'type' => 'required|in:deposit,withdrawal,transfer,fee,refund',
                'description' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $transaction = Transaction::find($id);
            
            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }

            $currentUser = auth()->user();
            if ($currentUser->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this transaction'
                ], 403);
            }

            $oldAmount = $transaction->amount;
            $newAmount = floatval($request->amount);
            $amountDiff = $newAmount - $oldAmount;

            DB::transaction(function () use ($transaction, $amountDiff, $request) {
                // Update transaction
                $transaction->amount = $newAmount;
                $transaction->type = $request->type;
                $transaction->description = $request->description ?? $transaction->description;
                
                // Update balance_after for this transaction
                if ($transaction->type === 'deposit' || $transaction->type === 'refund') {
                    $transaction->balance_after = $transaction->balance_after + $amountDiff;
                } else {
                    $transaction->balance_after = $transaction->balance_after - $amountDiff;
                }
                $transaction->save();

                // Update all subsequent transactions for this user and currency
                $subsequentTransactions = Transaction::forUser($transaction->user_id)
                    ->where('currency_id', $transaction->currency_id)
                    ->where(function ($query) use ($transaction) {
                        $query->where('created_at', '>', $transaction->created_at)
                              ->orWhere(function ($q) use ($transaction) {
                                  $q->where('created_at', '=', $transaction->created_at)
                                    ->where('id', '>', $transaction->id);
                              });
                    })
                    ->orderBy('created_at', 'asc')
                    ->orderBy('id', 'asc')
                    ->get();

                foreach ($subsequentTransactions as $subTx) {
                    if ($subTx->type === 'deposit' || $subTx->type === 'refund') {
                        $subTx->balance_after = $subTx->balance_after + $amountDiff;
                    } else {
                        $subTx->balance_after = $subTx->balance_after - $amountDiff;
                    }
                    $subTx->save();
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Transaction updated successfully',
                'data' => $transaction->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a transaction
     */
    public function destroy($id)
    {
        try {
            $transaction = Transaction::find($id);
            
            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }

            $currentUser = auth()->user();
            if ($currentUser->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this transaction'
                ], 403);
            }

            $amount = $transaction->amount;
            $isPositive = $transaction->type === 'deposit' || $transaction->type === 'refund';
            
            DB::transaction(function () use ($transaction, $amount, $isPositive) {
                // Get all subsequent transactions for this user and currency
                $subsequentTransactions = Transaction::forUser($transaction->user_id)
                    ->where('currency_id', $transaction->currency_id)
                    ->where(function ($query) use ($transaction) {
                        $query->where('created_at', '>', $transaction->created_at)
                              ->orWhere(function ($q) use ($transaction) {
                                  $q->where('created_at', '=', $transaction->created_at)
                                    ->where('id', '>', $transaction->id);
                              });
                    })
                    ->orderBy('created_at', 'asc')
                    ->orderBy('id', 'asc')
                    ->get();

                // Reverse the effect of the transaction on subsequent balances
                foreach ($subsequentTransactions as $subTx) {
                    if ($isPositive) {
                        $subTx->balance_after = $subTx->balance_after - $amount;
                    } else {
                        $subTx->balance_after = $subTx->balance_after + $amount;
                    }
                    $subTx->save();
                }

                $transaction->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Transaction deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete transaction: ' . $e->getMessage()
            ], 500);
        }
    }
}