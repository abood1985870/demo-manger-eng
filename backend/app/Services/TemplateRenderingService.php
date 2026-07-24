<?php

namespace App\Services;

use App\Models\NotificationTemplate;

class TemplateRenderingService
{
    /**
     * Render a template using the provided payload variables.
     */
    public function render(string $templateName, string $language, array $variables): string
    {
        $template = NotificationTemplate::where('name', $templateName)->first();
        if (!$template) {
            return "Template not found.";
        }

        $bodyText = $template->body[$language] ?? $template->body['en'] ?? '';

        // Simple Handlebars style replacement {{VariableName}}
        foreach ($variables as $key => $value) {
            if (is_scalar($value)) {
                $bodyText = str_replace("{{" . $key . "}}", (string)$value, $bodyText);
            }
        }

        return $bodyText;
    }
}
