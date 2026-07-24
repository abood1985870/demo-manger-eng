<?php

namespace App\Models\Finance;

use App\Models\Project;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class EvmCalculationRun extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'project_id', 'schedule_baseline_id', 'cutoff_date',
        'planned_value', 'earned_value', 'actual_cost',
        'schedule_variance', 'cost_variance',
        'schedule_performance_index', 'cost_performance_index',
        'status', 'warnings'
    ];

    protected $casts = [
        'cutoff_date' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}
