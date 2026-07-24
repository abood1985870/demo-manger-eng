<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowApproval extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'workflow_run_id', 'step_id', 'type', 'status'
    ];

    public function run()
    {
        return $this->belongsTo(WorkflowRun::class, 'workflow_run_id');
    }

    public function steps()
    {
        return $this->hasMany(ApprovalStep::class);
    }
}
