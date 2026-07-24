<?php

namespace App\Models\Time;

use App\Models\User;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ActiveTimer extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'user_id', 'project_id', 'task_id', 'description',
        'status', 'started_at', 'last_resumed_at', 'accumulated_seconds', 'version'
    ];

    protected $casts = [
        'started_at'      => 'datetime',
        'last_resumed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function events()
    {
        return $this->hasMany(TimerEvent::class, 'timer_id');
    }
}
