<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\Time\RateCard;
use App\Models\Time\TimeCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TimeTrackingSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = Tenant::first()->id ?? Str::uuid()->toString();
        if (!Tenant::find($tenantId)) {
            Tenant::create(['id' => $tenantId, 'name' => 'Default Seeder Tenant', 'domain' => 'default.local']);
        }

        // Time Categories
        TimeCategory::firstOrCreate(
            ['name_en' => 'Client Work'],
            ['tenant_id' => $tenantId, 'is_billable_default' => true, 'is_costable_default' => true]
        );
        TimeCategory::firstOrCreate(
            ['name_en' => 'Internal Meeting'],
            ['tenant_id' => $tenantId, 'is_billable_default' => false, 'is_costable_default' => true]
        );
        TimeCategory::firstOrCreate(
            ['name_en' => 'Business Development'],
            ['tenant_id' => $tenantId, 'is_billable_default' => false, 'is_costable_default' => true]
        );
        TimeCategory::firstOrCreate(
            ['name_en' => 'Unpaid Leave'],
            ['tenant_id' => $tenantId, 'is_billable_default' => false, 'is_costable_default' => false]
        );

        // Standard Rate Cards
        $standardBilling = RateCard::firstOrCreate(
            ['name' => '2024 Standard Billing Rates'],
            [
                'tenant_id' => $tenantId,
                'currency' => 'USD',
                'type' => 'billing',
                'status' => 'active',
                'effective_from' => '2024-01-01',
            ]
        );

        $standardCost = RateCard::firstOrCreate(
            ['name' => '2024 Internal Cost Rates'],
            [
                'tenant_id' => $tenantId,
                'currency' => 'USD',
                'type' => 'cost',
                'status' => 'active',
                'effective_from' => '2024-01-01',
            ]
        );

        // Seeding some default rate rules for the cards
        if (DB::table('rate_rules')->where('rate_card_id', $standardBilling->id)->count() === 0) {
            DB::table('rate_rules')->insert([
                'id' => Str::uuid(),
                'rate_card_id' => $standardBilling->id,
                'role_name' => 'Senior Developer',
                'hourly_rate' => 150.00,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            DB::table('rate_rules')->insert([
                'id' => Str::uuid(),
                'rate_card_id' => $standardCost->id,
                'role_name' => 'Senior Developer',
                'hourly_rate' => 60.00,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
