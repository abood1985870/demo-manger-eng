<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Base Event class that all system events must extend.
 * This guarantees the EventBusService can extract metadata uniformly.
 */
abstract class BaseSystemEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The official name of the event in the `events` table (e.g. TaskCreated)
     */
    abstract public function getEventName(): string;

    /**
     * The module this event originated from.
     */
    abstract public function getModule(): string;

    /**
     * The payload/metadata associated with the event for the Bus.
     */
    abstract public function getPayload(): array;
}
