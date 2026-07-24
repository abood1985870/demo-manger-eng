<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Module extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'machine_key', 'name_en', 'name_ar', 'description', 
        'version', 'category', 'vendor', 'is_core', 
        'is_installed', 'is_enabled', 'health_status',
        'installed_at', 'enabled_at', 'disabled_at'
    ];

    public function dependencies()
    {
        return $this->belongsToMany(Module::class, 'module_dependencies', 'module_id', 'depends_on_module_id')
                    ->withPivot('is_required');
    }
}
