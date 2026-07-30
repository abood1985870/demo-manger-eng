<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Leads list']);
    }
}
