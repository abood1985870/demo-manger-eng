<?php

namespace App\Services\Legal;

use App\Models\Legal\EthicalWall;
use App\Models\User;

class EthicalWallGuard
{
    /**
     * Determines if a user is completely blocked from accessing a specific Matter or Client.
     * Must be called in repositories, API controllers, and search providers.
     */
    public function isBlocked(User $user, ?string $matterId, ?string $clientId): bool
    {
        // Find any active walls targeting this matter or client
        $walls = EthicalWall::where('status', 'active')
            ->where(function ($query) use ($matterId, $clientId) {
                if ($matterId) $query->orWhere('legal_matter_id', $matterId);
                if ($clientId) $query->orWhere('legal_client_id', $clientId);
            })
            ->with('members')
            ->get();

        if ($walls->isEmpty()) {
            return false;
        }

        foreach ($walls as $wall) {
            $userMembership = $wall->members->where('user_id', $user->id)->first();
            
            // If strictly excluded, block.
            if ($userMembership && $userMembership->access_type === 'excluded') {
                return true;
            }
            
            // If the wall exists and user is NOT explicitly 'included', block.
            // (Ethical walls are default-deny mechanisms)
            if (!$userMembership || $userMembership->access_type !== 'included') {
                return true;
            }
        }

        return false;
    }
    
    /**
     * Throws an exception preventing access without leaking the matter's name.
     */
    public function enforce(User $user, ?string $matterId, ?string $clientId): void
    {
        if ($this->isBlocked($user, $matterId, $clientId)) {
            // Using a generic error message to prevent enumeration or discovery of the matter
            throw new \DomainException("Access Denied: You do not have permission to view this legal record due to an active Information Barrier.");
        }
    }
}
