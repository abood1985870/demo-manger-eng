<?php

namespace App\Models\Analytics;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetricDefinition extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'machine_key', 'name_en', 'name_ar', 'module_owner', 
        'measure_type', 'aggregation_type', 'data_freshness'
    ];

    public function snapshots()
    {
        return $this->hasMany(MetricSnapshot::class, 'metric_id');
    }
}
