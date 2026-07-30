<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CaseFile extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'tenant_id', 'case_id', 'folder_id', 'original_name', 'display_name',
        'storage_key', 'mime_type', 'extension', 'size', 'uploaded_by_id'
    ];

    protected $hidden = [
        'storage_key',
    ];

    public function legalCase()
    {
        return $this->belongsTo(LegalCase::class, 'case_id');
    }

    public function folder()
    {
        return $this->belongsTo(CaseFileFolder::class, 'folder_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by_id');
    }
}
