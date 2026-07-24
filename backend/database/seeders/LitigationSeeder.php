<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LitigationSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = Tenant::first()->id ?? Str::uuid()->toString();

        if (!Tenant::find($tenantId)) {
            Tenant::create(['id' => $tenantId, 'name' => 'Legal Firm Tenant', 'domain' => 'legal.local']);
        }

        // 1. Seed Saudi Courts Foundation
        $courts = [
            ['Riyadh Commercial Court', 'المحكمة التجارية بالرياض', 'commercial'],
            ['Jeddah Labor Court', 'المحكمة العمالية بجدة', 'labor'],
            ['Administrative Court (Diwan Al-Mazalim)', 'المحكمة الإدارية (ديوان المظالم)', 'administrative']
        ];

        foreach ($courts as $court) {
            DB::table('legal_courts')->updateOrInsert(
                ['tenant_id' => $tenantId, 'name_en' => $court[0]],
                ['id' => Str::uuid(), 'name_ar' => $court[1], 'court_type' => $court[2], 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 2. Seed Deadline Types
        $deadlines = [
            ['APPEAL_COM_30', 'Commercial Appeal (30 Days)', 'الاستئناف التجاري', 30, 'days'],
            ['APPEAL_URG_10', 'Urgent Appeal (10 Days)', 'الاستئناف المستعجل', 10, 'days'],
        ];

        foreach ($deadlines as $dl) {
            DB::table('legal_deadline_types')->updateOrInsert(
                ['tenant_id' => $tenantId, 'code' => $dl[0]],
                ['id' => Str::uuid(), 'name_en' => $dl[1], 'name_ar' => $dl[2], 'duration' => $dl[3], 'unit' => $dl[4], 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
