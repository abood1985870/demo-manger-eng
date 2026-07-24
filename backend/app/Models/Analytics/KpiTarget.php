<?php

namespace App\Models\Analytics;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiTarget extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'kpi_id', 'target_value', 'valid_from', 'valid_until', 
        'target_scope_type', 'target_scope_id'
    ];

    protected $casts = [
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
    ];

    public function kpi()
    {
        return $this->belongsTo(KpiDefinition::class, 'kpi_id');
    }
}
