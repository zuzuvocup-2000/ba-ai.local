<?php

$allowedOrigins = array_filter(array_map('trim', explode(',', (string) env(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://ba-ai.local,http://ba-ai.local:5173,http://ba-ai.local:5174'
))));

$allowedOriginPatterns = array_filter(array_map('trim', explode(',', (string) env(
    'CORS_ALLOWED_ORIGIN_PATTERNS',
    '^https?://localhost(:\\d+)?$,^https?://127\\.0\\.0\\.1(:\\d+)?$,^https?://ba-ai\\.local(:\\d+)?$'
))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => $allowedOriginPatterns,
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];

