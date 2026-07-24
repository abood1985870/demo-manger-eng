<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conversation extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'type', 'name', 'created_by', 'is_archived'
    ];

    public function members()
    {
        return $this->belongsToMany(User::class, 'conversation_members')
                    ->withPivot('role', 'is_muted', 'joined_at');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
