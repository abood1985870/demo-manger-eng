<?php

namespace App\Models\Analytics;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiDefinition extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'metric_id', 'tenant_id', 'name', 'direction', 
        'warning_threshold', 'critical_threshold', 'status'
    ];

    public function targets()
    {
        return $this->hasMany(KpiTarget::class, 'kpi_id');
    }
}
