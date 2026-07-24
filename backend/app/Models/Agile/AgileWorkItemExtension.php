<?php

namespace App\Models\Agile;

use App\Models\Task;
use Illuminate\Database\Eloquent\Model;

class AgileWorkItemExtension extends Model
{
    // The primary key is `task_id` linked directly to the main `tasks` table
    protected $primaryKey = 'task_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'task_id', 'agile_type', 'board_id', 'story_points', 'estimation_confidence',
        'business_value', 'risk_value', 'complexity', 'service_class_id',
        'is_blocked', 'blocked_by_user', 'block_category', 'block_reason',
        'blocked_at', 'unblocked_at', 'is_ready', 'is_done'
    ];

    protected $casts = [
        'is_blocked' => 'boolean',
        'is_ready'   => 'boolean',
        'is_done'    => 'boolean',
        'blocked_at' => 'datetime',
        'unblocked_at' => 'datetime',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function board()
    {
        return $this->belongsTo(AgileBoard::class, 'board_id');
    }

    public function serviceClass()
    {
        return $this->belongsTo(AgileServiceClass::class, 'service_class_id');
    }
}
