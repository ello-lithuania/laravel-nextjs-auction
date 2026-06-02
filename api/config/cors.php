<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Without this file Laravel falls back to allowing every origin ('*').
    | We restrict browser access to the known SPA origin(s). Configure the
    | allowed origins via the FRONTEND_URL env var (comma-separated for
    | multiple, e.g. "https://app.example.com,https://www.example.com").
    |
    */

    'paths' => ['api/*', 'broadcasting/auth', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('FRONTEND_URL', 'http://localhost:3000,http://127.0.0.1:3000'))
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With', 'X-XSRF-TOKEN'],

    'exposed_headers' => [],

    'max_age' => 0,

    // The SPA authenticates with a bearer token (not cookies), so credentialed
    // CORS is not required. Keeping this false lets us avoid the wildcard-origin
    // pitfalls and keeps the policy strict.
    'supports_credentials' => false,

];
