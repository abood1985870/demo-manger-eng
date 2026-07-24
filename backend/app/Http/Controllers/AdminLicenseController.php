<?php

namespace App\Http\Controllers;

use App\Services\LicenseManagementService;
use Illuminate\Http\Request;

class AdminLicenseController extends Controller
{
    protected LicenseManagementService $licenseService;

    public function __construct(LicenseManagementService $licenseService)
    {
        $this->licenseService = $licenseService;
    }

    public function verifyOffline(Request $request)
    {
        $validated = $request->validate([
            'payload' => 'required|string',
            'signature' => 'required|string',
        ]);

        try {
            $isValid = $this->licenseService->verifyOfflineSignature(
                $validated['payload'], 
                $validated['signature']
            );
            
            return response()->json(['is_valid' => $isValid]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
