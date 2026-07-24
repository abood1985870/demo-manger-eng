<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\ModuleRegistryService;

class RequireModule
{
    protected ModuleRegistryService $moduleService;

    public function __construct(ModuleRegistryService $moduleService)
    {
        $this->moduleService = $moduleService;
    }

    public function handle(Request $request, Closure $next, string $moduleKey)
    {
        if (!$this->moduleService->isModuleEnabled($moduleKey)) {
            return response()->json([
                'error' => 'Module Not Enabled',
                'message' => "The required module [{$moduleKey}] is not enabled on this platform."
            ], 403);
        }

        return $next($request);
    }
}
