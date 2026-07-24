<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GRCSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = Tenant::first()->id ?? Str::uuid()->toString();
        
        if (!Tenant::find($tenantId)) {
            Tenant::create(['id' => $tenantId, 'name' => 'Default Seeder Tenant', 'domain' => 'default.local']);
        }

        // 1. Seed 5x5 Matrix
        $matrixId = Str::uuid();
        $exists = DB::table('risk_scoring_models')->where('tenant_id', $tenantId)->exists();
        if (!$exists) {
            DB::table('risk_scoring_models')->insert([
                'id' => $matrixId,
                'tenant_id' => $tenantId,
                'name' => 'Standard 5x5 Matrix',
                'type' => 'matrix',
                'matrix_configuration' => json_encode([
                    'likelihood' => [1, 2, 3, 4, 5],
                    'impact' => [1, 2, 3, 4, 5],
                    'thresholds' => [
                        'low' => [1, 6],
                        'medium' => [7, 12],
                        'high' => [13, 19],
                        'critical' => [20, 25]
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 2. Seed Basic Categories
        $categories = ['Strategic', 'Operational', 'Financial', 'Cybersecurity', 'Compliance'];
        foreach ($categories as $cat) {
            DB::table('risk_categories')->updateOrInsert(
                ['tenant_id' => $tenantId, 'name_en' => $cat],
                ['id' => Str::uuid(), 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 3. Seed Basic Compliance Framework
        $frameworkId = Str::uuid();
        $fwExists = DB::table('compliance_frameworks')->where('tenant_id', $tenantId)->exists();
        if (!$fwExists) {
            DB::table('compliance_frameworks')->insert([
                'id' => $frameworkId,
                'tenant_id' => $tenantId,
                'name' => 'Internal Corporate Standard 2026',
                'version' => '1.0',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
