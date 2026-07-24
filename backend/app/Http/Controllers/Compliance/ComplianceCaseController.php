<?php

namespace App\Http\Controllers\Compliance;

use App\Http\Controllers\Controller;
use App\Models\Compliance\ComplianceCase;
use App\Services\Compliance\ComplianceAccessResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplianceCaseController extends Controller
{
    public function __construct(
        protected ComplianceAccessResolver $accessResolver
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $case = ComplianceCase::with(['identities', 'restrictions'])->findOrFail($id);

        // Strict Access Check
        if (!$this->accessResolver->canAccess($user, $case, 'view')) {
            abort(403, 'You do not have permission to view this compliance record.');
        }

        // Strip sensitive data if user is not a compliance officer
        $isComplianceOfficer = $user->hasRole('compliance_officer');

        return response()->json([
            'compliance_case' => [
                'id' => $case->id,
                'case_number' => $case->case_number,
                'status' => $case->status,
                'risk_level' => $isComplianceOfficer ? $case->risk_level : 'restricted_view',
                'restrictions' => $case->restrictions,
                // Identities are automatically masked by the Eloquent model accessor
                'identities' => $case->identities->map(function ($id) {
                    return [
                        'type' => $id->identification_type,
                        'number_masked' => $id->identification_number_masked,
                        'status' => $id->verification_status
                    ];
                })
            ]
        ]);
    }
}
