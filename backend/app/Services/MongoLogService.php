<?php

namespace App\Services;

use Throwable;

class MongoLogService
{
    public function isAvailable(): bool
    {
        return class_exists('\MongoDB\Driver\Manager')
            && class_exists('\MongoDB\Driver\BulkWrite')
            && class_exists('\MongoDB\Driver\Query');
    }

    public function write(string $type, array $payload): void
    {
        if (! $this->isAvailable()) {
            return;
        }

        try {
            $managerClass = '\MongoDB\Driver\Manager';
            $bulkWriteClass = '\MongoDB\Driver\BulkWrite';

            $manager = new $managerClass((string) env('MONGODB_URI'));
            $bulk = new $bulkWriteClass();

            $bulk->insert([
                'type' => $type,
                'payload' => $payload,
                'created_at' => (new \DateTimeImmutable())->format(DATE_ATOM),
            ]);

            $manager->executeBulkWrite($this->getNamespace(), $bulk);
        } catch (Throwable) {
            // Ignore to avoid breaking request lifecycle when log store is unavailable.
        }
    }

    public function list(string $type, int $limit = 50): array
    {
        if (! $this->isAvailable()) {
            return [];
        }

        try {
            $managerClass = '\MongoDB\Driver\Manager';
            $queryClass = '\MongoDB\Driver\Query';

            $manager = new $managerClass((string) env('MONGODB_URI'));
            $query = new $queryClass(
                ['type' => $type],
                ['sort' => ['created_at' => -1], 'limit' => $limit]
            );

            $cursor = $manager->executeQuery($this->getNamespace(), $query);
            $items = [];

            foreach ($cursor as $doc) {
                $items[] = json_decode(json_encode($doc, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);
            }

            return $items;
        } catch (Throwable) {
            return [];
        }
    }

    private function getNamespace(): string
    {
        $uri = (string) env('MONGODB_URI');
        $path = parse_url($uri, PHP_URL_PATH);
        $database = trim((string) $path, '/');

        if ($database === '') {
            $database = 'ba_ai_data';
        }

        return "{$database}.app_logs";
    }
}

