<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'symbol',
        'exchange_rate',
        'is_active',
        'is_system',      // ✅ Add this
        'company_id',     // ✅ Add this
        'created_by',     // ✅ Add this
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    // Relationships
    public function companies()
    {
        return $this->belongsToMany(Company::class, 'company_currency')
                    ->withPivot('is_default', 'is_active')
                    ->withTimestamps();
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    public function scopeCustom($query)
    {
        return $query->where('is_system', false);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where(function($q) use ($companyId) {
            $q->where('is_system', true)
              ->orWhere('company_id', $companyId);
        });
    }

    // Helper methods
    public function format($amount)
    {
        return $this->symbol . ' ' . number_format($amount, 2);
    }

    public function isSystem()
    {
        return $this->is_system === true;
    }

    public function isCustom()
    {
        return $this->is_system === false;
    }
}