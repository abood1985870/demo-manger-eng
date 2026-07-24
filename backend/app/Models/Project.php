<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'program_id',
        'name',
        'code',
        'description',
        'client',
        'department_id',
        'manager_id',
        'start_date',
        'end_date',
        'planned_budget',
        'actual_budget',
        'currency',
        'status_id',
        'priority_id',
        'progress',
        'color',
        'icon',
        'visibility',
        'is_archived',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_archived' => 'boolean',
        'planned_budget' => 'decimal:2',
        'actual_budget' => 'decimal:2',
    ];

    public function members()
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function status()
    {
        return $this->belongsTo(ProjectStatus::class, 'status_id');
    }
}
