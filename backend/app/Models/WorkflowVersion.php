<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkflowVersion extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'workflow_id', 'version_number', 'dag_definition', 
        'is_published', 'published_by'
    ];

    protected $casts = [
        'dag_definition' => 'array',
    ];

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }
}
