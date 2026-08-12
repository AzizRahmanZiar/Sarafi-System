<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'company_id',
        'is_active',
        'can_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'can_login' => 'boolean',
    ];

    // Relationships
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get balance for a specific currency
     */
    public function getBalanceForCurrency($currencyId)
    {
        return Transaction::forUser($this->id)
            ->where('currency_id', $currencyId)
            ->completed()
            ->select(DB::raw('
                SUM(CASE WHEN type = "deposit" THEN amount ELSE 0 END) - 
                SUM(CASE WHEN type = "withdrawal" THEN amount ELSE 0 END) as balance
            '))
            ->value('balance') ?? 0;
    }

    /**
     * Get balance for a specific currency by code
     */
    public function getBalanceForCurrencyCode($currencyCode)
    {
        return Transaction::forUser($this->id)
            ->where('currency_code', $currencyCode)
            ->completed()
            ->select(DB::raw('
                SUM(CASE WHEN type = "deposit" THEN amount ELSE 0 END) - 
                SUM(CASE WHEN type = "withdrawal" THEN amount ELSE 0 END) as balance
            '))
            ->value('balance') ?? 0;
    }

    /**
     * Get all balances grouped by currency
     */
    public function getAllBalances()
    {
        $balances = Transaction::forUser($this->id)
            ->completed()
            ->select('currency_id', 'currency_code', 
                DB::raw('SUM(CASE WHEN type = "deposit" THEN amount ELSE 0 END) - 
                         SUM(CASE WHEN type = "withdrawal" THEN amount ELSE 0 END) as balance')
            )
            ->groupBy('currency_id', 'currency_code')
            ->get();

        $result = [];
        foreach ($balances as $balance) {
            $result[$balance->currency_code] = floatval($balance->balance);
        }
        return $result;
    }

    // Scopes
    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeCanLogin($query)
    {
        return $query->where('can_login', true);
    }

    // Role checks
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isStaff()
    {
        return $this->role === 'staff';
    }

    public function isCustomer()
    {
        return $this->role === 'customer';
    }

    public function isSaraf()
    {
        return $this->role === 'saraf';
    }

    public function canLoginToSystem()
    {
        return $this->can_login === true && in_array($this->role, ['admin', 'staff']);
    }

    // Get users by role within company
    public static function getByRole($companyId, $role)
    {
        return self::where('company_id', $companyId)
                   ->where('role', $role)
                   ->get();
    }
}