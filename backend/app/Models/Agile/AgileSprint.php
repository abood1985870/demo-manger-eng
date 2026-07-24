<?php

namespace App\Models\Agile;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class AgileSprint extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'board_id', 'name_en', 'name_ar', 'sprint_number',
        'goal', 'status', 'start_date', 'end_date', 'timezone',
        'capacity_hours', 'planned_points', 'completed_points',
        'cancellation_reason', 'completion_summary',
        'created_by', 'started_by', 'completed_by'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date'   => 'datetime',
    ];

    public function board()
    {
        return $this->belongsTo(AgileBoard::class, 'board_id');
    }

    public function items()
    {
        return $this->hasMany(AgileSprintItem::class, 'sprint_id');
    }

    public function scopeChanges()
    {
        return $this->hasMany(AgileSprintScopeChange::class, 'sprint_id');
    }
}
