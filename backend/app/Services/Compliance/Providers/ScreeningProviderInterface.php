<?php

namespace App\Services\Compliance\Providers;

use App\Models\Compliance\ScreeningRequest;

interface ScreeningProviderInterface
{
    /**
     * Dispatches the subject to the external provider for screening.
     * Must return true if successfully accepted by provider.
     */
    public function submitRequest(ScreeningRequest $request, array $subjectData): bool;

    /**
     * Handles the callback or polling mechanism to retrieve match results.
     * Important: Must NOT claim 'clearance' if it's just a mock adapter.
     */
    public function retrieveResults(ScreeningRequest $request): array;
}
