<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductEdition extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'machine_key', 'name_en', 'name_ar', 'description', 
        'version', 'status', 'deployment_compatibility'
    ];

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'product_edition_modules', 'edition_id', 'module_id')
                    ->withPivot('is_default');
    }

    public function plans()
    {
        return $this->hasMany(SubscriptionPlan::class, 'edition_id');
    }
}
