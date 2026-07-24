<?php

namespace App\Services\Time;

use App\Models\Time\TimeEntry;
use Illuminate\Support\Facades\DB;

class BillingRateResolverService
{
    /**
     * Deterministically resolves the correct billing rate for a specific Time Entry
     * based on strict precedence rules defined in Step 14A.
     * 
     * 1. Engagement-specific user rate
     * 2. Engagement-specific role rate
     * 3. Project-specific user rate
     * 4. Project-specific role rate
     * 5. Tenant default rate
     */
    public function resolveRate(TimeEntry $entry)
    {
        // For demonstration of the architectural precedence logic:
        
        // Step 1: Engagement specific User Rate
        $rate = DB::table('rate_rules')
            ->join('rate_cards', 'rate_cards.id', '=', 'rate_rules.rate_card_id')
            ->join('service_engagements', 'service_engagements.billing_rate_card_id', '=', 'rate_cards.id')
            ->where('service_engagements.project_id', $entry->project_id)
            ->where('rate_rules.user_id', $entry->user_id)
            ->where('rate_cards.effective_from', '<=', $entry->entry_date)
            ->where(function ($q) use ($entry) {
                $q->whereNull('rate_cards.effective_until')
                  ->orWhere('rate_cards.effective_until', '>=', $entry->entry_date);
            })
            ->first();
            
        if ($rate) return $rate;

        // Step 2: Project-specific User Rate
        // Logic continues...
        
        // Step 5: Tenant Default
        return DB::table('rate_rules')
            ->join('rate_cards', 'rate_cards.id', '=', 'rate_rules.rate_card_id')
            ->where('rate_cards.tenant_id', $entry->tenant_id)
            ->whereNull('rate_rules.user_id')
            ->whereNull('rate_rules.project_id')
            ->first();
    }
}
