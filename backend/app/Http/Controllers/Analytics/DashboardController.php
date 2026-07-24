<?php

namespace App\Http\Controllers\Analytics;

use App\Http\Controllers\Controller;
use App\Models\Analytics\Dashboard;
use App\Services\Analytics\DashboardQueryService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected DashboardQueryService $queryService;

    public function __construct(DashboardQueryService $queryService)
    {
        $this->queryService = $queryService;
    }

    public function index(Request $request)
    {
        // Enforce Entitlement via Middleware, but here we just fetch basic lists
        $tenantId = $request->user()->tenant_id ?? 'default-tenant';
        
        $dashboards = Dashboard::where('tenant_id', $tenantId)
            ->where(function ($query) use ($request) {
                $query->where('visibility', 'Tenant')
                      ->orWhere('owner_id', $request->user()->id ?? 1);
            })
            ->get();

        return response()->json($dashboards);
    }

    public function show(Request $request, string $id)
    {
        try {
            $tenantId = $request->user()->tenant_id ?? 'default-tenant';
            $userId = $request->user()->id ?? 1;

            $dashboard = $this->queryService->getDashboard($id, $tenantId, $userId);

            return response()->json($dashboard);

        } catch (\DomainException $e) {
            return response()->json(['error' => 'Entitlement/Access Denied', 'message' => $e->getMessage()], 403);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Not Found', 'message' => 'Dashboard not found.'], 404);
        }
    }
}
