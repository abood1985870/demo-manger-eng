<?php

namespace App\Models\Legal;

use App\Traits\HasUuid;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CaseFileFolder extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'tenant_id', 'case_id', 'parent_folder_id', 'name', 'created_by_id'
    ];

    public function legalCase()
    {
        return $this->belongsTo(LegalCase::class, 'case_id');
    }

    public function parentFolder()
    {
        return $this->belongsTo(CaseFileFolder::class, 'parent_folder_id');
    }

    public function childFolders()
    {
        return $this->hasMany(CaseFileFolder::class, 'parent_folder_id');
    }

    public function files()
    {
        return $this->hasMany(CaseFile::class, 'folder_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
