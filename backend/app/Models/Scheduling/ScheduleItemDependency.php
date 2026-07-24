<?php

namespace App\Models\Scheduling;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ScheduleItemDependency extends Model
{
    use HasUuid;
    protected $fillable = [
        'predecessor_id', 'successor_id', 'dependency_type', 'lag_value', 'lag_unit',
        'is_hard', 'is_cross_project', 'status', 'reason', 'created_by',
    ];
    protected $casts = ['is_hard' => 'boolean', 'is_cross_project' => 'boolean'];

    public function predecessor() { return $this->belongsTo(ScheduleItem::class, 'predecessor_id'); }
    public function successor()   { return $this->belongsTo(ScheduleItem::class, 'successor_id'); }
}
