<?php

namespace App\Services\Knowledge;

use App\Models\Knowledge\KnowledgeItem;
use App\Models\User;
use App\Services\Legal\EthicalWallGuard;
use Illuminate\Support\Facades\Log;

class LegalKnowledgeAccessResolver
{
    public function __construct(
        protected EthicalWallGuard $ethicalWallGuard
    ) {}

    /**
     * Determines if a User can access a Knowledge Item.
     * Prevents Matter Confidentiality from leaking via Precedents.
     */
    public function canAccess(User $user, KnowledgeItem $item, string $action = 'view'): bool
    {
        // 1. Authors and Reviewers always have access to their own drafts
        if (in_array($user->id, [$item->author_id, $item->reviewer_id])) {
            return true;
        }

        // 2. Drafts or items under review are hidden from the firm
        if ($item->status !== 'published') {
            Log::info("Knowledge Access Denied: Item {$item->id} is not yet published.");
            return false;
        }

        // 3. Check Ethical Wall inheritance for Source Matters
        // If the precedent was derived from a specific matter, we must check if 
        // the user is ethically allowed to see that matter, unless it was specifically
        // flagged as 'sanitized and disconnected'.
        foreach ($item->sourceMatters as $matter) {
            if ($matter->pivot->enforces_ethical_wall) {
                try {
                    $this->ethicalWallGuard->enforce($user, $matter->id, null);
                } catch (\Exception $e) {
                    Log::warning("Knowledge Access Denied: User {$user->id} is blocked by Ethical Wall for source matter {$matter->id}.");
                    return false;
                }
            }
        }

        // 4. Highly Restricted items require explicit naming (simplified check)
        if ($item->confidentiality_level === 'highly_restricted') {
            // Additional custom entitlement logic would go here.
            return false;
        }

        return true;
    }
}
