<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use App\Observers\LegalCaseObserver;

#[ObservedBy(LegalCaseObserver::class)]
class LegalCase extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'legal_matter_id', 'case_number', 'external_court_reference',
        'title_en', 'title_ar', 'case_type', 'legal_court_id', 'case_stage', 'case_status',
        'filing_date', 'registration_date', 'judgment_date', 'closure_date',
        'claim_value', 'currency', 'responsible_lawyer_id', 'version'
    ];

    protected $casts = [
        'filing_date' => 'date',
        'registration_date' => 'date',
        'judgment_date' => 'date',
        'closure_date' => 'date',
    ];

    public function matter()
    {
        return $this->belongsTo(LegalMatter::class, 'legal_matter_id');
    }

    public function court()
    {
        return $this->belongsTo(LegalCourt::class, 'legal_court_id');
    }

    public function hearings()
    {
        return $this->hasMany(LegalHearing::class);
    }
}
