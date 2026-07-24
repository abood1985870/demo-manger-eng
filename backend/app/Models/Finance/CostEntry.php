<?php

namespace App\Models\Finance;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class CostEntry extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'source_type', 'source_id', 'budget_line_id', 
        'project_id', 'cost_center_id', 'amount', 'currency', 
        'applied_exchange_rate', 'incurred_date', 'version'
    ];

    protected $casts = [
        'incurred_date' => 'datetime',
    ];

    public function budgetLine()
    {
        return $this->belongsTo(BudgetLine::class, 'budget_line_id');
    }
}
