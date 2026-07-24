<?php

namespace App\Models\Portal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class PortalMessage extends Model
{
    use HasUuid;

    protected $fillable = [
        'portal_conversation_id', 'sender_type', 'sender_id',
        'body', 'is_internal_only'
    ];

    protected $casts = [
        'is_internal_only' => 'boolean',
    ];

    public function conversation()
    {
        return $this->belongsTo(PortalConversation::class, 'portal_conversation_id');
    }
}
