<?php

namespace App\Events\Calendar;

use App\Events\BaseSystemEvent;
use App\Models\CalendarEvent;

class CalendarEventCreated extends BaseSystemEvent
{
    public CalendarEvent $event;

    public function __construct(CalendarEvent $event)
    {
        $this->event = $event;
    }

    public function getEventName(): string
    {
        return 'CalendarEventCreated';
    }

    public function getModule(): string
    {
        return 'Calendar';
    }

    public function getPayload(): array
    {
        return [
            'event_id' => $this->event->id,
            'title' => $this->event->title,
            'start_datetime' => $this->event->start_datetime,
            'end_datetime' => $this->event->end_datetime,
            'organizer_id' => $this->event->organizer_id,
        ];
    }
}
