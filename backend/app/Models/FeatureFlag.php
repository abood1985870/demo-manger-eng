<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeatureFlag extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'key', 'name', 'description', 'type', 
        'default_value', 'is_active', 'module_id'
    ];

    public function rules()
    {
        return $this->hasMany(FeatureFlagRule::class, 'feature_flag_id')->orderBy('priority', 'desc');
    }
}
