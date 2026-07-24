<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id ?? 1;
        $notifications = Notification::where('user_id', $userId)
                            ->orderBy('created_at', 'desc')
                            ->paginate(50);

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, string $id)
    {
        $userId = $request->user()->id ?? 1;
        $notification = Notification::where('user_id', $userId)->findOrFail($id);
        
        $notification->update(['read_at' => now()]);

        return response()->json($notification);
    }

    public function markAllAsRead(Request $request)
    {
        $userId = $request->user()->id ?? 1;
        Notification::where('user_id', $userId)
                    ->whereNull('read_at')
                    ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
