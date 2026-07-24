<?php

namespace App\Models\GRC;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Risk extends Model
{
    use HasUuid, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'risk_number', 'title_en', 'title_ar', 'description_en', 'description_ar',
        'category_id', 'type', 'project_id', 'task_id', 'owner_id', 
        'status', 'treatment_strategy', 'inherent_score', 'residual_score', 'target_score',
        'next_review_date', 'closed_at', 'version'
    ];

    protected $casts = [
        'next_review_date' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function assessments()
    {
        return $this->hasMany(RiskAssessment::class, 'risk_id');
    }

    public function treatments()
    {
        return $this->hasMany(RiskTreatment::class, 'risk_id');
    }
}
