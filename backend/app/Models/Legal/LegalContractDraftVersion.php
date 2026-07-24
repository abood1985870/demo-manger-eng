<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalContractDraftVersion extends Model
{
    use HasUuid;

    protected $fillable = [
        'legal_contract_id', 'document_version_id', 'legal_contract_template_id',
        'version_number', 'status'
    ];

    public function contract()
    {
        return $this->belongsTo(LegalContract::class, 'legal_contract_id');
    }

    public function clauseInstances()
    {
        return $this->hasMany(LegalContractClauseInstance::class);
    }
}
