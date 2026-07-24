<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobTitle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'code',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
