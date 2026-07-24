<?php

namespace App\Models\Compliance;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class IdentityRecord extends Model
{
    use HasUuid;

    protected $table = 'legal_identity_records';

    protected $fillable = [
        'compliance_case_id', 'party_id', 'identification_type',
        'identification_number_masked', 'identification_number_encrypted',
        'issuer_country', 'issue_date', 'expiration_date', 
        'verification_status', 'evidence_document_version_id'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiration_date' => 'date',
    ];

    // Encrypt mutator for the highly sensitive ID number
    public function setIdentificationNumberAttribute($value)
    {
        $this->attributes['identification_number_encrypted'] = Crypt::encryptString($value);
        
        // Mask: Show only last 4 chars, mask the rest
        if (strlen($value) > 4) {
            $this->attributes['identification_number_masked'] = str_repeat('*', strlen($value) - 4) . substr($value, -4);
        } else {
            $this->attributes['identification_number_masked'] = '****';
        }
    }

    public function getIdentificationNumberAttribute()
    {
        return Crypt::decryptString($this->attributes['identification_number_encrypted']);
    }
}
