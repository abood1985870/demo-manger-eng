<?php

namespace App\Models\Scheduling;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectSchedule extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'machine_key', 'tenant_id', 'schedulable_type', 'schedulable_id',
        'name_en', 'name_ar', 'description', 'type', 'status',
        'planned_start', 'planned_finish', 'actual_start', 'actual_finish',
        'scheduling_mode', 'default_calendar_id', 'critical_float_threshold_days',
        'allow_cross_project_dependencies', 'version', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'planned_start' => 'date', 'planned_finish' => 'date',
        'actual_start' => 'date', 'actual_finish' => 'date',
        'allow_cross_project_dependencies' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(ScheduleItem::class, 'schedule_id')->orderBy('sequence');
    }

    public function rootItems()
    {
        return $this->hasMany(ScheduleItem::class, 'schedule_id')->whereNull('parent_id')->orderBy('sequence');
    }

    public function baselines()
    {
        return $this->hasMany(ScheduleBaseline::class, 'schedule_id');
    }

    public function calculations()
    {
        return $this->hasMany(ScheduleCalculation::class, 'schedule_id')->latest();
    }

    public function latestCalculation()
    {
        return $this->hasOne(ScheduleCalculation::class, 'schedule_id')->latestOfMany();
    }

    public function snapshots()
    {
        return $this->hasMany(ScheduleSnapshot::class, 'schedule_id');
    }

    public function scenarios()
    {
        return $this->hasMany(ScheduleScenario::class, 'schedule_id');
    }

    public function healthScores()
    {
        return $this->hasMany(ScheduleHealthScore::class, 'schedule_id');
    }
}
