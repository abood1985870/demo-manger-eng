<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalClient extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'client_number', 'party_type', 'party_id',
        'client_type', 'status', 'confidentiality_level',
        'responsible_lawyer_id', 'originating_lawyer_id', 'onboarded_at'
    ];

    protected $casts = [
        'onboarded_at' => 'datetime',
    ];

    public function party()
    {
        return $this->morphTo();
    }

    public function matters()
    {
        return $this->hasMany(LegalMatter::class);
    }
}
