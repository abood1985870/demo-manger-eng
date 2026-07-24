<?php

namespace App\Services\Scheduling;

use Carbon\Carbon;

/**
 * Resolves working-day durations by consulting the working_hours and holidays tables.
 * This service wraps Step 9's calendar infrastructure.
 *
 * Calendar Precedence (highest to lowest):
 *  1. Task-specific calendar (schedule_item.calendar_id)
 *  2. Project calendar (project_schedule.default_calendar_id)
 *  3. Department/Company calendar
 *  4. Tenant default calendar
 */
class CalendarAwareDurationService
{
    /**
     * Adds a given number of working days to a start date, returning the finish date.
     * Respects configured non-working days (weekends + holidays).
     *
     * @param Carbon $startDate
     * @param float  $durationDays  Number of working days
     * @param string|null $calendarId  Calendar to consult (null = use simple Mon-Fri logic)
     * @return Carbon
     */
    public function addWorkingDays(Carbon $startDate, float $durationDays, ?string $calendarId = null): Carbon
    {
        if ($durationDays <= 0) {
            return $startDate->copy();
        }

        // Load non-working days from the database for the calendar
        $nonWorkingDays = $this->loadNonWorkingDates($calendarId, $startDate, 365);

        $current = $startDate->copy();
        $remaining = $durationDays;

        while ($remaining > 0) {
            $current->addDay();
            if ($this->isWorkingDay($current, $nonWorkingDays)) {
                $remaining--;
            }
        }

        return $current;
    }

    /**
     * Counts working days between two dates (inclusive of start, exclusive of finish).
     */
    public function countWorkingDays(Carbon $start, Carbon $finish, ?string $calendarId = null): float
    {
        $nonWorkingDays = $this->loadNonWorkingDates($calendarId, $start, $start->diffInDays($finish) + 10);

        $count = 0;
        $current = $start->copy();

        while ($current->lt($finish)) {
            if ($this->isWorkingDay($current, $nonWorkingDays)) {
                $count++;
            }
            $current->addDay();
        }

        return (float) $count;
    }

    protected function isWorkingDay(Carbon $date, array $nonWorkingDates): bool
    {
        // Weekend check (Saturday=6, Sunday=0 in Carbon)
        if ($date->isWeekend()) {
            return false;
        }
        // Holiday check
        return !in_array($date->toDateString(), $nonWorkingDates);
    }

    /**
     * Loads holiday/non-working dates from the database.
     * Integrates with Step 9's `holidays` table.
     */
    protected function loadNonWorkingDates(?string $calendarId, Carbon $from, int $days): array
    {
        if (!$calendarId) {
            return []; // Fall back to simple Mon-Fri
        }

        $to = $from->copy()->addDays($days);

        return \DB::table('holidays')
            ->where('calendar_id', $calendarId)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->toArray();
    }
}
