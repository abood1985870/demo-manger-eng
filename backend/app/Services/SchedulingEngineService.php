<?php

namespace App\Services;

use App\Models\ResourceAllocation;
use App\Events\Calendar\ResourceAllocated;
use Exception;

class SchedulingEngineService
{
    protected ConflictDetectionService $conflictDetector;

    public function __construct(ConflictDetectionService $conflictDetector)
    {
        $this->conflictDetector = $conflictDetector;
    }

    /**
     * Book a resource, throwing an exception if a conflict exists.
     */
    public function bookResource(array $data)
    {
        // Strict Conflict Check
        $isAvailable = $this->conflictDetector->isResourceAvailable(
            $data['resource_id'],
            $data['start_datetime'],
            $data['end_datetime']
        );

        if (!$isAvailable) {
            throw new Exception("Resource is not available during this timeframe.");
        }

        $allocation = ResourceAllocation::create($data);

        // Enterprise Scheduling Rule: Dispatch Event
        event(new ResourceAllocated($allocation));

        return $allocation;
    }

    /**
     * AI/Algorithm feature: Suggest the nearest available block of time.
     */
    public function suggestNearestTime(string $resourceId, int $durationMinutes, string $afterUtc)
    {
        // Incrementally scan blocks using ConflictDetectionService until a free slot is found.
    }
}
