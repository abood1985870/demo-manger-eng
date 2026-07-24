<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeetingVote extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'meeting_id', 'agenda_item_id', 'title', 'description', 
        'type', 'is_secret_ballot', 'starts_at', 'ends_at', 'status'
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_secret_ballot' => 'boolean',
    ];

    public function options()
    {
        return $this->hasMany(MeetingVoteOption::class, 'vote_id');
    }
    
    public function responses()
    {
        return $this->hasMany(MeetingVoteResponse::class, 'vote_id');
    }
}
