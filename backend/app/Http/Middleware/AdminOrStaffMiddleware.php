<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminOrStaffMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !in_array($request->user()->role, ['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin or staff access required.'
            ], 403);
        }

        return $next($request);
    }
}