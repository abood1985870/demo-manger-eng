<?php

namespace App\Models\Analytics;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetricSnapshot extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'tenant_id', 'metric_id', 'value', 'project_id', 'user_id', 
        'status_dimension', 'period_start', 'period_end', 'calculation_version'
    ];

    protected $casts = [
        'period_start' => 'datetime',
        'period_end' => 'datetime',
    ];

    public function definition()
    {
        return $this->belongsTo(MetricDefinition::class, 'metric_id');
    }
}
