<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\EntitlementResolver;

class RequireEntitlement
{
    protected EntitlementResolver $entitlementResolver;

    public function __construct(EntitlementResolver $entitlementResolver)
    {
        $this->entitlementResolver = $entitlementResolver;
    }

    public function handle(Request $request, Closure $next, string $moduleKey)
    {
        // Typically tenant_id comes from authenticated user session/token
        $tenantId = $request->user()->tenant_id ?? 'default-tenant-id';

        $decision = $this->entitlementResolver->evaluateEntitlement($tenantId, $moduleKey);

        if (!$decision['allowed']) {
            return response()->json([
                'error' => 'Entitlement Denied',
                'message' => $decision['message'],
                'reason_code' => $decision['reason_code']
            ], 403);
        }

        return $next($request);
    }
}
