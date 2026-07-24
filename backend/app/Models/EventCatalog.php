<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventCatalog extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'events';

    protected $fillable = [
        'name', 'module', 'description', 'is_active'
    ];
}
