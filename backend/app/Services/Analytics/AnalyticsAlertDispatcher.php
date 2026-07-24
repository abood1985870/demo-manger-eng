<?php

namespace App\Services\Analytics;

use App\Models\Analytics\AnalyticsAlert;

class AnalyticsAlertDispatcher
{
    /**
     * Dispatches notifications or triggers workflows when an alert threshold is breached.
     * Prevents spam by checking cooldowns.
     */
    public function dispatchAlert(AnalyticsAlert $alert, array $context): void
    {
        // 1. Check Cooldown to prevent spam
        if ($alert->last_triggered_at && now()->diffInMinutes($alert->last_triggered_at) < $alert->cooldown_minutes) {
            return; // Still in cooldown
        }

        // 2. Mock Integration with Notification Engine (Step 8)
        // NotificationService::sendToUsers($alert->recipients, 'AnalyticsAlert', $context);
        
        // 3. Mock Integration with Workflow Engine (Step 7)
        if ($alert->trigger_workflow) {
            // WorkflowEngine::triggerEvent('AnalyticsAlertTriggered', $context);
        }

        // 4. Update last triggered
        $alert->update(['last_triggered_at' => now()]);
    }
}
