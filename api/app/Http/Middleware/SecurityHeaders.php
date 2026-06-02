<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Add defence-in-depth security headers to every API response. The API only
     * ever returns JSON, but these headers cost nothing and harden edge cases
     * (e.g. a browser rendering a response directly, or framing it).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $headers = [
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'Referrer-Policy' => 'no-referrer',
            'X-Permitted-Cross-Domain-Policies' => 'none',
            // A JSON API never needs to be a script/style/frame source.
            'Content-Security-Policy' => "default-src 'none'; frame-ancestors 'none'",
        ];

        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        // Drop the header that advertises PHP's version, if present.
        $response->headers->remove('X-Powered-By');

        return $response;
    }
}
