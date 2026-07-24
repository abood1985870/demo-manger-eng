<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'folder_id', 'category_id', 'file_name', 'original_name', 
        'extension', 'mime_type', 'file_size', 'checksum', 
        'current_version', 'status', 'uploaded_by'
    ];

    public function folder()
    {
        return $this->belongsTo(DocumentFolder::class, 'folder_id');
    }

    public function versions()
    {
        return $this->hasMany(DocumentVersion::class)->orderBy('version_number', 'desc');
    }

    public function activeLock()
    {
        return $this->hasOne(DocumentLock::class);
    }
    
    // Links to Project, Task, Meeting, etc. via document_links polymorphic setup
    public function links()
    {
        // This requires a custom relationship or multiple morphTo approaches in standard Eloquent.
        // For simplicity in EDMS:
        return $this->hasMany(DocumentLink::class);
    }
}
