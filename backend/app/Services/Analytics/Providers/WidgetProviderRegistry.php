<?php

namespace App\Services\Analytics\Providers;

use App\Contracts\Analytics\WidgetDataProviderInterface;
use InvalidArgumentException;

class WidgetProviderRegistry
{
    protected array $providers = [];

    public function register(WidgetDataProviderInterface $provider): void
    {
        $this->providers[$provider->getSupportedType()] = $provider;
    }

    public function getProvider(string $type): WidgetDataProviderInterface
    {
        if (!isset($this->providers[$type])) {
            throw new InvalidArgumentException("No provider registered for widget type: {$type}");
        }

        return $this->providers[$type];
    }
}
