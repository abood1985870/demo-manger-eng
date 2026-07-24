<?php

namespace App\Http\Controllers;

use App\Services\SchedulingEngineService;
use Illuminate\Http\Request;

class ResourceBookingController extends Controller
{
    protected SchedulingEngineService $schedulingEngine;

    public function __construct(SchedulingEngineService $schedulingEngine)
    {
        $this->schedulingEngine = $schedulingEngine;
    }

    public function book(Request $request)
    {
        $validated = $request->validate([
            'resource_id' => 'required|uuid',
            'allocatable_type' => 'required|string', // e.g. Project, CalendarEvent
            'allocatable_id' => 'required|string',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'allocation_percentage' => 'nullable|numeric|min:1|max:100',
        ]);

        $validated['status'] = 'confirmed';
        $validated['booked_by'] = $request->user()->id ?? 1;

        try {
            $allocation = $this->schedulingEngine->bookResource($validated);
            return response()->json($allocation, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 409); // 409 Conflict
        }
    }
}
