<?php

namespace App\Services;

use App\Models\Module;
use Exception;
use Illuminate\Support\Facades\Cache;

class ModuleRegistryService
{
    /**
     * Check if a module is enabled. Cached for extreme performance.
     */
    public function isModuleEnabled(string $machineKey): bool
    {
        return Cache::remember("module_enabled_{$machineKey}", 3600, function () use ($machineKey) {
            $module = Module::where('machine_key', $machineKey)->first();
            return $module && $module->is_installed && $module->is_enabled && $module->health_status === 'healthy';
        });
    }

    /**
     * Enables a module, strictly validating that all required dependencies are already enabled.
     */
    public function enableModule(string $machineKey)
    {
        $module = Module::where('machine_key', $machineKey)->with('dependencies')->firstOrFail();

        foreach ($module->dependencies as $dependency) {
            if ($dependency->pivot->is_required && !$this->isModuleEnabled($dependency->machine_key)) {
                throw new Exception("Cannot enable [{$machineKey}]. Required dependency [{$dependency->machine_key}] is not enabled.");
            }
        }

        $module->update([
            'is_enabled' => true,
            'enabled_at' => now(),
        ]);

        Cache::forget("module_enabled_{$machineKey}");

        return $module;
    }
}
