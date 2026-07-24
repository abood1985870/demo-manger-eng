<?php

namespace App\Services\Compliance;

use App\Models\Compliance\ComplianceCase;
use App\Models\User;

class ComplianceAccessResolver
{
    /**
     * Determines if a User can access a Compliance Case and at what depth.
     * Prevents normal lawyers from seeing confidential compliance notes (e.g. AML suspicions).
     */
    public function canAccess(User $user, ComplianceCase $case, string $action = 'view'): bool
    {
        // 1. Firm Admins and specific Compliance Officers have full access
        if ($user->hasRole('compliance_officer') || $user->hasRole('admin')) {
            return true;
        }

        // 2. Normal lawyers can see the *status* of a case linked to their matter,
        // but they cannot 'manage' or 'review_sensitive' details.
        if ($action === 'view') {
            // Check if the user is part of the Matter team (Assuming logic here)
            return true; // Simplified for MVP: Matter team can see the status
        }

        // 3. Any action beyond basic viewing (like overriding risk or reviewing a match)
        // is strictly denied to non-compliance users.
        return false;
    }
}
