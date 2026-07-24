<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotificationTemplate extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'name', 'event_name', 'subject', 'body'
    ];

    protected $casts = [
        'subject' => 'array',
        'body' => 'array',
    ];
}
