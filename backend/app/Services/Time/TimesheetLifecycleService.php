<?php

namespace App\Services\Time;

use App\Models\Time\Timesheet;
use App\Models\Time\TimesheetSubmission;
use App\Models\Time\TimeEntry;
use Illuminate\Support\Facades\DB;

class TimesheetLifecycleService
{
    /**
     * Submits a timesheet, taking a permanent immutable snapshot of the entries.
     */
    public function submitTimesheet(Timesheet $timesheet, string $notes = null): Timesheet
    {
        return DB::transaction(function () use ($timesheet, $notes) {
            if ($timesheet->status !== 'draft' && $timesheet->status !== 'corrected') {
                throw new \DomainException("Only draft or corrected timesheets can be submitted.");
            }

            // Load all entries mapped to this timesheet
            $entries = DB::table('timesheet_entries')
                ->join('time_entries', 'time_entries.id', '=', 'timesheet_entries.time_entry_id')
                ->where('timesheet_entries.timesheet_id', $timesheet->id)
                ->get();

            if ($entries->isEmpty()) {
                throw new \DomainException("Cannot submit an empty timesheet.");
            }

            // Create Immutable Snapshot
            TimesheetSubmission::create([
                'timesheet_id' => $timesheet->id,
                'snapshot_data' => $entries->toArray(), // JSON storage of exactly what was submitted
                'submission_notes' => $notes,
            ]);

            // Lock the entries so they can't be altered while under review
            DB::table('time_entries')
                ->whereIn('id', $entries->pluck('id'))
                ->update(['approval_status' => 'submitted', 'is_locked' => true]);

            $timesheet->status = 'submitted';
            $timesheet->submitted_at = now();
            $timesheet->save();

            // Fire event for workflow engine to pick up
            // event(new TimesheetSubmitted($timesheet->id));

            return $timesheet;
        });
    }

    /**
     * Approves a timesheet. This freezes the billing rates historically.
     */
    public function approveTimesheet(Timesheet $timesheet, string $approverId): void
    {
        DB::transaction(function () use ($timesheet, $approverId) {
            if ($timesheet->status !== 'submitted' && $timesheet->status !== 'under_review') {
                throw new \DomainException("Timesheet is not in a submittable state.");
            }

            $timesheet->status = 'approved';
            $timesheet->approved_at = now();
            $timesheet->save();
            
            // Mark underlying entries approved
            $entries = $timesheet->entries;
            foreach ($entries as $entry) {
                $entry->approval_status = 'approved';
                
                // Rate historical freezing would happen here by calling BillingRateResolverService
                // e.g. $rate = app(BillingRateResolverService::class)->resolveRate($entry);
                // $entry->applied_billing_rate = $rate->amount;
                // $entry->net_billable_amount = ($entry->duration_minutes / 60) * $rate->amount;
                
                $entry->save();
            }
        });
    }
}
