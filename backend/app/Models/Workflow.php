<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Workflow extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'name', 'description', 'template_id', 'context_type', 
        'context_id', 'is_active', 'created_by'
    ];

    public function versions()
    {
        return $this->hasMany(WorkflowVersion::class);
    }

    public function activeVersion()
    {
        return $this->hasOne(WorkflowVersion::class)->where('is_published', true);
    }
}
