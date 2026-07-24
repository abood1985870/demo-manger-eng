<?php

namespace App\Services;

use App\Models\MeetingVote;
use App\Models\MeetingVoteResponse;
use App\Events\Meeting\MeetingVoteCast;
use Exception;
use Illuminate\Support\Facades\DB;

class MeetingVotingService
{
    /**
     * Cast a vote securely. Checks if already voted and masks secret ballots.
     */
    public function castVote(string $voteId, int $userId, ?string $optionId = null, bool $isAbstain = false)
    {
        return DB::transaction(function () use ($voteId, $userId, $optionId, $isAbstain) {
            $vote = MeetingVote::findOrFail($voteId);

            if ($vote->status !== 'Open') {
                throw new Exception("Voting is closed.");
            }

            // The DB unique constraint handles double voting natively, 
            // but we can catch it earlier for a better error message.
            if (MeetingVoteResponse::where('vote_id', $vote->id)->where('user_id', $userId)->exists()) {
                throw new Exception("User has already voted.");
            }

            $response = MeetingVoteResponse::create([
                'vote_id' => $vote->id,
                'user_id' => $userId,
                'vote_option_id' => $isAbstain ? null : $optionId,
                'is_abstain' => $isAbstain,
            ]);

            event(new MeetingVoteCast($vote, $userId));

            return $response;
        });
    }
}
