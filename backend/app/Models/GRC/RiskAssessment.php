<?php

namespace App\Models\GRC;

use App\Models\User;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class RiskAssessment extends Model
{
    use HasUuid;

    protected $fillable = [
        'risk_id', 'scoring_model_id', 'assessment_version', 'status',
        'inherent_likelihood', 'inherent_impact', 'inherent_score',
        'residual_likelihood', 'residual_impact', 'residual_score',
        'assumptions', 'assessor_id', 'approved_at', 'approver_id'
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function risk()
    {
        return $this->belongsTo(Risk::class, 'risk_id');
    }

    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }
}
