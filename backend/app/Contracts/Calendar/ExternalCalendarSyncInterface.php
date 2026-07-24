<?php

namespace App\Contracts\Calendar;

use App\Models\CalendarEvent;

interface ExternalCalendarSyncInterface
{
    /**
     * Push a local event to the external provider (Exchange, Google).
     */
    public function pushEvent(CalendarEvent $event): bool;

    /**
     * Fetch updates from the external provider.
     */
    public function syncFromProvider(string $calendarId): array;
}
