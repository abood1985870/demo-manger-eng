<?php

namespace App\Services;

use App\Models\MeetingAgenda;
use App\Models\MeetingAgendaItem;
use Illuminate\Support\Facades\DB;

class MeetingAgendaService
{
    /**
     * Add or update agenda items in bulk, managing sequence ordering.
     */
    public function syncAgendaItems(string $agendaId, array $items)
    {
        return DB::transaction(function () use ($agendaId, $items) {
            $agenda = MeetingAgenda::findOrFail($agendaId);
            
            // Delete existing items for full sync (or implement a smart diff if preferred)
            MeetingAgendaItem::where('agenda_id', $agendaId)->delete();
            
            $sequence = 1;
            foreach ($items as $itemData) {
                MeetingAgendaItem::create([
                    'agenda_id' => $agenda->id,
                    'sequence_number' => $sequence++,
                    'title_en' => $itemData['title_en'],
                    'purpose' => $itemData['purpose'] ?? 'Discussion',
                    'planned_duration_minutes' => $itemData['planned_duration_minutes'] ?? 0,
                    'presenter_id' => $itemData['presenter_id'] ?? null,
                ]);
            }
            
            $agenda->update(['version' => (float)$agenda->version + 0.1]);
            
            return $agenda->load('items');
        });
    }
}
