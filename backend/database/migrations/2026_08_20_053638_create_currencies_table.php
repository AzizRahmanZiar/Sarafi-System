<?php
// database/migrations/2026_08_20_053638_create_currencies_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('code', 3)->unique();
            $table->string('symbol', 5);
            $table->decimal('rate', 15, 6)->default(1.000000);
            $table->boolean('is_default')->default(false);
            $table->json('rates')->nullable(); // Add this for multiple rates
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index('code');
            $table->index('is_default');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};