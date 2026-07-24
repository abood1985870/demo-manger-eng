<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalHearing extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'legal_case_id', 'hearing_number', 'title_en', 'title_ar',
        'hearing_type', 'scheduled_at', 'time_zone', 'location', 'remote_link',
        'status', 'outcome', 'next_hearing_id', 'version'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function case()
    {
        return $this->belongsTo(LegalCase::class, 'legal_case_id');
    }

    public function nextHearing()
    {
        return $this->belongsTo(LegalHearing::class, 'next_hearing_id');
    }
}
