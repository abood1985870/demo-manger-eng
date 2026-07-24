<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionPlan extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'machine_key', 'name_en', 'name_ar', 'edition_id', 
        'billing_cycle', 'status'
    ];

    public function edition()
    {
        return $this->belongsTo(ProductEdition::class, 'edition_id');
    }

    public function limits()
    {
        return $this->hasMany(SubscriptionPlanLimit::class, 'plan_id');
    }
}
