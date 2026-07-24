<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalJudgment extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'legal_case_id', 'judgment_number', 'judgment_date',
        'title_en', 'title_ar', 'operative_outcome', 'amount_awarded', 'currency',
        'status', 'is_appealable', 'appeal_deadline_date', 'document_id', 'version'
    ];

    protected $casts = [
        'judgment_date' => 'date',
        'appeal_deadline_date' => 'date',
        'is_appealable' => 'boolean',
    ];

    public function case()
    {
        return $this->belongsTo(LegalCase::class, 'legal_case_id');
    }
}
