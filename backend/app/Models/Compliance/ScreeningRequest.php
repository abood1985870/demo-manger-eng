<?php

namespace App\Models\Compliance;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ScreeningRequest extends Model
{
    use HasUuid;

    protected $table = 'legal_screening_requests';

    protected $fillable = [
        'compliance_case_id', 'subject_party_id', 'provider',
        'screening_types', 'status', 'idempotency_key'
    ];

    protected $casts = [
        'screening_types' => 'json',
    ];

    public function complianceCase()
    {
        return $this->belongsTo(ComplianceCase::class, 'compliance_case_id');
    }

    public function matches()
    {
        return $this->hasMany(ScreeningMatch::class, 'screening_request_id');
    }
}
