<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function show($id)
    {
        return response()->json(['message' => 'Contract details', 'id' => $id]);
    }
}
