<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskDependency extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'task_id', 'depends_on_task_id', 'type'
    ];

    public function dependentTask()
    {
        return $this->belongsTo(Task::class, 'depends_on_task_id');
    }
}
