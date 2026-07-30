<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PermissionsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $role = strtoupper($request->user()->role);

        // Only ADMIN, SYSTEM_ADMIN, OWNER can see permissions
        if (!in_array($role, ['ADMIN', 'SYSTEM_ADMIN', 'OWNER', 'SUPER_ADMIN'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $users = User::where('tenant_id', $tenantId)->get(['id', 'name', 'email', 'role', 'modulePermissions']);
        
        return response()->json($users);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $role = strtoupper($request->user()->role);

        if (!in_array($role, ['ADMIN', 'SYSTEM_ADMIN', 'OWNER', 'SUPER_ADMIN'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'modulePermissions' => 'required|array',
        ]);

        $userToUpdate = User::where('tenant_id', $tenantId)->where('id', $id)->firstOrFail();
        
        // Save as JSON string or array depending on model casts. Assuming array if casted, or string if not.
        // auth.ts expects a JSON string or object.
        $userToUpdate->modulePermissions = json_encode($validated['modulePermissions']);
        $userToUpdate->save();

        // Optional: trigger session invalidation or refresh if needed
        $userToUpdate->increment('sessionVersion');

        return response()->json(['success' => true, 'user' => $userToUpdate]);
    }
}
