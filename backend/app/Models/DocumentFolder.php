<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentFolder extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'parent_id', 'name', 'description', 'color', 'icon', 
        'visibility', 'owner_id', 'created_by', 'updated_by'
    ];

    public function parent()
    {
        return $this->belongsTo(DocumentFolder::class, 'parent_id');
    }

    public function subfolders()
    {
        return $this->hasMany(DocumentFolder::class, 'parent_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'folder_id');
    }
}
