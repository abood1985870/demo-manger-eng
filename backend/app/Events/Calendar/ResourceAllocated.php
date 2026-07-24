<?php

namespace App\Events\Calendar;

use App\Events\BaseSystemEvent;
use App\Models\ResourceAllocation;

class ResourceAllocated extends BaseSystemEvent
{
    public ResourceAllocation $allocation;

    public function __construct(ResourceAllocation $allocation)
    {
        $this->allocation = $allocation;
    }

    public function getEventName(): string
    {
        return 'ResourceAllocated';
    }

    public function getModule(): string
    {
        return 'ResourceManagement';
    }

    public function getPayload(): array
    {
        return [
            'allocation_id' => $this->allocation->id,
            'resource_id' => $this->allocation->resource_id,
            'allocatable_type' => $this->allocation->allocatable_type,
            'allocatable_id' => $this->allocation->allocatable_id,
            'start_datetime' => $this->allocation->start_datetime,
            'end_datetime' => $this->allocation->end_datetime,
        ];
    }
}
