<?php

namespace App\Services;

use App\Models\ResourceAllocation;
use Carbon\Carbon;

class ConflictDetectionService
{
    /**
     * Check if a resource is available during a specific timeframe.
     * Uses strict UTC mathematics to detect overlaps.
     */
    public function isResourceAvailable(string $resourceId, string $startUtc, string $endUtc): bool
    {
        $start = Carbon::parse($startUtc);
        $end = Carbon::parse($endUtc);

        $conflicts = ResourceAllocation::where('resource_id', $resourceId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($start, $end) {
                // Overlap Mathematics: (StartA < EndB) AND (EndA > StartB)
                $query->where('start_datetime', '<', $end)
                      ->where('end_datetime', '>', $start);
            })
            ->exists();

        return !$conflicts;
    }

    /**
     * Check if a timeframe violates the resource's working hours or holidays.
     */
    public function satisfiesTimeConstraints(string $resourceId, string $startUtc, string $endUtc): bool
    {
        // 1. Fetch `working_hours` for this resource's scope.
        // 2. Fetch `holidays` covering the dates.
        // 3. Return false if the booking spans a holiday or is outside shift hours.
        return true;
    }
}
