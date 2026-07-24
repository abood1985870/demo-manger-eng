<?php

namespace App\Models\Analytics;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Widget extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'dashboard_id', 'widget_type_id', 'title', 'configuration', 'refresh_interval_seconds'
    ];

    protected $casts = [
        'configuration' => 'array',
    ];

    public function dashboard()
    {
        return $this->belongsTo(Dashboard::class);
    }
}
