<?php

namespace App\Models\Legal;

use App\Models\Project;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class LegalMatter extends Model
{
    use HasUuid;

    protected $fillable = [
        'tenant_id', 'matter_number', 'project_id', 'legal_client_id',
        'practice_area_id', 'matter_type', 'jurisdiction', 'status',
        'confidentiality_level', 'responsible_lawyer_id', 'opened_at', 'closed_at'
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function client()
    {
        return $this->belongsTo(LegalClient::class, 'legal_client_id');
    }

    public function parties()
    {
        return $this->hasMany(MatterParty::class);
    }
}
