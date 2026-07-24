<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalInvoice extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'legal_matter_id', 'invoice_number', 'invoice_date',
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

    public function einvoiceDocument()
    {
        return $this->hasOne(LegalEInvoiceDocument::class);
    }
}
