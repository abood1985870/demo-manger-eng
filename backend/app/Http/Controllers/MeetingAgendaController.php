<?php

namespace App\Http\Controllers;

use App\Services\MeetingAgendaService;
use Illuminate\Http\Request;

class MeetingAgendaController extends Controller
{
    protected MeetingAgendaService $agendaService;

    public function __construct(MeetingAgendaService $agendaService)
    {
        $this->agendaService = $agendaService;
    }

    public function sync(Request $request, string $agendaId)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.title_en' => 'required|string',
            'items.*.purpose' => 'nullable|string',
            'items.*.planned_duration_minutes' => 'nullable|integer',
        ]);

        $agenda = $this->agendaService->syncAgendaItems($agendaId, $validated['items']);

        return response()->json($agenda);
    }
}
