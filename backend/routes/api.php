<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Project Management Routes
    Route::prefix('projects')->group(function () {
        Route::post('/', [ProjectController::class, 'store']);
        Route::get('/{id}', [ProjectController::class, 'show']);
        Route::put('/{id}', [ProjectController::class, 'update']);
        Route::delete('/{id}', [ProjectController::class, 'destroy']);
        
        Route::post('/{id}/archive', [ProjectController::class, 'archive']);
        Route::post('/{id}/restore', [ProjectController::class, 'restore']);
        
        Route::post('/{id}/members', [ProjectController::class, 'addMember']);
        Route::delete('/{id}/members/{userId}', [ProjectController::class, 'removeMember']);
        
        Route::put('/{id}/status', [ProjectController::class, 'changeStatus']);
    });

    // Task Management Routes
    Route::prefix('tasks')->group(function () {
        Route::post('/', [App\Http\Controllers\TaskController::class, 'store']);
        Route::post('/{id}/clone', [App\Http\Controllers\TaskController::class, 'clone']);
        Route::post('/{id}/assign', [App\Http\Controllers\TaskController::class, 'assignUsers']);
        Route::put('/{id}/status', [App\Http\Controllers\TaskController::class, 'changeStatus']);
        // Additional advanced routes for duplicate, split, merge, dependencies...
    });

    // Enterprise Collaboration & Communication Routes
    Route::prefix('channels')->group(function () {
        Route::post('/', [App\Http\Controllers\ChannelController::class, 'store']);
        Route::post('/{id}/archive', [App\Http\Controllers\ChannelController::class, 'archive']);
        // Additional routes for update, delete, join, leave
    });

    Route::prefix('messages')->group(function () {
        Route::post('/', [App\Http\Controllers\MessageController::class, 'store']);
        Route::put('/{id}', [App\Http\Controllers\MessageController::class, 'update']);
        // Additional routes for delete, react, unreact, pin, unpin, mark as read
    });

    // Enterprise Document Management System (EDMS) Routes
    Route::prefix('folders')->group(function () {
        Route::post('/', [App\Http\Controllers\FolderController::class, 'store']);
        Route::get('/', [App\Http\Controllers\FolderController::class, 'index']);
    });

    Route::prefix('documents')->group(function () {
        Route::post('/upload', [App\Http\Controllers\DocumentController::class, 'upload']);
        Route::post('/{id}/replace', [App\Http\Controllers\DocumentController::class, 'replace']);
        
        // Check-in / Check-out (Locks)
        Route::post('/{id}/lock', [App\Http\Controllers\DocumentController::class, 'lock']);
        Route::post('/{id}/unlock', [App\Http\Controllers\DocumentController::class, 'unlock']);
        
        // Additional endpoints for download, restore, share, permissions
    });

    // Webhooks
    Route::post('/webhooks/payment', [App\Http\Controllers\SubscriptionWebhookController::class, 'handle']);

    // Permissions Management
    Route::prefix('settings')->group(function () {
        Route::get('/permissions', [App\Http\Controllers\PermissionsController::class, 'index']);
        Route::put('/permissions/{id}', [App\Http\Controllers\PermissionsController::class, 'update']);
    });

    // Enterprise Workflow & Automation Engine
    Route::prefix('workflows')->group(function () {
        Route::post('/', [App\Http\Controllers\WorkflowController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\WorkflowController::class, 'show']);
        Route::post('/{id}/clone', [App\Http\Controllers\WorkflowController::class, 'clone']);
        Route::post('/{id}/pause', [App\Http\Controllers\WorkflowController::class, 'pause']);
        
        // Execution
        Route::post('/{versionId}/execute', [App\Http\Controllers\WorkflowExecutionController::class, 'execute']);
    });

    Route::prefix('approvals')->group(function () {
        Route::post('/{stepId}/decide', [App\Http\Controllers\ApprovalController::class, 'decide']);
    });

    // Enterprise Notification & Event Bus Platform
    Route::prefix('notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\NotificationController::class, 'index']);
        Route::put('/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
        Route::put('/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    });

    Route::prefix('preferences')->group(function () {
        Route::get('/notifications', [App\Http\Controllers\PreferenceController::class, 'show']);
        Route::put('/notifications', [App\Http\Controllers\PreferenceController::class, 'update']);
    });

    // Enterprise Calendar & Resource Management
    Route::prefix('calendars')->group(function () {
        Route::post('/events', [App\Http\Controllers\CalendarController::class, 'storeEvent']);
    });

    Route::prefix('resources')->group(function () {
        Route::post('/book', [App\Http\Controllers\ResourceBookingController::class, 'book']);
    });

    // Enterprise Meetings Management
    Route::prefix('meetings')->group(function () {
        Route::post('/', [App\Http\Controllers\MeetingController::class, 'store']);
        Route::put('/{id}/status', [App\Http\Controllers\MeetingController::class, 'transition']);
        
        Route::prefix('agendas')->group(function () {
            Route::put('/{agendaId}/sync', [App\Http\Controllers\MeetingAgendaController::class, 'sync']);
        });

        Route::prefix('votes')->group(function () {
            Route::post('/{voteId}/cast', [App\Http\Controllers\MeetingVoteController::class, 'cast']);
        });
    });

    // Enterprise Platform & Licensing Management
    Route::prefix('admin/platform')->group(function () {
        Route::get('/modules', [App\Http\Controllers\AdminModuleController::class, 'index']);
        Route::put('/modules/{machineKey}/enable', [App\Http\Controllers\AdminModuleController::class, 'enable']);
        
        Route::post('/licenses/verify-offline', [App\Http\Controllers\AdminLicenseController::class, 'verifyOffline']);
    });

    Route::prefix('tenant/usage')->group(function () {
        Route::get('/limits/{limitKey}', [App\Http\Controllers\TenantUsageController::class, 'checkLimit']);
    });

    // Enterprise Dashboards & Analytics
    Route::prefix('analytics')->group(function () {
        Route::get('/dashboards', [App\Http\Controllers\Analytics\DashboardController::class, 'index']);
        Route::get('/dashboards/{id}', [App\Http\Controllers\Analytics\DashboardController::class, 'show']);
    });

    // STEP 12A — Enterprise Scheduling, Gantt & CPM
    Route::prefix('scheduling')->group(function () {
        // Schedules
        Route::get('/schedules',                          [App\Http\Controllers\Scheduling\ScheduleController::class, 'index']);
        Route::post('/schedules',                         [App\Http\Controllers\Scheduling\ScheduleController::class, 'store']);
        Route::get('/schedules/{id}',                     [App\Http\Controllers\Scheduling\ScheduleController::class, 'show']);
        Route::get('/schedules/{id}/gantt',               [App\Http\Controllers\Scheduling\ScheduleController::class, 'gantt']);
        Route::post('/schedules/{id}/calculate',          [App\Http\Controllers\Scheduling\ScheduleController::class, 'calculate']);

        // Baselines
        Route::post('/schedules/{scheduleId}/baselines/{baselineId}/approve',
            [App\Http\Controllers\Scheduling\ScheduleController::class, 'approveBaseline']);
    });

    // STEP 13A — Enterprise Agile Work Management
    Route::prefix('agile')->group(function () {
        // Boards
        Route::get('/boards/{id}', [App\Http\Controllers\Agile\AgileBoardController::class, 'show']);
        Route::post('/boards/{boardId}/cards/{taskId}/move', [App\Http\Controllers\Agile\AgileBoardController::class, 'moveCard']);

        // Sprints
        Route::post('/sprints/{sprintId}/start', [App\Http\Controllers\Agile\AgileSprintController::class, 'start']);
        Route::post('/sprints/{sprintId}/complete', [App\Http\Controllers\Agile\AgileSprintController::class, 'complete']);
        Route::post('/sprints/{sprintId}/scope-change/{taskId}', [App\Http\Controllers\Agile\AgileSprintController::class, 'recordScopeChange']);
    });

    // STEP 14A — Enterprise Time Tracking & Billing
    Route::prefix('time')->group(function () {
        // Timers
        Route::post('/timers/start', [App\Http\Controllers\Time\TimeEntryController::class, 'startTimer']);
        Route::post('/timers/{timerId}/stop', [App\Http\Controllers\Time\TimeEntryController::class, 'stopTimer']);

        // Timesheets
        Route::post('/timesheets/{timesheetId}/submit', [App\Http\Controllers\Time\TimesheetController::class, 'submit']);
        Route::post('/timesheets/{timesheetId}/approve', [App\Http\Controllers\Time\TimesheetController::class, 'approve']);
    });

    // STEP 15A — Enterprise Risk, Issues, Change Control, Compliance & Governance
    Route::prefix('grc')->group(function () {
        // Risks
        Route::post('/risks/assessments', [App\Http\Controllers\GRC\RiskController::class, 'submitAssessment']);
        Route::post('/risks/assessments/{assessmentId}/approve', [App\Http\Controllers\GRC\RiskController::class, 'approveAssessment']);
        
        // Compliance & Controls
        Route::post('/controls/tests/{testId}/approve', [App\Http\Controllers\GRC\ComplianceController::class, 'approveControlTest']);
    });

    // STEP 16A — Enterprise Budget, Cost, Procurement & Financial Control
    Route::prefix('finance')->group(function () {
        Route::post('/budgets/reserve', [App\Http\Controllers\Finance\BudgetController::class, 'reserveFunds']);
    });

    // STEP RE1 — Real Estate Property & Inventory Management
    Route::prefix('real-estate')->group(function () {
        Route::prefix('properties')->group(function () {
            Route::get('/', [App\Http\Controllers\RealEstate\PropertyController::class, 'index']);
            Route::get('/{id}', [App\Http\Controllers\RealEstate\PropertyController::class, 'show']);
            Route::post('/', [App\Http\Controllers\RealEstate\PropertyController::class, 'store']);
        });
        
        // STEP RE2 — Real Estate Units & Inventory
        Route::prefix('units')->group(function () {
            Route::get('/', [App\Http\Controllers\RealEstate\UnitController::class, 'index']);
            Route::get('/{id}', [App\Http\Controllers\RealEstate\UnitController::class, 'show']);
            Route::post('/{id}/reserve', [App\Http\Controllers\RealEstate\UnitController::class, 'reserve']);
        });
        
        // STEP RE3 — Sales CRM & Contracts
        Route::prefix('sales')->group(function () {
            Route::get('/leads', [App\Http\Controllers\RealEstate\LeadController::class, 'index']);
            Route::get('/contracts/{id}', [App\Http\Controllers\RealEstate\ContractController::class, 'show']);
        });
        
        // STEP RE4 — Off-Plan Sales (Wafi Integration)
        Route::prefix('wafi')->group(function () {
            Route::get('/escrow-accounts', [App\Http\Controllers\RealEstate\WafiController::class, 'escrowAccounts']);
            Route::post('/progress-report', [App\Http\Controllers\RealEstate\WafiController::class, 'submitProgress']);
            Route::get('/generate-report', [App\Http\Controllers\RealEstate\WafiController::class, 'generateReport']);
        });

        // STEP RE5 — Facility Management (Mullak Integration)
        Route::prefix('mullak')->group(function () {
            Route::get('/maintenance-requests', [App\Http\Controllers\RealEstate\MaintenanceController::class, 'index']);
        });

        // STEP RE7 — Brokers & Agencies Portal
        Route::prefix('brokers')->group(function () {
            Route::get('/inventory', [App\Http\Controllers\RealEstate\BrokerController::class, 'inventory']);
            Route::post('/leads', [App\Http\Controllers\RealEstate\BrokerController::class, 'registerLead']);
        });

        // STEP RE8 — Executive C-Level Dashboard
        Route::prefix('analytics')->group(function () {
            Route::get('/executive-dashboard', [App\Http\Controllers\RealEstate\AnalyticsController::class, 'executiveDashboard']);
        });

        // Knowledge Management (Adapted for Corporate Real Estate)
        Route::prefix('knowledge')->group(function () {
            Route::get('/items/{id}', [App\Http\Controllers\Knowledge\KnowledgeItemController::class, 'show']);
        });

        // Compliance (KYC/AML for Real Estate)
        Route::prefix('compliance')->group(function () {
            Route::get('/cases/{id}', [App\Http\Controllers\Compliance\ComplianceCaseController::class, 'show']);
        });
    });

    // STEP LGL1 — Enterprise Legal Management
    Route::prefix('legal')->group(function () {
        Route::prefix('knowledge')->group(function () {
            Route::get('/', [App\Http\Controllers\Knowledge\KnowledgeController::class, 'index']);
            Route::post('/', [App\Http\Controllers\Knowledge\KnowledgeController::class, 'store']);
            Route::post('/{id}/approve', [App\Http\Controllers\Knowledge\KnowledgeController::class, 'approve']);
        });

        Route::post('/documents/extract', [App\Http\Controllers\Legal\LegalDocumentExtractionController::class, 'extract']);
        Route::post('/cases/{id}/bundle', [App\Http\Controllers\Legal\CaseBundleController::class, 'sendBundle']);
        
        Route::prefix('invoices')->group(function () {
            Route::get('/', [App\Http\Controllers\Legal\LegalInvoiceController::class, 'index']);
            Route::post('/', [App\Http\Controllers\Legal\LegalInvoiceController::class, 'store']);
            Route::get('/{id}', [App\Http\Controllers\Legal\LegalInvoiceController::class, 'show']);
        });

        Route::prefix('cases/{caseId}')->group(function () {
            // Case File Manager
            Route::get('/files', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'index']);
            
            Route::prefix('folders')->group(function () {
                Route::post('/', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'createFolder']);
                Route::put('/{folderId}/rename', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'renameFolder']);
                Route::put('/{folderId}/move', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'moveFolder']);
                Route::delete('/{folderId}', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'deleteFolder']);
            });

            Route::prefix('files')->group(function () {
                Route::post('/', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'uploadFiles']);
                Route::put('/{fileId}/rename', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'renameFile']);
                Route::put('/{fileId}/move', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'moveFile']);
                Route::delete('/{fileId}', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'deleteFile']);
                Route::get('/{fileId}/download', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'downloadFile']);
                Route::get('/{fileId}/preview', [App\Http\Controllers\Legal\CaseFileManagerController::class, 'previewFile']);
            });
        });
    });

    // STEP RE6 — External Customer Portal (Buyer Portal)
    Route::prefix('portal')->middleware('auth:portal-web')->group(function () {
        Route::get('/my-units', [App\Http\Controllers\Portal\PortalUnitController::class, 'index']);
        Route::get('/my-installments', [App\Http\Controllers\Portal\PortalInstallmentController::class, 'index']);
    });

});
