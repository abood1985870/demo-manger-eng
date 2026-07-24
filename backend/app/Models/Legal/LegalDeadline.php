<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalDeadline extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'legal_case_id', 'deadline_type_id', 'title_en', 'title_ar',
        'trigger_date', 'calculated_due_date', 'hijri_representation_foundation',
        'adjusted_due_date', 'status', 'override_reason', 'overridden_by', 'task_id', 'version'
    ];

    protected $casts = [
        'trigger_date' => 'datetime',
        'calculated_due_date' => 'datetime',
        'adjusted_due_date' => 'datetime',
    ];

    public function case()
    {
        return $this->belongsTo(LegalCase::class, 'legal_case_id');
    }

    public function deadlineType()
    {
        return $this->belongsTo(LegalDeadlineType::class, 'deadline_type_id');
    }
}
