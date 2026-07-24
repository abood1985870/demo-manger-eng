<?php

namespace App\Models\Finance;

use App\Models\Project;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'po_number', 'supplier_id', 'project_id', 'currency',
        'original_amount', 'revised_amount', 'status', 'approved_at', 'version'
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(SupplierProfile::class, 'supplier_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function lines()
    {
        return $this->hasMany(PurchaseOrderLine::class, 'purchase_order_id');
    }
}
