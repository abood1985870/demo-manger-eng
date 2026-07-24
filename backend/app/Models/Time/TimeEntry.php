<?php

namespace App\Models\Time;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TimeEntry extends Model
{
    use HasUuid, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'user_id', 'project_id', 'task_id', 'category_id',
        'entry_date', 'start_time', 'end_time', 'duration_minutes', 
        'rounded_duration_minutes', 'timezone', 'source', 'description', 
        'internal_note', 'billable_classification', 'is_overtime',
        'approval_status', 'is_locked', 'invoicing_status',
        'applied_billing_rate', 'billing_rate_version_id', 'currency', 'net_billable_amount',
        'version', 'created_by', 'updated_by'
    ];

    protected $casts = [
        'entry_date' => 'date',
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
        'is_overtime' => 'boolean',
        'is_locked'  => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }
}
