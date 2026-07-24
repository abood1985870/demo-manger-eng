<?php

namespace App\Models\Agile;

use App\Models\Task;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class AgileRanking extends Model
{
    use HasUuid;

    protected $fillable = [
        'task_id', 'context_id', 'context_type', 'rank', 'version'
    ];

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }
}
