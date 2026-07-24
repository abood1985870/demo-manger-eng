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

    // STEP L1 — Saudi Law Firm Edition Foundation
    Route::prefix('legal')->group(function () {
        Route::get('/matters/{id}', [App\Http\Controllers\Legal\LegalMatterController::class, 'show']);
        
        // STEP L2 — Litigation Foundation
        Route::prefix('litigation')->group(function () {
            Route::get('/cases/{id}', [App\Http\Controllers\Legal\LegalCaseController::class, 'show']);
            Route::get('/cases/{id}/deadlines', [App\Http\Controllers\Legal\LegalDeadlineController::class, 'index']);
        });
        
        // STEP L3 — Finance & Billing Foundation
        Route::prefix('finance')->group(function () {
            Route::get('/invoices/{id}', [App\Http\Controllers\Legal\LegalInvoiceController::class, 'show']);
        });
        
        // STEP L4 — Contract Lifecycle Management
        Route::prefix('clm')->group(function () {
            Route::get('/contracts/{id}', [App\Http\Controllers\Legal\LegalContractController::class, 'show']);
        });

        // STEP L6 — Legal Knowledge Management
        Route::prefix('knowledge')->group(function () {
            Route::get('/items/{id}', [App\Http\Controllers\Knowledge\KnowledgeItemController::class, 'show']);
        });

        // STEP L7 — Legal Compliance (KYC/AML)
        Route::prefix('compliance')->group(function () {
            Route::get('/cases/{id}', [App\Http\Controllers\Compliance\ComplianceCaseController::class, 'show']);
        });
    });

    // STEP L5 — External Portal API Boundary (Deny by default)
    Route::prefix('portal')->middleware('auth:portal-web')->group(function () {
        Route::get('/matters/{id}', [App\Http\Controllers\Portal\PortalMatterController::class, 'show']);
    });

});
