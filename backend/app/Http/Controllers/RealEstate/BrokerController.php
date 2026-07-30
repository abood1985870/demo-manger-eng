<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BrokerController extends Controller
{
    public function registerLead(Request $request)
    {
        return response()->json(['message' => 'Lead registered successfully for broker']);
    }

    public function inventory()
    {
        return response()->json(['message' => 'Available inventory for brokers']);
    }
}
