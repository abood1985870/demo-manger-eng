<?php

namespace App\Events\EDMS;

use App\Models\Document;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DocumentDownloaded implements ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Document $document;
    public int $userId;

    public function __construct(Document $document, int $userId)
    {
        $this->document = $document;
        $this->userId = $userId;
    }
}
