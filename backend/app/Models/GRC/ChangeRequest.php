<?php

namespace App\Models\GRC;

use App\Models\Project;
use App\Models\User;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ChangeRequest extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'change_number', 'title', 'description', 'type', 'priority', 'status',
        'business_justification', 'project_id', 'requester_id', 'ccb_meeting_id',
        'approved_at', 'implemented_at', 'version'
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'implemented_at' => 'datetime',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}
