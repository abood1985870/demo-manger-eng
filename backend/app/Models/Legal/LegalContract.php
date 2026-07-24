<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalContract extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'legal_matter_id', 'legal_contract_request_id', 'legal_contract_template_id',
        'contract_number', 'title_en', 'title_ar', 'contract_type', 'contract_category',
        'original_value', 'currency', 'effective_date', 'expiration_date',
        'status', 'risk_level', 'responsible_lawyer_id'
    ];

    protected $casts = [
        'effective_date' => 'date',
        'expiration_date' => 'date',
    ];

    public function matter()
    {
        return $this->belongsTo(LegalMatter::class, 'legal_matter_id');
    }

    public function drafts()
    {
        return $this->hasMany(LegalContractDraftVersion::class);
    }

    public function parties()
    {
        return $this->hasMany(LegalContractParty::class);
    }
}
