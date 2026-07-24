<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResourceAllocation extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'resource_id', 'allocatable_type', 'allocatable_id', 
        'start_datetime', 'end_datetime', 'allocation_percentage', 
        'status', 'booked_by'
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'allocation_percentage' => 'decimal:2',
    ];

    public function resource()
    {
        return $this->belongsTo(Resource::class);
    }

    public function allocatable()
    {
        return $this->morphTo();
    }
}
