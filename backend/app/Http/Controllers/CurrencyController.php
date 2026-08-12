<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CurrencyController extends Controller
{
    /**
     * Get all currencies for the authenticated company
     */
    public function index(Request $request)
    {
        try {
            $company = Company::with('currencies')->find($request->user()->company_id);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'currencies' => $company->currencies,
                    'default_currency' => $company->defaultCurrency(),
                    'total_currencies' => $company->currencies->count()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch currencies: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all available currencies in the system (for selection)
     * Returns both system currencies and company-specific currencies
     * No pre-seeding required - currencies are created during registration
     */
    public function available(Request $request)
    {
        try {
            $companyId = $request->user() ? $request->user()->company_id : null;
            
            // Get all active currencies (system + company specific)
            $currencies = Currency::where('is_active', true)
                ->where(function($query) use ($companyId) {
                    $query->where('is_system', true)
                          ->orWhere('company_id', $companyId);
                })
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $currencies->map(function ($currency) {
                    return [
                        'id' => $currency->id,
                        'code' => $currency->code,
                        'name' => $currency->name,
                        'symbol' => $currency->symbol,
                        'exchange_rate' => $currency->exchange_rate,
                        'is_system' => $currency->is_system ?? false,
                        'company_id' => $currency->company_id,
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch available currencies: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get only system currencies (pre-defined) - May be empty
     */
    public function systemCurrencies(Request $request)
    {
        try {
            $currencies = Currency::where('is_active', true)
                                 ->where('is_system', true)
                                 ->get();
            
            return response()->json([
                'success' => true,
                'data' => $currencies
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch system currencies: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get company-specific currencies (custom created by company)
     */
    public function companyCurrencies(Request $request)
    {
        try {
            $companyId = $request->user()->company_id;
            
            $currencies = Currency::where('is_active', true)
                                 ->where('company_id', $companyId)
                                 ->where('is_system', false)
                                 ->get();
            
            return response()->json([
                'success' => true,
                'data' => $currencies
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch company currencies: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new custom currency (Company-specific)
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:10',
                'name' => 'required|string|max:255',
                'symbol' => 'required|string|max:10',
                'exchange_rate' => 'nullable|numeric|min:0.0001',
                'is_default' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $companyId = $request->user()->company_id;
            $code = strtoupper($request->code);

            // Check if currency already exists for this company
            $existing = Currency::where('code', $code)
                ->where(function($query) use ($companyId) {
                    $query->where('company_id', $companyId)
                          ->orWhere('is_system', true);
                })
                ->first();
            
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency with code "' . $code . '" already exists'
                ], 400);
            }

            // Create currency
            $currency = Currency::create([
                'code' => $code,
                'name' => $request->name,
                'symbol' => $request->symbol,
                'exchange_rate' => $request->exchange_rate ?? 1.0000,
                'is_active' => true,
                'is_system' => false,
                'company_id' => $companyId,
                'created_by' => $request->user()->id,
            ]);

            // Add to company's currency list
            $company = Company::find($companyId);
            
            // If this is the first currency or set as default
            $isFirstCurrency = $company->currencies()->count() === 0;
            $isDefault = $request->is_default ?? $isFirstCurrency;

            if ($isDefault) {
                // Remove default from all other currencies
                $company->currencies()->updateExistingPivot(
                    $company->currencies()->wherePivot('is_default', true)->pluck('currencies.id')->toArray(),
                    ['is_default' => false]
                );
            }

            $company->currencies()->attach($currency->id, [
                'is_default' => $isDefault,
                'is_active' => true,
            ]);

            $company->load('currencies');

            return response()->json([
                'success' => true,
                'message' => 'Currency created successfully',
                'data' => [
                    'currency' => $currency,
                    'currencies' => $company->currencies,
                    'default_currency' => $company->defaultCurrency()
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create currency: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific currency
     */
    public function show(Request $request, $id)
    {
        try {
            $companyId = $request->user()->company_id;
            
            $currency = Currency::where(function($query) use ($companyId) {
                $query->where('is_system', true)
                      ->orWhere('company_id', $companyId);
            })->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $currency
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Currency not found'
            ], 404);
        }
    }

    /**
     * Update a currency (Company-specific only)
     */
    public function update(Request $request, $id)
    {
        try {
            $companyId = $request->user()->company_id;
            
            $currency = Currency::where('company_id', $companyId)
                               ->where('is_system', false)
                               ->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'code' => [
                    'sometimes',
                    'string',
                    'max:10',
                    Rule::unique('currencies', 'code')->where(function($query) use ($companyId) {
                        return $query->where('company_id', $companyId);
                    })->ignore($id)
                ],
                'name' => 'sometimes|string|max:255',
                'symbol' => 'sometimes|string|max:10',
                'exchange_rate' => 'nullable|numeric|min:0.0001',
                'is_active' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only(['code', 'name', 'symbol', 'exchange_rate', 'is_active']);
            if (isset($data['code'])) {
                $data['code'] = strtoupper($data['code']);
            }

            $currency->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Currency updated successfully',
                'data' => $currency
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update currency: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a currency (Company-specific only)
     */
    public function destroy(Request $request, $id)
    {
        try {
            $companyId = $request->user()->company_id;
            
            $currency = Currency::where('company_id', $companyId)
                               ->where('is_system', false)
                               ->findOrFail($id);

            // Check if currency is being used by the company
            $company = Company::find($companyId);
            
            // Check if it's the default currency
            if ($company->currencies()->where('currency_id', $id)->wherePivot('is_default', true)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete default currency. Set another currency as default first.'
                ], 400);
            }

            // Check if it's the only currency
            if ($company->currencies()->count() <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete the only currency. Add another currency first.'
                ], 400);
            }

            // Detach from company
            $company->currencies()->detach($id);
            
            // Delete the currency
            $currency->delete();

            $company->load('currencies');

            return response()->json([
                'success' => true,
                'message' => 'Currency deleted successfully',
                'data' => [
                    'currencies' => $company->currencies,
                    'default_currency' => $company->defaultCurrency()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete currency: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add existing system currency to company
     */
    public function addToCompany(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'currency_id' => 'required|exists:currencies,id',
                'is_default' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $company = Company::find($request->user()->company_id);
            
            // Check if currency already exists
            if ($company->currencies()->where('currency_id', $request->currency_id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency already added to your company'
                ], 400);
            }

            // If this is the first currency, make it default
            $isFirstCurrency = $company->currencies()->count() === 0;
            $isDefault = $request->is_default ?? $isFirstCurrency;

            // If setting as default, remove default from others
            if ($isDefault) {
                $company->currencies()->updateExistingPivot(
                    $company->currencies()->wherePivot('is_default', true)->pluck('currencies.id')->toArray(),
                    ['is_default' => false]
                );
            }

            $company->currencies()->attach($request->currency_id, [
                'is_default' => $isDefault,
                'is_active' => true,
            ]);

            $company->load('currencies');

            return response()->json([
                'success' => true,
                'message' => 'Currency added successfully',
                'data' => [
                    'currencies' => $company->currencies,
                    'default_currency' => $company->defaultCurrency()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add currency: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove currency from company
     */
    public function removeFromCompany(Request $request, $currencyId)
    {
        try {
            $company = Company::find($request->user()->company_id);
            
            // Check if currency exists in company
            $currency = $company->currencies()->where('currency_id', $currencyId)->first();
            if (!$currency) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency not found in your company'
                ], 404);
            }

            // Check if it's the default currency
            if ($currency->pivot->is_default) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot remove default currency. Set another currency as default first.'
                ], 400);
            }

            // Check if it's the only currency
            if ($company->currencies()->count() <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot remove the only currency. Add another currency first.'
                ], 400);
            }

            $company->currencies()->detach($currencyId);

            $company->load('currencies');

            return response()->json([
                'success' => true,
                'message' => 'Currency removed successfully',
                'data' => [
                    'currencies' => $company->currencies,
                    'default_currency' => $company->defaultCurrency()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove currency: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set default currency
     */
    public function setDefault(Request $request, $currencyId)
    {
        try {
            $company = Company::find($request->user()->company_id);
            
            // Check if currency belongs to company
            if (!$company->currencies()->where('currencies.id', $currencyId)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency not found in your company'
                ], 404);
            }

            // Remove default from all
            $defaultCurrency = $company->currencies()
                ->wherePivot('is_default', true)
                ->first();
            
            if ($defaultCurrency) {
                $company->currencies()->updateExistingPivot(
                    $defaultCurrency->id,
                    ['is_default' => false]
                );
            }

            // Set new default
            $company->currencies()->updateExistingPivot($currencyId, ['is_default' => true]);

            $company->load('currencies');

            return response()->json([
                'success' => true,
                'message' => 'Default currency updated successfully',
                'data' => [
                    'currencies' => $company->currencies,
                    'default_currency' => $company->defaultCurrency()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to set default currency: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update exchange rate for a currency
     */
    public function updateExchangeRate(Request $request, $currencyId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'exchange_rate' => 'required|numeric|min:0.0001',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $companyId = $request->user()->company_id;
            
            $currency = Currency::where(function($query) use ($companyId) {
                $query->where('is_system', true)
                      ->orWhere('company_id', $companyId);
            })->findOrFail($currencyId);

            $currency->update([
                'exchange_rate' => $request->exchange_rate
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Exchange rate updated successfully',
                'data' => $currency
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update exchange rate: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get company currency settings
     */
    public function getSettings(Request $request)
    {
        try {
            $company = Company::with('currencies')->find($request->user()->company_id);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'currencies' => $company->currencies,
                    'default_currency' => $company->defaultCurrency(),
                    'total_currencies' => $company->currencies->count(),
                    'can_add_more' => true,
                    'system_currencies' => Currency::where('is_system', true)->where('is_active', true)->count(),
                    'custom_currencies' => Currency::where('company_id', $company->id)->where('is_system', false)->count(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get currency settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get currency statistics for company
     */
    public function getStats(Request $request)
    {
        try {
            $company = Company::with('currencies')->find($request->user()->company_id);
            
            $stats = [
                'total_currencies' => $company->currencies->count(),
                'system_currencies' => Currency::where('is_system', true)->where('is_active', true)->count(),
                'custom_currencies' => Currency::where('company_id', $company->id)->where('is_system', false)->count(),
                'default_currency' => $company->defaultCurrency(),
                'currency_list' => $company->currencies->map(function ($currency) {
                    return [
                        'id' => $currency->id,
                        'code' => $currency->code,
                        'name' => $currency->name,
                        'symbol' => $currency->symbol,
                        'is_default' => $currency->pivot->is_default,
                        'exchange_rate' => $currency->exchange_rate,
                        'is_system' => $currency->is_system,
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get currency stats: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk add multiple currencies to company
     */
    public function bulkAddToCompany(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'currency_ids' => 'required|array|min:1',
                'currency_ids.*' => 'exists:currencies,id',
                'default_currency_id' => 'nullable|exists:currencies,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $company = Company::find($request->user()->company_id);
            $existingCurrencyIds = $company->currencies->pluck('currencies.id')->toArray();
            
            // Filter out already added currencies
            $newCurrencyIds = array_diff($request->currency_ids, $existingCurrencyIds);
            
            if (empty($newCurrencyIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'All selected currencies are already added to your company'
                ], 400);
            }

            // If company has no currencies, first one becomes default
            $isFirstCurrency = $company->currencies()->count() === 0;
            
            // Determine default currency
            $defaultCurrencyId = $request->default_currency_id;
            if ($isFirstCurrency && !$defaultCurrencyId) {
                $defaultCurrencyId = $newCurrencyIds[0];
            }

            // Remove existing default if setting new default
            if ($defaultCurrencyId && !$isFirstCurrency) {
                $company->currencies()->updateExistingPivot(
                    $company->currencies()->wherePivot('is_default', true)->pluck('currencies.id')->toArray(),
                    ['is_default' => false]
                );
            }

            // Add new currencies
            foreach ($newCurrencyIds as $currencyId) {
                $company->currencies()->attach($currencyId, [
                    'is_default' => $currencyId == $defaultCurrencyId,
                    'is_active' => true,
                ]);
            }

            $company->load('currencies');

            return response()->json([
                'success' => true,
                'message' => 'Currencies added successfully',
                'data' => [
                    'currencies' => $company->currencies,
                    'default_currency' => $company->defaultCurrency(),
                    'added_count' => count($newCurrencyIds)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add currencies: ' . $e->getMessage()
            ], 500);
        }
    }
}