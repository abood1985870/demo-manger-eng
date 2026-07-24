<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeetingDecision extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'decision_number', 'meeting_id', 'agenda_item_id', 
        'title_en', 'title_ar', 'decision_text', 'status'
    ];

    public function meeting()
    {
        return $this->belongsTo(Meeting::class);
    }
}
