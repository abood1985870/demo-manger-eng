<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class License extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'license_number', 'tenant_id', 'edition_id', 'plan_id', 
        'status', 'deployment_type', 'valid_from', 'valid_until', 
        'grace_period_end', 'activated_at', 'activated_by', 
        'revocation_reason', 'offline_signature_payload'
    ];

    protected $casts = [
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'grace_period_end' => 'datetime',
        'activated_at' => 'datetime',
    ];

    public function tenant()
    {
        // Assuming Tenant model exists from Step 1 (or organization)
        return $this->belongsTo(Tenant::class);
    }

    public function edition()
    {
        return $this->belongsTo(ProductEdition::class);
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }
}
