<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalPrebill extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'legal_matter_id', 'legal_fee_agreement_id', 'prebill_number',
        'billing_period', 'currency', 'gross_fees', 'total_expenses', 'total_discounts',
        'net_amount', 'status', 'reviewer_id', 'version'
    ];

    public function matter()
    {
        return $this->belongsTo(LegalMatter::class, 'legal_matter_id');
    }

    public function lines()
    {
        return $this->hasMany(LegalPrebillLine::class);
    }
}
