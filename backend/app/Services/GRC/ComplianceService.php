<?php

namespace App\Services\GRC;

use App\Models\GRC\ControlTest;
use App\Models\GRC\ControlImplementation;
use Illuminate\Support\Facades\DB;

class ComplianceService
{
    /**
     * Approves a control test and syncs the effectiveness back to the scoped implementation.
     */
    public function approveControlTest(string $testId, string $approverId): ControlTest
    {
        return DB::transaction(function () use ($testId, $approverId) {
            $test = ControlTest::findOrFail($testId);
            
            if ($test->approved_at !== null) {
                throw new \DomainException("This test is already approved and locked.");
            }
            
            $test->approved_at = now();
            $test->approver_id = $approverId;
            $test->save();
            
            $implementation = ControlImplementation::findOrFail($test->implementation_id);
            $implementation->effectiveness = $test->conclusion;
            $implementation->last_tested_at = $test->approved_at;
            $implementation->save();
            
            // If ineffective, could trigger a "Finding" via event bus
            if ($test->conclusion === 'ineffective' || $test->conclusion === 'deficiency') {
                // event(new ControlFailed($test->id));
            }
            
            return $test;
        });
    }
}
