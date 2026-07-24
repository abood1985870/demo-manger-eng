<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalFeeAgreement extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'legal_matter_id', 'agreement_number', 'title_en', 'title_ar',
        'billing_model', 'billing_frequency', 'effective_date', 'expiration_date',
        'fee_cap', 'currency', 'tax_treatment_id', 'status', 'responsible_partner_id', 'version'
    ];

    protected $casts = [
        'effective_date' => 'date',
        'expiration_date' => 'date',
    ];

    public function matter()
    {
        return $this->belongsTo(LegalMatter::class, 'legal_matter_id');
    }
}
