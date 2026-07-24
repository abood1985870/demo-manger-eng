<?php

namespace App\Http\Controllers;

use App\Models\Workflow;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    public function store(Request $request)
    {
        // 1. Create Workflow
        // 2. Create WorkflowVersion with DAG JSON
        // 3. Extract and create WorkflowSteps, Conditions, Actions from JSON for fast indexing
    }

    public function show(string $id)
    {
        // Return Workflow with its active Version
    }
    
    public function clone(string $id)
    {
        // Deep clone Workflow, Version, and DAG
    }

    public function pause(string $id)
    {
        // Set is_active = false
    }
}
