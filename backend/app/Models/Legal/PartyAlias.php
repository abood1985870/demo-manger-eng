<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class PartyAlias extends Model
{
    use HasUuid;

    protected $fillable = [
        'party_type', 'party_id', 'alias_type', 'display_name', 'normalized_name'
    ];

    public function party()
    {
        return $this->morphTo();
    }
}
