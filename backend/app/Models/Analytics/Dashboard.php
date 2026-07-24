<?php

namespace App\Models\Analytics;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dashboard extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'machine_key', 'name_en', 'name_ar', 'description_en', 'description_ar',
        'type', 'visibility', 'tenant_id', 'owner_id', 'scope_type', 'scope_id',
        'layout_configuration', 'default_filters', 'is_template', 'is_system'
    ];

    protected $casts = [
        'layout_configuration' => 'array',
        'default_filters' => 'array',
    ];

    public function widgets()
    {
        return $this->hasMany(Widget::class);
    }
}
