<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id', 'enable_notifications', 'preferred_channels', 
        'digest_mode', 'language', 'quiet_hours_start', 
        'quiet_hours_end', 'timezone', 'muted_projects', 'muted_users'
    ];

    protected $casts = [
        'enable_notifications' => 'boolean',
        'digest_mode' => 'boolean',
        'preferred_channels' => 'array',
        'muted_projects' => 'array',
        'muted_users' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
