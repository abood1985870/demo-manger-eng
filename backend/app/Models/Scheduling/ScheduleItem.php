<?php

namespace App\Models\Scheduling;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScheduleItem extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'schedule_id', 'parent_id', 'linkable_type', 'linkable_id',
        'wbs_code', 'sequence', 'title_en', 'title_ar', 'description',
        'item_type', 'planned_start', 'planned_finish', 'actual_start', 'actual_finish',
        'forecast_start', 'forecast_finish', 'duration_days', 'remaining_duration_days',
        'work_hours', 'remaining_work_hours', 'actual_work_hours', 'percent_complete',
        'scheduling_mode', 'duration_type', 'calendar_id',
        'early_start', 'early_finish', 'late_start', 'late_finish',
        'total_float_days', 'free_float_days', 'is_critical',
        'is_milestone', 'is_summary', 'is_manually_scheduled',
        'priority', 'status', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'planned_start' => 'date', 'planned_finish' => 'date',
        'actual_start' => 'date', 'actual_finish' => 'date',
        'forecast_start' => 'date', 'forecast_finish' => 'date',
        'early_start' => 'date', 'early_finish' => 'date',
        'late_start' => 'date', 'late_finish' => 'date',
        'is_critical' => 'boolean', 'is_milestone' => 'boolean',
        'is_summary' => 'boolean', 'is_manually_scheduled' => 'boolean',
    ];

    public function schedule()
    {
        return $this->belongsTo(ProjectSchedule::class, 'schedule_id');
    }

    public function parent()
    {
        return $this->belongsTo(ScheduleItem::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ScheduleItem::class, 'parent_id')->orderBy('sequence');
    }

    /** Dependencies where this item is the successor (predecessors list) */
    public function predecessors()
    {
        return $this->hasMany(ScheduleItemDependency::class, 'successor_id');
    }

    /** Dependencies where this item is the predecessor (successors list) */
    public function successors()
    {
        return $this->hasMany(ScheduleItemDependency::class, 'predecessor_id');
    }

    public function constraint()
    {
        return $this->hasOne(ScheduleConstraint::class, 'schedule_item_id');
    }
}
