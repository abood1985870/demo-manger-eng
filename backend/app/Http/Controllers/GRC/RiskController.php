<?php

namespace App\Http\Controllers\GRC;

use App\Guards\EntitlementGuard;
use App\Http\Controllers\Controller;
use App\Services\GRC\RiskAssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RiskController extends Controller
{
    public function __construct(
        protected EntitlementGuard $entitlementGuard,
        protected RiskAssessmentService $riskService
    ) {}

    public function submitAssessment(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'risks.assess');

        $validated = $request->validate([
            'risk_id' => 'required|uuid',
            'scoring_model_id' => 'required|uuid',
            'inherent_likelihood' => 'required|numeric',
            'inherent_impact' => 'required|numeric',
            'residual_likelihood' => 'required|numeric',
            'residual_impact' => 'required|numeric',
            'assumptions' => 'nullable|string',
        ]);

        $validated['assessor_id'] = $request->user()->id;

        $assessment = $this->riskService->submitAssessment($validated);

        return response()->json([
            'message' => 'Risk assessment submitted successfully.',
            'assessment' => $assessment
        ]);
    }

    public function approveAssessment(Request $request, string $assessmentId): JsonResponse
    {
        $tenantId = $request->user()->tenant_id ?? 'default';
        $this->entitlementGuard->enforce($tenantId, 'risks.approve_assessment');

        $assessment = $this->riskService->approveAssessment($assessmentId, $request->user()->id);

        return response()->json([
            'message' => 'Risk assessment approved and frozen.',
            'assessment' => $assessment
        ]);
    }
}
