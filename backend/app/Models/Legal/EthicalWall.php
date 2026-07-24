<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class EthicalWall extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'wall_number', 'name', 'legal_matter_id', 'legal_client_id',
        'reason', 'status', 'effective_date', 'expiration_date'
    ];

    protected $casts = [
        'effective_date' => 'datetime',
        'expiration_date' => 'datetime',
    ];

    public function members()
    {
        return $this->hasMany(EthicalWallMember::class);
    }
}
