<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Services\ModuleRegistryService;
use Illuminate\Http\Request;

class AdminModuleController extends Controller
{
    protected ModuleRegistryService $registry;

    public function __construct(ModuleRegistryService $registry)
    {
        $this->registry = $registry;
    }

    public function index()
    {
        // Require platform-admin permission
        return response()->json(Module::with('dependencies')->get());
    }

    public function enable(Request $request, string $machineKey)
    {
        try {
            $module = $this->registry->enableModule($machineKey);
            return response()->json([
                'message' => 'Module enabled successfully', 
                'module' => $module
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
