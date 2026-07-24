<?php

namespace App\Jobs\Analytics;

use App\Guards\EntitlementGuard;
use App\Models\Analytics\ScheduledReport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessScheduledReports implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Prevent overlapping if jobs get backed up.
     */
    public $uniqueFor = 3600;

    public function uniqueId()
    {
        return 'process_scheduled_reports';
    }

    public function handle(EntitlementGuard $entitlementGuard): void
    {
        $dueReports = ScheduledReport::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('next_run_at')
                  ->orWhere('next_run_at', '<=', now());
            })
            ->get();

        foreach ($dueReports as $report) {
            try {
                // Re-validate entitlement at execution time to prevent bypass
                $entitlementGuard->enforce($report->tenant_id, 'analytics.advanced');

                // Generate and Dispatch Report (MOCK INTEGRATION for Rendering)
                if ($report->format === 'csv') {
                    // CsvRenderer::render($report->dashboard_id);
                } elseif ($report->format === 'pdf') {
                    // PdfRenderer::render($report->dashboard_id);
                }

                // Update timestamps for idempotency and scheduling
                $report->update([
                    'last_run_at' => now(),
                    'next_run_at' => $this->calculateNextRun($report->frequency),
                ]);

            } catch (\Exception $e) {
                \Log::error("Scheduled Report Failed: " . $report->id . " Reason: " . $e->getMessage());
                // In production, we'd notify the owner of the failure.
            }
        }
    }

    protected function calculateNextRun(string $frequency)
    {
        if ($frequency === 'daily') return now()->addDay();
        if ($frequency === 'weekly') return now()->addWeek();
        if ($frequency === 'monthly') return now()->addMonth();
        return now()->addDay();
    }
}
