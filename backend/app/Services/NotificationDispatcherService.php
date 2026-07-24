<?php

namespace App\Services;

use App\Models\NotificationPreference;
use App\DTOs\Notification\NotificationPayloadDTO;
use Carbon\Carbon;

class NotificationDispatcherService
{
    /**
     * Determines whether to send immediately, hold for digest, or skip based on user preferences.
     */
    public function dispatchToUser(int $userId, NotificationPayloadDTO $payload)
    {
        $prefs = NotificationPreference::where('user_id', $userId)->first();

        // Skip if entirely disabled
        if ($prefs && !$prefs->enable_notifications) {
            return;
        }

        // Check Quiet Hours
        if ($this->isQuietHours($prefs)) {
            // Queue for later or suppress based on policy
            return; // Example: Skip or delay
        }

        // Check Muted Contexts (e.g. Muted Project)
        if ($this->isMutedContext($prefs, $payload)) {
            return;
        }

        // Digest Mode
        if ($prefs && $prefs->digest_mode) {
            // Push to `notification_queue` with status = 'held_for_digest'
            return;
        }

        // Instant Delivery - Resolve channels and Push to Laravel Queue
        $channels = $prefs ? $prefs->preferred_channels : ['in_app'];

        foreach ($channels as $channelName) {
            // e.g. DeliverNotificationJob::dispatch($userId, $channelName, $payload);
        }
    }

    protected function isQuietHours(?NotificationPreference $prefs): bool
    {
        if (!$prefs || !$prefs->quiet_hours_start || !$prefs->quiet_hours_end) return false;
        
        $now = Carbon::now($prefs->timezone);
        $start = Carbon::parse($prefs->quiet_hours_start, $prefs->timezone);
        $end = Carbon::parse($prefs->quiet_hours_end, $prefs->timezone);

        return $now->between($start, $end);
    }

    protected function isMutedContext(?NotificationPreference $prefs, NotificationPayloadDTO $payload): bool
    {
        if (!$prefs || !$payload->relatedType || !$payload->relatedId) return false;
        
        // Example check if project ID is in muted_projects array
        if ($payload->relatedType === 'Project' && in_array($payload->relatedId, $prefs->muted_projects ?? [])) {
            return true;
        }
        
        return false;
    }
}
