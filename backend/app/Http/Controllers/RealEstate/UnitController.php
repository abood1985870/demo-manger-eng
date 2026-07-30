<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Units list']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'Unit details', 'id' => $id]);
    }

    public function reserve(Request $request, $id)
    {
        return response()->json(['message' => 'Unit reserved', 'id' => $id]);
    }
}
