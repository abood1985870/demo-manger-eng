<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Maintenance requests list (Mullak integration)']);
    }
}
