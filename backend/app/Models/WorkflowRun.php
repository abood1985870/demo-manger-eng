<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowRun extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'workflow_version_id', 'status', 'trigger_type', 
        'initial_payload', 'state', 'started_at', 'completed_at'
    ];

    protected $casts = [
        'initial_payload' => 'array',
        'state' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function version()
    {
        return $this->belongsTo(WorkflowVersion::class, 'workflow_version_id');
    }

    public function logs()
    {
        return $this->hasMany(WorkflowLog::class);
    }
}
