<?php

namespace App\Events\Meeting;

use App\Events\BaseSystemEvent;
use App\Models\MeetingVote;

class MeetingVoteCast extends BaseSystemEvent
{
    public MeetingVote $vote;
    public int $userId;

    public function __construct(MeetingVote $vote, int $userId)
    {
        $this->vote = $vote;
        $this->userId = $userId;
    }

    public function getEventName(): string
    {
        return 'MeetingVoteCast';
    }

    public function getModule(): string
    {
        return 'Meetings';
    }

    public function getPayload(): array
    {
        // Notice we do NOT include the actual choice if it's a secret ballot
        return [
            'vote_id' => $this->vote->id,
            'meeting_id' => $this->vote->meeting_id,
            'user_id' => $this->userId,
        ];
    }
}
