<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LegalFinanceSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = Tenant::first()->id ?? Str::uuid()->toString();

        if (!Tenant::find($tenantId)) {
            Tenant::create(['id' => $tenantId, 'name' => 'Legal Firm Tenant', 'domain' => 'legal.local']);
        }

        // 1. Seed Tax Treatments (Configurable rules)
        $taxes = [
            ['STANDARD_15', 'Standard VAT 15%', 'ضريبة القيمة المضافة 15%', 15.00, false, null],
            ['ZERO_EXPORT', 'Zero Rated (Export)', 'نسبة صفر (تصدير)', 0.00, true, 'VATEX-SA-32'],
            ['OUT_OF_SCOPE', 'Out of Scope', 'خارج النطاق', 0.00, true, 'OOS'],
        ];

        foreach ($taxes as $tax) {
            DB::table('legal_tax_treatments')->updateOrInsert(
                ['tenant_id' => $tenantId, 'code' => $tax[0]],
                ['id' => Str::uuid(), 'name_en' => $tax[1], 'name_ar' => $tax[2], 'tax_rate_percent' => $tax[3], 'is_exemption' => $tax[4], 'exemption_reason_code' => $tax[5], 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
