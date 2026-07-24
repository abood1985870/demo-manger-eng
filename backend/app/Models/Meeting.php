<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Meeting extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'meeting_number', 'type_id', 'calendar_event_id', 
        'title_en', 'title_ar', 'description_en', 'description_ar',
        'organizer_id', 'chairperson_id', 'secretary_id', 
        'status', 'confidentiality_level', 'quorum_required', 
        'approval_required', 'context_type', 'context_id'
    ];

    public function calendarEvent()
    {
        return $this->belongsTo(CalendarEvent::class);
    }

    public function participants()
    {
        return $this->hasMany(MeetingParticipant::class);
    }

    public function agendas()
    {
        return $this->hasMany(MeetingAgenda::class);
    }
}
