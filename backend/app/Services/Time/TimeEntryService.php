<?php

namespace App\Services\Time;

use App\Models\Time\ActiveTimer;
use App\Models\Time\TimeEntry;
use App\Models\Time\TimerEvent;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TimeEntryService
{
    /**
     * Creates a manual time entry, detecting overlaps based on policy.
     */
    public function createManualEntry(array $data, string $overlapPolicy = 'prohibit'): TimeEntry
    {
        return DB::transaction(function () use ($data, $overlapPolicy) {
            
            // Overlap Detection
            if (isset($data['start_time']) && isset($data['end_time'])) {
                $overlaps = TimeEntry::where('user_id', $data['user_id'])
                    ->where(function ($q) use ($data) {
                        $q->whereBetween('start_time', [$data['start_time'], $data['end_time']])
                          ->orWhereBetween('end_time', [$data['start_time'], $data['end_time']])
                          ->orWhere(function ($q2) use ($data) {
                              $q2->where('start_time', '<=', $data['start_time'])
                                 ->where('end_time', '>=', $data['end_time']);
                          });
                    })->exists();

                if ($overlaps) {
                    if ($overlapPolicy === 'prohibit') {
                        throw new \DomainException("Time entry overlaps with an existing record.");
                    }
                    // Handle 'allow_with_warning' etc. via specific workflows if needed
                }
            }

            return TimeEntry::create($data);
        });
    }

    /**
     * Starts a timer for a user. Enforces uniqueness constraint.
     */
    public function startTimer(string $userId, string $tenantId, array $contextData = []): ActiveTimer
    {
        return DB::transaction(function () use ($userId, $tenantId, $contextData) {
            
            // Check for existing running timer
            $existing = ActiveTimer::where('user_id', $userId)
                ->where('status', 'running')
                ->lockForUpdate() // concurrency safe
                ->first();

            if ($existing) {
                throw new \DomainException("User already has an active timer running.");
            }

            $timer = ActiveTimer::create(array_merge([
                'user_id' => $userId,
                'tenant_id' => $tenantId,
                'status' => 'running',
                'started_at' => now(),
                'last_resumed_at' => now(),
            ], $contextData));

            TimerEvent::create([
                'timer_id' => $timer->id,
                'event_type' => 'start',
                'occurred_at' => now(),
            ]);

            return $timer;
        });
    }

    /**
     * Stops an active timer and safely converts it to an immutable TimeEntry.
     */
    public function stopTimer(string $timerId, string $idempotencyKey = null): TimeEntry
    {
        return DB::transaction(function () use ($timerId, $idempotencyKey) {
            $timer = ActiveTimer::where('id', $timerId)->lockForUpdate()->firstOrFail();

            if ($timer->status === 'stopped') {
                throw new \DomainException("Timer is already stopped.");
            }

            $now = now();
            $durationSeconds = $timer->accumulated_seconds;

            if ($timer->status === 'running') {
                $durationSeconds += $timer->last_resumed_at->diffInSeconds($now);
            }

            // Create Immutable Event
            TimerEvent::create([
                'timer_id' => $timer->id,
                'event_type' => 'stop',
                'occurred_at' => $now,
            ]);

            // Convert to entry
            $entry = TimeEntry::create([
                'tenant_id' => $timer->tenant_id,
                'user_id' => $timer->user_id,
                'project_id' => $timer->project_id,
                'task_id' => $timer->task_id,
                'entry_date' => $now->toDateString(), // Simplified boundary assumption
                'start_time' => $timer->started_at,
                'end_time' => $now,
                'duration_minutes' => (int) round($durationSeconds / 60),
                'source' => 'timer',
                'description' => $timer->description,
            ]);

            // Soft delete timer or mark stopped to free the unique constraint
            $timer->status = 'stopped';
            $timer->save();
            // Alternatively $timer->delete() if using softDeletes.

            return $entry;
        });
    }
}
