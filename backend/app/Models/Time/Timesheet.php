<?php

namespace App\Models\Time;

use App\Models\User;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Timesheet extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'user_id', 'period_id', 'status',
        'total_minutes', 'billable_minutes', 'overtime_minutes', 'leave_minutes',
        'submitted_at', 'approved_at', 'workflow_instance_id', 'version'
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'approved_at'  => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function entries()
    {
        return $this->belongsToMany(TimeEntry::class, 'timesheet_entries', 'timesheet_id', 'time_entry_id');
    }

    public function submissions()
    {
        return $this->hasMany(TimesheetSubmission::class, 'timesheet_id');
    }
}
