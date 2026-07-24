<?php

namespace App\Services\Finance;

use App\Models\Finance\BudgetLine;
use App\Models\Finance\BudgetReservation;
use Illuminate\Support\Facades\DB;

class BudgetControlService
{
    /**
     * Checks availability and safely reserves funds using pessimistic locking.
     * Prevents race conditions during simultaneous purchase requests.
     */
    public function reserveFunds(string $budgetLineId, float $amount, string $sourceType, string $sourceId): BudgetReservation
    {
        return DB::transaction(function () use ($budgetLineId, $amount, $sourceType, $sourceId) {
            // lockForUpdate prevents concurrent transactions from modifying this budget line
            $budgetLine = BudgetLine::where('id', $budgetLineId)->lockForUpdate()->firstOrFail();
            
            $available = $budgetLine->current_budget - ($budgetLine->reserved_amount + $budgetLine->committed_amount + $budgetLine->actual_amount);
            
            $budgetControlMode = $budgetLine->budgetVersion->budget->control_mode ?? 'informational';
            
            if ($budgetControlMode === 'hard' && $amount > $available) {
                throw new \DomainException("Hard budget control exceeded. Available: {$available}, Requested: {$amount}");
            }
            
            // Create Reservation
            $reservation = BudgetReservation::create([
                'budget_line_id' => $budgetLineId,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'amount' => $amount,
                'status' => 'reserved',
            ]);
            
            // Deduct availability on the line
            $budgetLine->reserved_amount += $amount;
            $budgetLine->save();
            
            return $reservation;
        });
    }

    /**
     * Converts a soft reservation into a hard commitment (e.g. when a PO is issued)
     */
    public function commitFunds(string $reservationId): void
    {
        DB::transaction(function () use ($reservationId) {
            $reservation = BudgetReservation::where('id', $reservationId)->lockForUpdate()->firstOrFail();
            
            if ($reservation->status !== 'reserved') {
                throw new \DomainException("Only reserved funds can be committed.");
            }
            
            $budgetLine = BudgetLine::where('id', $reservation->budget_line_id)->lockForUpdate()->firstOrFail();
            
            $budgetLine->reserved_amount -= $reservation->amount;
            $budgetLine->committed_amount += $reservation->amount;
            $budgetLine->save();
            
            $reservation->status = 'consumed';
            $reservation->save();
        });
    }
}
