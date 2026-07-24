<?php

namespace App\Models\Scheduling;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class CriticalPathItem extends Model
{
    use HasUuid;
    protected $fillable = [
        'calculation_id', 'schedule_item_id',
        'early_start', 'early_finish', 'late_start', 'late_finish',
        'total_float_days', 'free_float_days', 'is_critical', 'is_near_critical',
    ];
    protected $casts = [
        'early_start' => 'date', 'early_finish' => 'date',
        'late_start' => 'date', 'late_finish' => 'date',
        'is_critical' => 'boolean', 'is_near_critical' => 'boolean',
    ];
}
