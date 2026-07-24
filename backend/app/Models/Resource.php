<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resource extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'group_id', 'name', 'resourceable_type', 'resourceable_id', 
        'capacity', 'cost_rate', 'status'
    ];

    public function resourceable()
    {
        return $this->morphTo();
    }

    public function allocations()
    {
        return $this->hasMany(ResourceAllocation::class);
    }
}
