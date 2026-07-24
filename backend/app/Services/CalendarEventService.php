<?php

namespace App\Services;

use App\Models\CalendarEvent;
use App\Events\Calendar\CalendarEventCreated;

class CalendarEventService
{
    /**
     * Create an event and dispatch to Event Bus.
     */
    public function createEvent(array $data)
    {
        $event = CalendarEvent::create($data);

        // If recurring rule is present, physically expand instances in the DB 
        // up to the 12-month window for fast conflict detection.
        if (isset($data['rrule_string'])) {
            $this->expandRecurrence($event, $data['rrule_string']);
        }

        // Enterprise Scheduling Rule: Dispatch Event
        event(new CalendarEventCreated($event));

        return $event;
    }

    protected function expandRecurrence(CalendarEvent $parent, string $rrule)
    {
        // Parse RRULE and bulk insert children pointing to `parent_id`
    }
}
