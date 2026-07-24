<?php

namespace App\Models\Knowledge;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ResearchWorkspace extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'research_number', 'title', 'legal_matter_id', 
        'status', 'owner_id', 'due_date'
    ];

    protected $casts = [
        'due_date' => 'date',
    ];
}
