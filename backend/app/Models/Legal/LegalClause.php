<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalClause extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'legal_clause_library_id', 'clause_number', 
        'title_en', 'title_ar', 'clause_type', 'risk_level', 'status'
    ];

    public function versions()
    {
        return $this->hasMany(LegalClauseVersion::class);
    }
}
