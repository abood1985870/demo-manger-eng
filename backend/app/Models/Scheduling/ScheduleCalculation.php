<?php

namespace App\Models\Scheduling;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ScheduleCalculation extends Model
{
    use HasUuid;
    protected $fillable = [
        'schedule_id', 'status', 'input_schedule_version', 'engine_version',
        'items_processed', 'warning_count', 'errors', 'cycle_info',
        'correlation_id', 'requested_by', 'started_at', 'completed_at',
    ];
    protected $casts = [
        'errors' => 'array', 'cycle_info' => 'array',
        'started_at' => 'datetime', 'completed_at' => 'datetime',
    ];

    public function criticalPathItems() { return $this->hasMany(CriticalPathItem::class, 'calculation_id'); }
}
