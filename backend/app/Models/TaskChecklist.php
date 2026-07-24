<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskChecklist extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'task_id', 'name'
    ];

    public function items()
    {
        return $this->hasMany(TaskChecklistItem::class, 'checklist_id');
    }
}
