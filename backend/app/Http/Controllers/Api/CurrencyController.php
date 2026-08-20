<?php
// app/Http/Controllers/Api/CurrencyController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CurrencyRequest;
use App\Models\Currency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $currencies = Currency::orderBy('is_default', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            $currencies->each(function ($currency) {
                $currency->rates_display = $currency->getRatesDisplay();
            });

            return response()->json([
                'success' => true,
                'currencies' => $currencies
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch currencies',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Currency $currency): JsonResponse
    {
        try {
            $currency->rates_display = $currency->getRatesDisplay();
            
            return response()->json([
                'success' => true,
                'currency' => $currency
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch currency',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(CurrencyRequest $request): JsonResponse
    {
        try {
            $isFirstCurrency = Currency::count() === 0;
            $isDefault = $request->input('is_default', false) || $isFirstCurrency;

            $rates = $request->input('rates', []);
            
            $ratesArray = [];
            if (is_array($rates)) {
                foreach ($rates as $rate) {
                    if (isset($rate['currency']) && isset($rate['rate'])) {
                        $ratesArray[strtoupper($rate['currency'])] = (float) $rate['rate'];
                    }
                }
            }

            $mainRate = $request->input('rate', 1);

            $currencyData = [
                'name' => $request->input('name'),
                'code' => strtoupper($request->input('code')),
                'symbol' => $request->input('symbol'),
                'rate' => $mainRate,
                'is_default' => $isDefault,
                'created_by' => auth()->id(),
            ];

            // Set rates as JSON string
            $currencyData['rates'] = json_encode($ratesArray);

            $currency = Currency::create($currencyData);

            $currency->rates_display = $currency->getRatesDisplay();

            return response()->json([
                'success' => true,
                'message' => 'Currency created successfully',
                'currency' => $currency
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create currency',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(CurrencyRequest $request, Currency $currency): JsonResponse
    {
        try {
            $data = $request->validated();
            
            if (isset($data['name'])) {
                $currency->name = $data['name'];
            }
            if (isset($data['code'])) {
                $currency->code = strtoupper($data['code']);
            }
            if (isset($data['symbol'])) {
                $currency->symbol = $data['symbol'];
            }
            if (isset($data['rate'])) {
                $currency->rate = $data['rate'];
            }
            
            if ($request->has('rates')) {
                $rates = $request->input('rates', []);
                $ratesArray = [];
                if (is_array($rates)) {
                    foreach ($rates as $rate) {
                        if (isset($rate['currency']) && isset($rate['rate'])) {
                            $ratesArray[strtoupper($rate['currency'])] = (float) $rate['rate'];
                        }
                    }
                }
                // Set rates as JSON string
                $currency->rates = json_encode($ratesArray);
            }
            
            if (isset($data['is_default'])) {
                if ($data['is_default'] && !$currency->is_default) {
                    $currency->is_default = true;
                } elseif (!$data['is_default'] && $currency->is_default) {
                    $otherDefault = Currency::where('id', '!=', $currency->id)
                        ->where('is_default', true)
                        ->exists();
                    
                    if (!$otherDefault) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Cannot unset default currency. Please set another currency as default first.'
                        ], 422);
                    }
                    $currency->is_default = false;
                }
            }

            $currency->save();
            $currency->rates_display = $currency->getRatesDisplay();

            return response()->json([
                'success' => true,
                'message' => 'Currency updated successfully',
                'currency' => $currency
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update currency',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Currency $currency): JsonResponse
    {
        try {
            if ($currency->is_default) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete the default currency. Please set another currency as default first.'
                ], 422);
            }

            $currency->delete();

            return response()->json([
                'success' => true,
                'message' => 'Currency deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete currency',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function setDefault(Currency $currency): JsonResponse
    {
        try {
            $currency->makeDefault();

            return response()->json([
                'success' => true,
                'message' => 'Default currency updated successfully',
                'currency' => $currency
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to set default currency',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDefault(): JsonResponse
    {
        try {
            $default = Currency::default()->first();

            if (!$default) {
                return response()->json([
                    'success' => false,
                    'message' => 'No default currency set'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'currency' => $default
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch default currency',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}