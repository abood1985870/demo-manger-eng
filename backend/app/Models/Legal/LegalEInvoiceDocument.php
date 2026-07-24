<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalEInvoiceDocument extends Model
{
    use HasUuid;
    
    protected $table = 'legal_einvoice_documents';

    protected $fillable = [
        'tenant_id', 'legal_invoice_id', 'provider_name', 'structured_payload',
        'canonical_hash_foundation', 'qr_payload_foundation', 'submission_status',
        'provider_request_id', 'provider_response_id', 'response_timestamp', 'errors'
    ];

    protected $casts = [
        'structured_payload' => 'array',
        'errors' => 'array',
        'response_timestamp' => 'datetime',
    ];

    public function invoice()
    {
        return $this->belongsTo(LegalInvoice::class, 'legal_invoice_id');
    }
}
