<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Calendar extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'name', 'type', 'description', 'calendarable_type', 
        'calendarable_id', 'color', 'timezone', 'owner_id'
    ];

    public function events()
    {
        return $this->hasMany(CalendarEvent::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
