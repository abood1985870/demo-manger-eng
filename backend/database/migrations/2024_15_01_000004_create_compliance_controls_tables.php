<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Compliance Frameworks (e.g., ISO 27001, internal standard)
        Schema::create('compliance_frameworks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name');
            $table->string('version');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Compliance Obligations (Specific clauses within a framework)
        Schema::create('compliance_obligations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('framework_id')->constrained('compliance_frameworks')->onDelete('cascade');
            
            $table->string('requirement_number');
            $table->string('title');
            $table->text('description');
            
            $table->string('applicability')->default('applicable'); // applicable, not_applicable
            $table->string('status'); // compliant, non_compliant, partial
            
            $table->timestamps();
        });

        // Control Library (The definitions)
        Schema::create('controls', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('control_number')->unique();
            
            $table->string('name');
            $table->text('description');
            $table->string('type'); // preventive, detective, corrective
            $table->string('nature'); // automated, manual
            
            $table->timestamps();
        });

        // Control Implementations (Scoped instances of a control)
        Schema::create('control_implementations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('control_id')->constrained('controls')->onDelete('cascade');
            
            // Scope
            $table->uuid('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->foreignId('owner_id')->constrained('users');
            
            $table->string('status'); // implemented, not_implemented
            $table->string('effectiveness')->default('not_assessed'); // effective, ineffective
            $table->timestamp('last_tested_at')->nullable();
            
            $table->timestamps();
        });

        // Immutable Control Tests
        Schema::create('control_tests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('implementation_id')->constrained('control_implementations')->onDelete('cascade');
            
            $table->string('test_type'); // design, operating
            $table->text('procedure');
            $table->string('conclusion'); // effective, ineffective, deficiency
            
            $table->foreignId('tester_id')->constrained('users');
            $table->foreignId('approver_id')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            
            $table->timestamps(); // Locked upon approval
        });
        
        // Link controls to obligations or risks
        Schema::create('control_mappings', function (Blueprint $table) {
            $table->uuid('control_id')->constrained('controls')->onDelete('cascade');
            $table->uuid('obligation_id')->nullable()->constrained('compliance_obligations')->onDelete('cascade');
            $table->uuid('risk_id')->nullable()->constrained('risks')->onDelete('cascade');
            $table->primary(['control_id', 'obligation_id', 'risk_id'], 'ctrl_mapping_primary');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('control_mappings');
        Schema::dropIfExists('control_tests');
        Schema::dropIfExists('control_implementations');
        Schema::dropIfExists('controls');
        Schema::dropIfExists('compliance_obligations');
        Schema::dropIfExists('compliance_frameworks');
    }
};
