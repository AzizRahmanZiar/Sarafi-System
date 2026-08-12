<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'currency_id',
        'type',
        'amount',
        'balance_after',
        'currency_code',
        'description',
        'reference',
        'status',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ✅ Add this to ensure amount is always stored as decimal
    protected function setAmountAttribute($value)
    {
        $this->attributes['amount'] = number_format((float)$value, 2, '.', '');
    }

    protected function setBalanceAfterAttribute($value)
    {
        $this->attributes['balance_after'] = number_format((float)$value, 2, '.', '');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    // Scopes
    public function scopeDeposits($query)
    {
        return $query->where('type', 'deposit');
    }

    public function scopeWithdrawals($query)
    {
        return $query->where('type', 'withdrawal');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForCurrency($query, $currencyId)
    {
        return $query->where('currency_id', $currencyId);
    }

    public function scopeForCurrencyCode($query, $currencyCode)
    {
        return $query->where('currency_code', $currencyCode);
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    // Get balance for a user and currency
    public static function getUserBalance($userId, $currencyId)
    {
        return self::forUser($userId)
            ->where('currency_id', $currencyId)
            ->completed()
            ->select(DB::raw('
                SUM(CASE WHEN type = "deposit" THEN amount ELSE 0 END) - 
                SUM(CASE WHEN type = "withdrawal" THEN amount ELSE 0 END) as balance
            '))
            ->value('balance') ?? 0;
    }
}