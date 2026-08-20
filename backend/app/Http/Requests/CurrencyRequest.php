<?php
// app/Http/Requests/CurrencyRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CurrencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user() && auth()->user()->isAdmin();
    }

    public function rules(): array
    {
        $currencyId = $this->route('currency');

        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:50'
            ],
            'code' => [
                'required',
                'string',
                'size:3',
                'uppercase',
                'regex:/^[A-Z]{3}$/',
                Rule::unique('currencies', 'code')->ignore($currencyId)
            ],
            'symbol' => [
                'nullable',
                'string',
                'max:5'
            ],
            'rate' => [
                'nullable',
                'numeric',
                'min:0.01',
                'max:999999.999999'
            ],
            'is_default' => [
                'boolean'
            ],
            'rates' => [
                'nullable',
                'array'
            ],
            'rates.*.currency' => [
                'required_with:rates',
                'string',
                'size:3',
                'uppercase'
            ],
            'rates.*.rate' => [
                'required_with:rates',
                'numeric',
                'min:0.01'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Currency name is required',
            'name.min' => 'Currency name must be at least 2 characters',
            'name.max' => 'Currency name cannot exceed 50 characters',
            'code.required' => 'Currency code is required',
            'code.size' => 'Currency code must be exactly 3 characters',
            'code.unique' => 'Currency with this code already exists',
            'code.regex' => 'Currency code must be 3 uppercase letters',
            'rate.min' => 'Exchange rate must be greater than 0',
            'rate.max' => 'Exchange rate is too high',
            'is_default.boolean' => 'is_default must be true or false',
            'rates.*.currency.required_with' => 'Currency code is required for each rate',
            'rates.*.currency.size' => 'Currency code must be exactly 3 characters',
            'rates.*.rate.required_with' => 'Rate is required for each currency',
            'rates.*.rate.min' => 'Rate must be greater than 0'
        ];
    }
}