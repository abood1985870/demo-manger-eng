<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'task_number', 'parent_id', 'project_id', 'phase_id', 'milestone_id', 'epic_id',
        'title', 'description', 'type_id', 'status_id', 'priority_id', 'progress',
        'estimated_hours', 'actual_hours', 'start_date', 'due_date', 'completion_date',
        'color', 'tags', 'created_by', 'updated_by', 'is_archived'
    ];

    protected $casts = [
        'tags' => 'array',
        'start_date' => 'date',
        'due_date' => 'date',
        'completion_date' => 'date',
        'is_archived' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    public function subtasks()
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    public function assignments()
    {
        return $this->hasMany(TaskAssignment::class);
    }

    public function watchers()
    {
        return $this->belongsToMany(User::class, 'task_watchers');
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'task_followers');
    }

    public function checklists()
    {
        return $this->hasMany(TaskChecklist::class);
    }

    public function dependencies()
    {
        return $this->hasMany(TaskDependency::class, 'task_id');
    }
}
