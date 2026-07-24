<?php

namespace App\Models\GRC;

use App\Models\User;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ControlTest extends Model
{
    use HasUuid;

    protected $fillable = [
        'implementation_id', 'test_type', 'procedure', 'conclusion',
        'tester_id', 'approver_id', 'approved_at'
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function tester()
    {
        return $this->belongsTo(User::class, 'tester_id');
    }
}
