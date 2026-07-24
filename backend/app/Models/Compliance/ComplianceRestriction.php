<?php

namespace App\Models\Compliance;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ComplianceRestriction extends Model
{
    use HasUuid;

    protected $table = 'legal_compliance_restrictions';

    protected $fillable = [
        'compliance_case_id', 'restriction_type', 'status'
    ];
}
