<?php

namespace App\Models\Agile;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class AgileRelease extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'project_id', 'name_en', 'name_ar', 'release_number',
        'description', 'status', 'planned_start', 'planned_release_date',
        'forecast_release_date', 'actual_release_date',
        'owner_id', 'released_by', 'is_scope_frozen'
    ];

    protected $casts = [
        'planned_start'         => 'datetime',
        'planned_release_date'  => 'datetime',
        'forecast_release_date' => 'datetime',
        'actual_release_date'   => 'datetime',
        'is_scope_frozen'       => 'boolean',
    ];
}
