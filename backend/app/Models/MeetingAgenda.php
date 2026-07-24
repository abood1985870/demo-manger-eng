<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeetingAgenda extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'meeting_id', 'version', 'status'
    ];

    public function items()
    {
        return $this->hasMany(MeetingAgendaItem::class, 'agenda_id')->orderBy('sequence_number');
    }
}
