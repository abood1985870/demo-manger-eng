<?php

namespace App\DTOs\Analytics;

class WidgetResponseDTO
{
    public string $widget_id;
    public string $widget_type;
    public string $title;
    
    public ?float $value = null;
    public ?string $unit = null;
    
    public array $labels = [];
    public array $series = [];
    
    public ?float $target = null;
    public ?string $trend = null; // 'up', 'down', 'flat'
    
    public string $time_range = '';
    public array $filters = [];
    
    public string $freshness = 'real-time';
    public string $calculated_at;
    
    public ?string $drill_down = null;
    public ?string $warnings = null;

    public function toArray(): array
    {
        return [
            'widget_id' => $this->widget_id,
            'widget_type' => $this->widget_type,
            'title' => $this->title,
            'value' => $this->value,
            'unit' => $this->unit,
            'labels' => $this->labels,
            'series' => $this->series,
            'target' => $this->target,
            'trend' => $this->trend,
            'time_range' => $this->time_range,
            'filters' => $this->filters,
            'freshness' => $this->freshness,
            'calculated_at' => $this->calculated_at,
            'drill_down' => $this->drill_down,
            'warnings' => $this->warnings,
        ];
    }
}
