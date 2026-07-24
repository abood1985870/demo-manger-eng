<?php

namespace App\Models\Scheduling;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ScheduleScenario extends Model
{
    use HasUuid;
    protected $fillable = [
        'schedule_id', 'tenant_id', 'name', 'description', 'type', 'status',
        'cloned_from_schedule_version', 'applied_calculation_id',
        'approved_by', 'applied_at', 'created_by',
    ];
    protected $casts = ['applied_at' => 'datetime'];

    public function items() { return $this->hasMany(ScheduleScenarioItem::class, 'scenario_id'); }

    public function isApplied(): bool { return $this->status === 'Applied'; }
}
