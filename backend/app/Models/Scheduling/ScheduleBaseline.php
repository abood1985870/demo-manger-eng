<?php

namespace App\Models\Scheduling;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ScheduleBaseline extends Model
{
    use HasUuid;
    protected $fillable = [
        'schedule_id', 'name', 'type', 'baseline_number', 'description',
        'status', 'effective_date', 'locked_at', 'workflow_run_id',
        'approved_by', 'approved_at', 'approval_notes', 'created_by',
    ];
    protected $casts = [
        'effective_date' => 'date', 'locked_at' => 'datetime', 'approved_at' => 'datetime',
    ];

    public function isLocked(): bool { return $this->locked_at !== null; }

    public function items() { return $this->hasMany(ScheduleBaselineItem::class, 'baseline_id'); }
    public function variances() { return $this->hasMany(ScheduleVariance::class, 'baseline_id'); }
}
