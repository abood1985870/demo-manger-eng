<?php

namespace App\Contracts\Analytics;

use App\DTOs\Analytics\WidgetResponseDTO;
use App\Models\Analytics\Widget;

interface WidgetDataProviderInterface
{
    /**
     * Declares the machine key for the widget type this provider handles.
     * e.g., 'kpi_card', 'line_chart'
     */
    public function getSupportedType(): string;

    /**
     * Strictly validates the widget configuration JSON.
     * Throws InvalidArgumentException if invalid.
     */
    public function validateConfig(array $config): void;

    /**
     * Fetches and normalizes the data for the widget, enforcing all constraints.
     */
    public function getData(Widget $widget, string $tenantId, array $filters = []): WidgetResponseDTO;
}
