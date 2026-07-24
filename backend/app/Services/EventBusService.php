<?php

namespace App\Services;

use App\Events\BaseSystemEvent;
use Illuminate\Support\Facades\Log;

class EventBusService
{
    /**
     * Entry point for all system events.
     * Evaluates rules, triggers notifications, and writes audit logs.
     */
    public function dispatchSystemEvent(BaseSystemEvent $event)
    {
        $eventName = $event->getEventName();
        $payload = $event->getPayload();

        // 1. Audit Logging (Persist metadata to DB or NoSQL)
        // AuditLogService::logEvent($eventName, $payload);

        // 2. Workflow Triggering (Handled by WorkflowEventSubscriber, but could be explicitly called here)
        // app(WorkflowEngineService::class)->triggerByEvent($eventName, $payload);

        // 3. Notification Routing
        $this->triggerNotifications($eventName, $payload);
    }

    protected function triggerNotifications(string $eventName, array $payload)
    {
        // Query `notification_rules` or `event_subscribers` for this event.
        // E.g. Find all users subscribed to Project X if event is ProjectUpdated.
        // Then pass those users and the payload to NotificationDispatcherService.
    }
}
