<?php
// app/Http/Middleware/AuthenticateApi.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticateApi
{
    public function handle(Request $request, Closure $next)
    {
        // Check if token is provided
        if (!$request->bearerToken()) {
            return response()->json([
                'success' => false,
                'message' => 'No token provided. Please login first.'
            ], 401);
        }

        // Try to authenticate via Sanctum
        if (!Auth::guard('sanctum')->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token. Please login again.'
            ], 401);
        }

        return $next($request);
    }
}