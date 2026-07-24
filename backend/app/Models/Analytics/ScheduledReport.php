<?php

namespace App\Models\Analytics;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduledReport extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'report_schedules';

    protected $fillable = [
        'tenant_id', 'name', 'dashboard_id', 'frequency', 
        'recipients', 'format', 'last_run_at', 'next_run_at', 'is_active'
    ];

    protected $casts = [
        'recipients' => 'array',
        'last_run_at' => 'datetime',
        'next_run_at' => 'datetime',
        'is_active' => 'boolean',
    ];
}
