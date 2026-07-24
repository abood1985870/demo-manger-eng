<?php

namespace App\Models\Compliance;

use App\Models\User;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ComplianceCase extends Model
{
    use HasUuid;
    
    protected $table = 'legal_compliance_cases';

    protected $fillable = [
        'tenant_id', 'case_number', 'subject_id', 'subject_type',
        'due_diligence_profile_id', 'compliance_type', 'risk_level',
        'status', 'compliance_officer_id'
    ];

    public function subject()
    {
        return $this->morphTo();
    }

    public function identities()
    {
        return $this->hasMany(IdentityRecord::class, 'compliance_case_id');
    }

    public function screeningRequests()
    {
        return $this->hasMany(ScreeningRequest::class, 'compliance_case_id');
    }

    public function restrictions()
    {
        return $this->hasMany(ComplianceRestriction::class, 'compliance_case_id');
    }

    public function complianceOfficer()
    {
        return $this->belongsTo(User::class, 'compliance_officer_id');
    }
}
