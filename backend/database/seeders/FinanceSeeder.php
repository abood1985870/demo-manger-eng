<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = Tenant::first()->id ?? Str::uuid()->toString();
        
        if (!Tenant::find($tenantId)) {
            Tenant::create(['id' => $tenantId, 'name' => 'Default Seeder Tenant', 'domain' => 'default.local']);
        }

        // 1. Seed Fiscal Calendar
        $calendarId = Str::uuid();
        $exists = DB::table('fiscal_calendars')->where('tenant_id', $tenantId)->exists();
        if (!$exists) {
            DB::table('fiscal_calendars')->insert([
                'id' => $calendarId,
                'tenant_id' => $tenantId,
                'name' => 'Corporate FY2026',
                'calendar_type' => 'calendar_year',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::table('fiscal_periods')->insert([
                'id' => Str::uuid(),
                'calendar_id' => $calendarId,
                'period_name' => 'Q1 2026',
                'start_date' => '2026-01-01',
                'end_date' => '2026-03-31',
                'status' => 'open',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 2. Seed Basic Cost Centers
        $costCenters = ['Executive', 'Engineering', 'Marketing', 'Sales', 'HR'];
        foreach ($costCenters as $cc) {
            DB::table('cost_centers')->updateOrInsert(
                ['tenant_id' => $tenantId, 'name_en' => $cc],
                ['id' => Str::uuid(), 'code' => strtoupper(substr($cc, 0, 3)) . rand(100, 999), 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
