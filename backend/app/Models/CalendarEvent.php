<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalendarEvent extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'calendar_id', 'parent_id', 'recurring_rule_id', 'event_type', 
        'title', 'description', 'start_datetime', 'end_datetime', 
        'timezone', 'is_all_day', 'location', 'online_meeting_link', 
        'status', 'priority', 'visibility', 'color', 'organizer_id'
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'is_all_day' => 'boolean',
    ];

    public function calendar()
    {
        return $this->belongsTo(Calendar::class);
    }
    
    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }
}
