<?php
// database/migrations/2026_08_11_051825_create_transactions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('currency_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['deposit', 'withdrawal', 'transfer', 'fee', 'refund']);
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('currency_code', 10);
            $table->string('description')->nullable();
            $table->string('reference')->nullable();
            $table->string('status')->default('completed');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'currency_id', 'created_at']);
            $table->index('type');
            $table->index('status');
            $table->index('currency_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};