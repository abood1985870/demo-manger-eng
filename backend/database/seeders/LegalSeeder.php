<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LegalSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = Tenant::first()->id ?? Str::uuid()->toString();

        if (!Tenant::find($tenantId)) {
            Tenant::create(['id' => $tenantId, 'name' => 'Legal Firm Tenant', 'domain' => 'legal.local']);
        }

        // 1. Seed Practice Areas
        $practiceAreas = [
            ['Corporate and M&A', 'الشركات والاندماج والاستحواذ'],
            ['Dispute Resolution', 'تسوية المنازعات'],
            ['Real Estate', 'العقارات'],
            ['Employment', 'العمل والعمال']
        ];

        foreach ($practiceAreas as $pa) {
            DB::table('practice_areas')->updateOrInsert(
                ['tenant_id' => $tenantId, 'name_en' => $pa[0]],
                ['id' => Str::uuid(), 'name_ar' => $pa[1], 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
