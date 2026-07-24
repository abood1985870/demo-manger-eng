<?php

namespace App\Models\Knowledge;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class KnowledgeSanitizationRecord extends Model
{
    use HasUuid;

    protected $fillable = [
        'knowledge_item_id', 'source_document_version_id', 'sanitized_document_version_id',
        'redacted_fields', 'status', 'reviewer_id', 'approved_at'
    ];

    protected $casts = [
        'redacted_fields' => 'json',
        'approved_at' => 'datetime',
    ];

    public function knowledgeItem()
    {
        return $this->belongsTo(KnowledgeItem::class, 'knowledge_item_id');
    }
}
