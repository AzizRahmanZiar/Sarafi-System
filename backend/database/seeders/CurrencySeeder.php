<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run()
    {
        // This seeder is OPTIONAL now
        // Companies can create their own currencies during registration
        // If you want some default currencies in the system, uncomment below:
        
        /*
        $currencies = [
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'exchange_rate' => 1.0000],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'exchange_rate' => 0.8500],
            ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£', 'exchange_rate' => 0.7200],
        ];

        foreach ($currencies as $currency) {
            Currency::create([
                'code' => $currency['code'],
                'name' => $currency['name'],
                'symbol' => $currency['symbol'],
                'exchange_rate' => $currency['exchange_rate'],
                'is_active' => true,
                'is_system' => true,
                'company_id' => null,
                'created_by' => null,
            ]);
        }
        */
    }
}