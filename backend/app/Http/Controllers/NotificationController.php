<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request)
    {
        try {
            $notifications = Notification::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $notifications,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get unread count for the authenticated user
     */
    public function unreadCount(Request $request)
    {
        try {
            $count = Notification::where('user_id', $request->user()->id)
                ->where('read', false)
                ->count();

            return response()->json([
                'success' => true,
                'data' => ['count' => $count],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get unread count: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            $notification = Notification::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found',
                ], 404);
            }

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark all notifications as read for the authenticated user
     */
    public function markAllAsRead(Request $request)
    {
        try {
            Notification::where('user_id', $request->user()->id)
                ->where('read', false)
                ->update([
                    'read' => true,
                    'read_at' => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all as read: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a specific notification
     */
    public function destroy(Request $request, $id)
    {
        try {
            $notification = Notification::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found',
                ], 404);
            }

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete all read notifications for the authenticated user
     */
    public function deleteAllRead(Request $request)
    {
        try {
            $deleted = Notification::where('user_id', $request->user()->id)
                ->where('read', true)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => "Deleted {$deleted} read notifications",
                'data' => ['deleted_count' => $deleted],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete read notifications: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a notification for a specific user (Admin only)
     */
    public function store(Request $request)
    {
        try {
            if ($request->user()->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'title' => 'required|string|max:255',
                'message' => 'nullable|string|max:1000',
                'type' => 'nullable|in:info,success,warning,error',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $notification = Notification::create([
                'user_id' => $request->user_id,
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type ?? 'info',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notification created successfully',
                'data' => $notification,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create notification: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Broadcast notification to all users in a company (Admin only)
     */
    public function broadcastToCompany(Request $request)
    {
        try {
            if ($request->user()->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'company_id' => 'required|exists:companies,id',
                'title' => 'required|string|max:255',
                'message' => 'nullable|string|max:1000',
                'type' => 'nullable|in:info,success,warning,error',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Get all users in the company
            $users = User::where('company_id', $request->company_id)->get();
            $count = 0;

            foreach ($users as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => $request->title,
                    'message' => $request->message,
                    'type' => $request->type ?? 'info',
                ]);
                $count++;
            }

            return response()->json([
                'success' => true,
                'message' => "Notification sent to {$count} users in the company",
                'data' => [
                    'recipients' => $count,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to broadcast notification: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Broadcast notification to all staff in a company (Admin only)
     */
    public function broadcastToStaff(Request $request)
    {
        try {
            if ($request->user()->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'company_id' => 'required|exists:companies,id',
                'title' => 'required|string|max:255',
                'message' => 'nullable|string|max:1000',
                'type' => 'nullable|in:info,success,warning,error',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Get all staff users in the company
            $users = User::where('company_id', $request->company_id)
                ->where('role', 'staff')
                ->get();
            $count = 0;

            foreach ($users as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => $request->title,
                    'message' => $request->message,
                    'type' => $request->type ?? 'info',
                ]);
                $count++;
            }

            return response()->json([
                'success' => true,
                'message' => "Notification sent to {$count} staff members",
                'data' => [
                    'recipients' => $count,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to broadcast notification: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Broadcast notification to all admins (Admin only)
     */
    public function broadcastToAdmins(Request $request)
    {
        try {
            if ($request->user()->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'message' => 'nullable|string|max:1000',
                'type' => 'nullable|in:info,success,warning,error',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Get all admins
            $users = User::where('role', 'admin')->get();
            $count = 0;

            foreach ($users as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => $request->title,
                    'message' => $request->message,
                    'type' => $request->type ?? 'info',
                ]);
                $count++;
            }

            return response()->json([
                'success' => true,
                'message' => "Notification sent to {$count} administrators",
                'data' => [
                    'recipients' => $count,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to broadcast notification: ' . $e->getMessage(),
            ], 500);
        }
    }
}