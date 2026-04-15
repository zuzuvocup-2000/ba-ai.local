<?php

namespace App\Http\Middleware;

use App\Helpers\MongoLogHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogApiAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->is('api/v1/*')) {
            return $response;
        }

        MongoLogHelper::access([
            'method' => $request->method(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'status' => $response->getStatusCode(),
            'user_id' => $request->user()?->id,
            'user_agent' => $request->userAgent(),
        ]);

        return $response;
    }
}

