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

    public function list(string $type, int $page = 1, int $perPage = 20, ?string $search = null): array
    {
        if (! $this->isAvailable()) {
            return [
                'items' => [],
                'meta' => [
                    'page' => $page,
                    'per_page' => $perPage,
                    'total' => 0,
                    'total_pages' => 0,
                ],
            ];
        }

        try {
            $managerClass = '\MongoDB\Driver\Manager';
            $queryClass = '\MongoDB\Driver\Query';

            $manager = new $managerClass((string) env('MONGODB_URI'));
            $filter = ['type' => $type];

            if ($search !== null && trim($search) !== '') {
                $filter['$or'] = [
                    ['payload.action' => ['$regex' => $search, '$options' => 'i']],
                    ['payload.email' => ['$regex' => $search, '$options' => 'i']],
                    ['payload.path' => ['$regex' => $search, '$options' => 'i']],
                    ['payload.user_agent' => ['$regex' => $search, '$options' => 'i']],
                ];
            }

            $countQuery = new $queryClass($filter, ['projection' => ['_id' => 1]]);
            $countCursor = $manager->executeQuery($this->getNamespace(), $countQuery);
            $total = 0;

            foreach ($countCursor as $unusedDoc) {
                $total++;
            }

            $skip = max(0, ($page - 1) * $perPage);
            $query = new $queryClass(
                $filter,
                ['sort' => ['created_at' => -1], 'skip' => $skip, 'limit' => $perPage]
            );

            $cursor = $manager->executeQuery($this->getNamespace(), $query);
            $items = [];

            foreach ($cursor as $doc) {
                $items[] = json_decode(json_encode($doc, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);
            }

            return [
                'items' => $items,
                'meta' => [
                    'page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'total_pages' => (int) ceil($total / max($perPage, 1)),
                ],
            ];
        } catch (Throwable) {
            return [
                'items' => [],
                'meta' => [
                    'page' => $page,
                    'per_page' => $perPage,
                    'total' => 0,
                    'total_pages' => 0,
                ],
            ];
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

