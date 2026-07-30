<?php

namespace App\Models\Knowledge;

use App\Models\Legal\LegalMatter;
use App\Models\User;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class KnowledgeItem extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'knowledge_number', 'source_case_id', 'title_en', 'title_ar', 'summary',
        'knowledge_type', 'document_version_id', 'status', 'confidentiality_level',
        'effective_date', 'expiration_date', 'author_id', 'reviewer_id', 'superseded_by'
    ];

    protected $casts = [
        'effective_date' => 'date',
        'expiration_date' => 'date',
    ];

    public function sourceMatters()
    {
        return $this->belongsToMany(LegalMatter::class, 'knowledge_item_matter_links', 'knowledge_item_id', 'legal_matter_id')
                    ->withPivot('enforces_ethical_wall');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
