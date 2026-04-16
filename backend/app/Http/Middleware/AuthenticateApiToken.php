<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $plainToken = $request->bearerToken();

        if (! $plainToken) {
            return response()->json(['message' => 'Chưa xác thực.'], 401);
        }

        $hashedToken = hash('sha256', $plainToken);

        $apiToken = ApiToken::query()
            ->with('user.roles.permissions')
            ->where('token', $hashedToken)
            ->first();

        if (! $apiToken || ($apiToken->expires_at && $apiToken->expires_at->isPast())) {
            return response()->json(['message' => 'Token không hợp lệ hoặc đã hết hạn.'], 401);
        }

        $apiToken->forceFill(['last_used_at' => Carbon::now()])->save();

        $request->setUserResolver(fn () => $apiToken->user);

        return $next($request);
    }
}
