<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentLock extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'document_id', 'locked_by', 'locked_at', 'reason'
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'locked_by');
    }
}
