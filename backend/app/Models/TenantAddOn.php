<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantAddOn extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'tenant_id', 'add_on_id', 'status', 'effective_from', 'effective_until'
    ];

    protected $casts = [
        'effective_from' => 'datetime',
        'effective_until' => 'datetime',
    ];

    public function addOn()
    {
        return $this->belongsTo(AddOn::class);
    }
}
