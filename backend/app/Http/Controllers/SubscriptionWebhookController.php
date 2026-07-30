<?php

namespace App\Http\Controllers;

use App\Models\License;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SubscriptionWebhookController extends Controller
{
    /**
     * Handle incoming webhooks from payment gateways (e.g., Stripe, Moyasar)
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $eventType = $payload['type'] ?? $payload['event'] ?? '';

        Log::info('Received Webhook:', $payload);

        if ($eventType === 'payment.success' || $eventType === 'invoice.payment_succeeded') {
            // Find tenant by metadata or customer ID
            $tenantId = $payload['data']['object']['metadata']['tenant_id'] ?? null;
            
            if (!$tenantId) {
                // Fallback or specific logic for finding tenant
                return response()->json(['error' => 'No tenant ID found in metadata'], 400);
            }

            $license = License::where('tenant_id', $tenantId)->where('status', 'ACTIVE')->first();
            
            if ($license) {
                // Extend the license by 1 month or 1 year depending on plan.
                // Assuming monthly for this mock implementation
                $currentEnd = $license->valid_until ? clone $license->valid_until : now();
                $license->valid_until = current($currentEnd) < now() ? now()->addDays(30) : $currentEnd->addDays(30);
                $license->save();

                Log::info("License extended for tenant {$tenantId}. New expiry: {$license->valid_until}");
            }
        }

        return response()->json(['received' => true]);
    }
}
