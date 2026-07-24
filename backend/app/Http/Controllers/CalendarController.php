<?php

namespace App\Http\Controllers;

use App\Services\CalendarEventService;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    protected CalendarEventService $eventService;

    public function __construct(CalendarEventService $eventService)
    {
        $this->eventService = $eventService;
    }

    public function storeEvent(Request $request)
    {
        $validated = $request->validate([
            'calendar_id' => 'required|uuid',
            'event_type' => 'required|string',
            'title' => 'required|string|max:255',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'timezone' => 'required|string',
            'rrule_string' => 'nullable|string',
        ]);

        $validated['organizer_id'] = $request->user()->id ?? 1;

        $event = $this->eventService->createEvent($validated);

        return response()->json($event, 201);
    }
}
