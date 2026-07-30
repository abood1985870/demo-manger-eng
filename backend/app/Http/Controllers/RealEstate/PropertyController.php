<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Properties list']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'Property details', 'id' => $id]);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Property created']);
    }
}
