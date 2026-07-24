<?php

namespace App\Models\Agile;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class AgileSprintSnapshot extends Model
{
    use HasUuid;

    protected $fillable = [
        'sprint_id', 'type', 'data', 'taken_at', 'taken_by'
    ];

    protected $casts = [
        'data'     => 'array',
        'taken_at' => 'datetime',
    ];
}
