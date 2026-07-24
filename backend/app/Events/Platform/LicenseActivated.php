<?php

namespace App\Events\Platform;

use App\Events\BaseSystemEvent;
use App\Models\License;

class LicenseActivated extends BaseSystemEvent
{
    public License $license;

    public function __construct(License $license)
    {
        $this->license = $license;
    }

    public function getEventName(): string
    {
        return 'LicenseActivated';
    }

    public function getModule(): string
    {
        return 'Platform';
    }

    public function getPayload(): array
    {
        return [
            'license_id' => $this->license->id,
            'tenant_id' => $this->license->tenant_id,
            'edition_id' => $this->license->edition_id,
            'plan_id' => $this->license->plan_id,
            'valid_until' => $this->license->valid_until,
        ];
    }
}
