<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Services\MeetingLifecycleService;
use App\Services\CalendarEventService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MeetingController extends Controller
{
    protected MeetingLifecycleService $lifecycleService;

    public function __construct(MeetingLifecycleService $lifecycleService)
    {
        $this->lifecycleService = $lifecycleService;
    }

    public function store(Request $request, CalendarEventService $calendarService)
    {
        $validated = $request->validate([
            'title_en' => 'required|string',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date',
            'timezone' => 'required|string',
            'organizer_id' => 'required|exists:users,id',
            // other fields...
        ]);

        return DB::transaction(function () use ($validated, $calendarService) {
            // Enterprise Rule: Creating a meeting automatically wraps a CalendarEvent for conflict detection
            $calendarEvent = $calendarService->createEvent([
                'calendar_id' => 'system-default-calendar-id', // Simplified
                'event_type' => 'meeting',
                'title' => $validated['title_en'],
                'start_datetime' => $validated['start_datetime'],
                'end_datetime' => $validated['end_datetime'],
                'timezone' => $validated['timezone'],
                'organizer_id' => $validated['organizer_id'],
            ]);

            $meeting = Meeting::create([
                'meeting_number' => 'MTG-' . date('Y') . '-' . rand(1000, 9999),
                'calendar_event_id' => $calendarEvent->id,
                'title_en' => $validated['title_en'],
                'organizer_id' => $validated['organizer_id'],
            ]);

            return response()->json($meeting, 201);
        });
    }

    public function transition(Request $request, string $id)
    {
        $validated = $request->validate([
            'new_status' => 'required|string',
            'reason' => 'nullable|string'
        ]);

        $userId = $request->user()->id ?? 1;

        $meeting = $this->lifecycleService->transitionStatus(
            $id, $validated['new_status'], $userId, $validated['reason']
        );

        return response()->json($meeting);
    }
}
