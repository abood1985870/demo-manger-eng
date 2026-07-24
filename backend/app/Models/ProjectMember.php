<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectMember extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'project_id',
        'user_id',
        'role_id',
        'join_date',
        'leave_date',
        'status',
    ];

    protected $casts = [
        'join_date' => 'date',
        'leave_date' => 'date',
    ];
}
