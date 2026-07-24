<?php

namespace App\Models\Portal;

use App\Models\Legal\LegalMatter;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class PortalAccessGrant extends Model
{
    use HasUuid;

    protected $fillable = [
        'portal_account_id', 'resource_type', 'resource_id', 'portal_role_id',
        'can_view', 'can_upload', 'can_download', 'can_comment', 
        'expires_at', 'granted_by'
    ];

    protected $casts = [
        'can_view' => 'boolean',
        'can_upload' => 'boolean',
        'can_download' => 'boolean',
        'can_comment' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function account()
    {
        return $this->belongsTo(PortalAccount::class, 'portal_account_id');
    }
}
