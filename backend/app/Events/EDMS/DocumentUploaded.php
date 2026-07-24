<?php

namespace App\Events\EDMS;

use App\Models\Document;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DocumentUploaded implements ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Document $document;
    public string $filePath;

    public function __construct(Document $document, string $filePath)
    {
        $this->document = $document;
        $this->filePath = $filePath;
    }
}
