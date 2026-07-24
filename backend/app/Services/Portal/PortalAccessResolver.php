<?php

namespace App\Services\Portal;

use App\Models\Portal\PortalAccount;
use App\Models\Portal\PortalAccessGrant;
use App\Services\Legal\EthicalWallGuard;
use Illuminate\Support\Facades\Log;

class PortalAccessResolver
{
    public function __construct(
        protected EthicalWallGuard $ethicalWallGuard
    ) {}

    /**
     * Determines if a PortalAccount can access a specific resource.
     * Implements strict DENY-BY-DEFAULT.
     */
    public function canAccess(PortalAccount $account, string $resourceType, string $resourceId, string $action = 'view'): bool
    {
        if ($account->status !== 'active') {
            Log::warning("Portal access denied: Account {$account->id} is not active.");
            return false;
        }

        // 1. Check Explicit Portal Grant
        $grant = PortalAccessGrant::where('portal_account_id', $account->id)
            ->where('resource_type', $resourceType)
            ->where('resource_id', $resourceId)
            ->where(function($query) use ($action) {
                if ($action === 'view') $query->where('can_view', true);
                if ($action === 'upload') $query->where('can_upload', true);
                if ($action === 'download') $query->where('can_download', true);
                if ($action === 'comment') $query->where('can_comment', true);
            })
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->first();

        if (!$grant) {
            Log::warning("Portal access denied: No valid grant found for account {$account->id} on {$resourceType} {$resourceId}.");
            return false;
        }

        // 2. Cross-verify with the Core Ethical Wall using the linked Contact ID
        // The portal grant cannot override a core ethical wall block!
        if ($resourceType === 'legal_matter') {
            try {
                // We use a mock user representing the external contact's logical constraints
                $mockUser = (object)[
                    'id' => $account->contact_id,
                    'tenant_id' => $account->tenant_id
                ];
                // In a real implementation, EthicalWallGuard would accept a Contact ID or User ID.
                $this->ethicalWallGuard->enforce($mockUser, $resourceId, null);
            } catch (\Exception $e) {
                Log::warning("Portal access denied: Ethical Wall blocked contact {$account->contact_id}.");
                return false;
            }
        }

        return true;
    }
}
