<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AddOn extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'machine_key', 'name_en', 'name_ar', 'description', 'status'
    ];

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'add_on_modules', 'add_on_id', 'module_id');
    }
}
