<?php
// app/Models/Currency.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'symbol',
        'rate',
        'is_default',
        'created_by',
        'rates'
    ];

    protected $casts = [
        'rate' => 'decimal:6',
        'is_default' => 'boolean',
        // Remove 'rates' => 'array' - we'll handle it manually
    ];

    protected $attributes = [
        'rate' => 1.000000,
        'is_default' => false,
        'rates' => '{}' // Default to empty JSON object
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($currency) {
            if ($currency->is_default) {
                static::where('id', '!=', $currency->id)
                    ->update(['is_default' => false]);
            }
        });
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function isDefault(): bool
    {
        return $this->is_default;
    }

    public function makeDefault(): bool
    {
        static::where('id', '!=', $this->id)->update(['is_default' => false]);
        $this->is_default = true;
        return $this->save();
    }

    public function getRateAgainst($currencyCode): ?float
    {
        if ($this->is_default) {
            return 1;
        }
        
        $rates = $this->getRatesArray();
        if ($rates && isset($rates[$currencyCode])) {
            return (float) $rates[$currencyCode];
        }
        
        return null;
    }

    public function getRatesArray(): array
    {
        if (is_string($this->rates)) {
            return json_decode($this->rates, true) ?? [];
        }
        return is_array($this->rates) ? $this->rates : [];
    }

    public function getRatesDisplay(): array
    {
        if ($this->is_default) {
            return ['1 ' . $this->code . ' = 1 ' . $this->code];
        }
        
        $display = [];
        $rates = $this->getRatesArray();
        if ($rates && is_array($rates)) {
            foreach ($rates as $currency => $rate) {
                $display[] = '1 ' . $this->code . ' = ' . number_format($rate, 2) . ' ' . $currency;
            }
        }
        return $display;
    }

    // Accessor to automatically decode rates when accessed
    public function getRatesAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }
        return $value ?? [];
    }

    // Mutator to encode rates when setting
    public function setRatesAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['rates'] = json_encode($value);
        } else {
            $this->attributes['rates'] = $value;
        }
    }
}