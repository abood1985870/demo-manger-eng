<?php

namespace App\Services\GRC;

use App\Models\GRC\Risk;
use App\Models\GRC\RiskAssessment;
use Illuminate\Support\Facades\DB;

class RiskAssessmentService
{
    /**
     * Submits a risk assessment for approval.
     */
    public function submitAssessment(array $data): RiskAssessment
    {
        return DB::transaction(function () use ($data) {
            
            // Generate the next assessment version for this risk
            $latestVersion = RiskAssessment::where('risk_id', $data['risk_id'])->max('assessment_version') ?? 0;
            
            $assessment = RiskAssessment::create([
                'risk_id' => $data['risk_id'],
                'scoring_model_id' => $data['scoring_model_id'],
                'assessment_version' => $latestVersion + 1,
                'status' => 'submitted',
                
                'inherent_likelihood' => $data['inherent_likelihood'],
                'inherent_impact' => $data['inherent_impact'],
                'inherent_score' => $this->calculateScore($data['inherent_likelihood'], $data['inherent_impact']),
                
                'residual_likelihood' => $data['residual_likelihood'],
                'residual_impact' => $data['residual_impact'],
                'residual_score' => $this->calculateScore($data['residual_likelihood'], $data['residual_impact']),
                
                'assumptions' => $data['assumptions'] ?? null,
                'assessor_id' => $data['assessor_id'],
            ]);

            return $assessment;
        });
    }

    /**
     * Approves an assessment. This freezes the assessment and updates the main Risk record.
     */
    public function approveAssessment(string $assessmentId, string $approverId): RiskAssessment
    {
        return DB::transaction(function () use ($assessmentId, $approverId) {
            $assessment = RiskAssessment::findOrFail($assessmentId);
            
            if ($assessment->status !== 'submitted') {
                throw new \DomainException("Only submitted assessments can be approved.");
            }
            
            // 1. Lock the assessment
            $assessment->status = 'approved';
            $assessment->approved_at = now();
            $assessment->approver_id = $approverId;
            $assessment->save();
            
            // 2. Sync to Risk Register for fast querying
            $risk = $assessment->risk;
            $risk->inherent_score = $assessment->inherent_score;
            $risk->residual_score = $assessment->residual_score;
            $risk->status = 'assessed';
            $risk->save();
            
            return $assessment;
        });
    }

    /**
     * Simple numeric scoring for demonstration. In reality, this would evaluate the 'scoring_model_id' JSON configuration.
     */
    private function calculateScore(float $likelihood, float $impact): float
    {
        return $likelihood * $impact;
    }
}
