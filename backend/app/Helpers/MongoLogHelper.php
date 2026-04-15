<?php

namespace App\Helpers;

use App\Services\MongoLogService;

class MongoLogHelper
{
    public static function access(array $payload): void
    {
        app(MongoLogService::class)->write('access', $payload);
    }

    public static function action(array $payload): void
    {
        app(MongoLogService::class)->write('action', $payload);
    }

    public static function error(array $payload): void
    {
        app(MongoLogService::class)->write('error', $payload);
    }

    public static function list(string $type, int $limit = 50): array
    {
        return app(MongoLogService::class)->list($type, $limit);
    }
}

