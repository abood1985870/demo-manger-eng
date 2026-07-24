<?php

namespace App\Models\Time;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class TimesheetSubmission extends Model
{
    use HasUuid;
    
    // Disable updated_at since these are immutable snapshots
    const UPDATED_AT = null;

    protected $fillable = [
        'timesheet_id', 'snapshot_data', 'submission_notes'
    ];

    protected $casts = [
        'snapshot_data' => 'array', // Crucial for storing the immutable state of entries
    ];

    public function timesheet()
    {
        return $this->belongsTo(Timesheet::class, 'timesheet_id');
    }
}
