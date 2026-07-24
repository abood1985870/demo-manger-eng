<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeetingMinute extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'meeting_id', 'status', 'content_en', 'content_ar'
    ];

    public function versions()
    {
        return $this->hasMany(MeetingMinuteVersion::class, 'minute_id');
    }
}
