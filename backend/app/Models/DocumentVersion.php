<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentVersion extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'document_id', 'version_number', 'file_path', 'file_name',
        'file_size', 'checksum', 'changelog', 'uploaded_by'
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}
