<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalInvoice extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'legal_matter_id', 'client_id', 'legal_case_id', 'recipient_type',
        'external_client_name', 'external_client_email', 'external_client_phone', 'external_client_address', 'external_client_tax_number',
        'recipient_name', 'recipient_email', 'recipient_phone', 'recipient_address', 'recipient_tax_number',
        'invoice_number', 'invoice_date',
        'supply_date_foundation', 'currency', 'total_fees', 'total_expenses',
        'total_tax', 'grand_total', 'amount_due', 'status', 'tax_profile_id',
        'document_id', 'version'
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'supply_date_foundation' => 'date',
    ];

    public function matter()
    {
        return $this->belongsTo(LegalMatter::class, 'legal_matter_id');
    }
    
    public function case()
    {
        return $this->belongsTo(LegalCase::class, 'legal_case_id');
    }
    
    public function client()
    {
        return $this->belongsTo(LegalClient::class, 'client_id');
    }

    public function einvoiceDocument()
    {
        return $this->hasOne(LegalEInvoiceDocument::class);
    }
}

