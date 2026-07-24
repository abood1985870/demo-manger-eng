<?php

namespace App\Models\Agile;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgileBoard extends Model
{
    use HasUuid, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'workspace_id', 'name', 'type', 'estimation_scheme_id',
        'quick_filters', 'card_fields', 'version', 'created_by'
    ];

    protected $casts = [
        'quick_filters' => 'array',
        'card_fields'   => 'array',
    ];

    public function columns()
    {
        return $this->hasMany(AgileBoardColumn::class, 'board_id')->orderBy('sequence');
    }

    public function sprints()
    {
        return $this->hasMany(AgileSprint::class, 'board_id')->orderBy('sprint_number');
    }
}
