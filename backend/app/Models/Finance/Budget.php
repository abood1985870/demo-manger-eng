<?php

namespace App\Models\Finance;

use App\Models\Project;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'name', 'model_type', 'project_id', 'cost_center_id', 'control_mode'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function costCenter()
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id');
    }

    public function versions()
    {
        return $this->hasMany(BudgetVersion::class, 'budget_id');
    }
}
