<?php

namespace App\Http\Controllers;

use App\Services\MeetingVotingService;
use Illuminate\Http\Request;

class MeetingVoteController extends Controller
{
    protected MeetingVotingService $votingService;

    public function __construct(MeetingVotingService $votingService)
    {
        $this->votingService = $votingService;
    }

    public function cast(Request $request, string $voteId)
    {
        $validated = $request->validate([
            'vote_option_id' => 'nullable|uuid',
            'is_abstain' => 'boolean'
        ]);

        $userId = $request->user()->id ?? 1;

        $response = $this->votingService->castVote(
            $voteId,
            $userId,
            $validated['vote_option_id'] ?? null,
            $validated['is_abstain'] ?? false
        );

        return response()->json($response, 201);
    }
}
