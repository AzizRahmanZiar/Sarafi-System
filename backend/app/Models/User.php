<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'created_by',
        'permissions', // Add this field
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'permissions' => 'array', // Cast permissions as array
    ];

    // Check if user is admin
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    // Check if user is staff
    public function isStaff()
    {
        return $this->role === 'staff';
    }

    // Check if user has specific permission
    public function hasPermission($permission)
    {
        if ($this->isAdmin()) {
            return true; // Admin has all permissions
        }

        if (!$this->permissions) {
            return false;
        }

        return in_array($permission, $this->permissions);
    }

    // Get creator relationship
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Get users created by this user
    public function createdUsers()
    {
        return $this->hasMany(User::class, 'created_by');
    }
}