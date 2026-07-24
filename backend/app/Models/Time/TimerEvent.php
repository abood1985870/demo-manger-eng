<?php

namespace App\Models\Time;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class TimerEvent extends Model
{
    use HasUuid;

    protected $fillable = [
        'timer_id', 'event_type', 'occurred_at', 'event_metadata', 'device_context'
    ];

    protected $casts = [
        'occurred_at'    => 'datetime',
        'event_metadata' => 'array',
    ];

    public function timer()
    {
        return $this->belongsTo(ActiveTimer::class, 'timer_id');
    }
}
