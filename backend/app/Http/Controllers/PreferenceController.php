<?php

namespace App\Http\Controllers;

use App\Models\NotificationPreference;
use Illuminate\Http\Request;

class PreferenceController extends Controller
{
    public function show(Request $request)
    {
        $userId = $request->user()->id ?? 1;
        $prefs = NotificationPreference::firstOrCreate(
            ['user_id' => $userId],
            [
                'enable_notifications' => true,
                'preferred_channels' => ['in_app'],
            ]
        );

        return response()->json($prefs);
    }

    public function update(Request $request)
    {
        $userId = $request->user()->id ?? 1;
        $validated = $request->validate([
            'enable_notifications' => 'boolean',
            'digest_mode' => 'boolean',
            'language' => 'string|max:2',
            'preferred_channels' => 'array',
            'quiet_hours_start' => 'nullable|date_format:H:i',
            'quiet_hours_end' => 'nullable|date_format:H:i',
            'timezone' => 'string',
        ]);

        $prefs = NotificationPreference::where('user_id', $userId)->firstOrFail();
        $prefs->update($validated);

        return response()->json($prefs);
    }
}
