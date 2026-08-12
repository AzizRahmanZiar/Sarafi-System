<?php
// database/seeders/AdminUserSeeder.php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('role', 'admin')->exists()) {
            User::create([
                'name' => 'System Admin',
                'email' => 'admin@example.com',
                'password' => Hash::make('admin123'),
                'phone' => '1234567890',
                'address' => '123 Admin Street',
                'company' => 'Your Company',
                'role' => 'admin',
            ]);
        }
    }
}