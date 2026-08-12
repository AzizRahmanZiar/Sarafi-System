<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'icon',
        'link',
        'read',
        'read_at',
        'data',
    ];

    protected $casts = [
        'read' => 'boolean',
        'read_at' => 'datetime',
        'data' => 'array',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Helper methods
    public function markAsRead()
    {
        $this->update([
            'read' => true,
            'read_at' => now(),
        ]);
    }

    public function markAsUnread()
    {
        $this->update([
            'read' => false,
            'read_at' => null,
        ]);
    }

    public function isRead()
    {
        return $this->read === true;
    }

    // Factory method to create notifications
    public static function createForUser($userId, $title, $message = null, $type = 'info', $data = null)
    {
        return self::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
        ]);
    }

    // Create system notification for all admins
    public static function createForAdmins($title, $message = null, $type = 'info', $data = null)
    {
        $admins = User::where('role', 'admin')->get();
        
        foreach ($admins as $admin) {
            self::createForUser($admin->id, $title, $message, $type, $data);
        }
    }

    // Create notification for company users
    public static function createForCompany($companyId, $title, $message = null, $type = 'info', $data = null)
    {
        $users = User::where('company_id', $companyId)->get();
        
        foreach ($users as $user) {
            self::createForUser($user->id, $title, $message, $type, $data);
        }
    }
}