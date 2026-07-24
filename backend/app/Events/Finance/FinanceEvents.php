<?php

namespace App\Events\Finance;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BudgetThresholdExceeded
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $budgetLineId, public readonly float $variance) {}
}

class PurchaseOrderApproved
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $purchaseOrderId) {}
}

class MatchExceptionDetected
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $vendorBillId, public readonly string $reason) {}
}

class FinancialPeriodLocked
{
    use Dispatchable, SerializesModels;
    public function __construct(public readonly string $fiscalPeriodId) {}
}
