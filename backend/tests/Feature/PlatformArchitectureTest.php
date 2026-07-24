<?php

namespace Tests\Feature;

use App\Guards\EntitlementGuard;
use App\Guards\LimitGuard;
use App\Models\FeatureFlag;
use App\Models\FeatureFlagRule;
use App\Models\Module;
use App\Models\SubscriptionPlanLimit;
use App\Models\UsageCounter;
use App\Services\EntitlementResolver;
use App\Services\FeatureFlagEvaluator;
use App\Services\ModuleManifestParserService;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;
use DomainException;

class PlatformArchitectureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Since we lack actual Tenant models in this stripped setup, we mock IDs.
        $this->tenantId = Str::uuid()->toString();
        $this->planId = Str::uuid()->toString();
    }

    public function test_circular_dependency_is_detected()
    {
        $parser = new ModuleManifestParserService();
        
        $graph = [
            'module.a' => ['module.b'],
            'module.b' => ['module.c'],
            'module.c' => ['module.a'], // Circular
        ];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Circular dependency detected involving module: module.a");

        $parser->detectCircularDependencies($graph);
    }

    public function test_feature_flag_tenant_override_precedence()
    {
        $flag = FeatureFlag::create([
            'key' => 'ai_enabled',
            'name' => 'AI',
            'type' => 'boolean',
            'default_value' => 'false',
        ]);

        FeatureFlagRule::create([
            'feature_flag_id' => $flag->id,
            'scope' => 'Tenant',
            'scope_id' => $this->tenantId,
            'value' => 'true',
        ]);

        $evaluator = new FeatureFlagEvaluator();
        
        // Default evaluates false
        $this->assertFalse($evaluator->evaluate('ai_enabled', 'another-tenant-id'));
        
        // Tenant override evaluates true
        $this->assertTrue($evaluator->evaluate('ai_enabled', $this->tenantId));
    }

    public function test_limit_guard_blocks_overage()
    {
        SubscriptionPlanLimit::create([
            'plan_id' => $this->planId,
            'limit_key' => 'max_users',
            'hard_limit_value' => 5,
        ]);

        UsageCounter::create([
            'tenant_id' => $this->tenantId,
            'limit_key' => 'max_users',
            'current_value' => 5, // At max limit
        ]);

        $guard = app(LimitGuard::class);

        $this->expectException(DomainException::class);
        $guard->enforce($this->tenantId, $this->planId, 'max_users');
    }

    public function test_entitlement_guard_blocks_unauthorized_module()
    {
        $module = Module::create([
            'machine_key' => 'premium.module',
            'name_en' => 'Premium',
            'is_installed' => true,
            'is_enabled' => false, // Disabled globally
        ]);

        $guard = app(EntitlementGuard::class);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage("Domain Guard: Entitlement Denied");
        
        $guard->enforce($this->tenantId, 'premium.module');
    }
}
