<?php

namespace App\Models\Portal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class PortalAccount extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'contact_id', 'portal_organization_id',
        'email', 'password_hash', 'status', 'last_login_at'
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
    ];

    public function accessGrants()
    {
        return $this->hasMany(PortalAccessGrant::class);
    }
}
