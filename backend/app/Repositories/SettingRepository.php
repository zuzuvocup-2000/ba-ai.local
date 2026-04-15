<?php

namespace App\Repositories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;

class SettingRepository
{
    public function listAll(?string $group = null, bool $onlyPublic = false): Collection
    {
        return Setting::query()
            ->when($group, fn ($query) => $query->where('group', $group))
            ->when($onlyPublic, fn ($query) => $query->where('is_public', true))
            ->orderBy('group')
            ->orderBy('sort_order')
            ->orderBy('key')
            ->get();
    }

    public function listByKeys(array $keys, bool $onlyPublic = false): Collection
    {
        return Setting::query()
            ->whereIn('key', $keys)
            ->when($onlyPublic, fn ($query) => $query->where('is_public', true))
            ->get();
    }

    public function updateOrCreateMany(array $items): void
    {
        foreach ($items as $item) {
            Setting::query()->updateOrCreate(
                ['key' => $item['key']],
                [
                    'name' => $item['name'],
                    'value' => $item['value'] ?? null,
                    'type' => $item['type'] ?? 'string',
                    'group' => $item['group'] ?? 'general',
                    'description' => $item['description'] ?? null,
                    'is_public' => (bool) ($item['is_public'] ?? false),
                    'sort_order' => (int) ($item['sort_order'] ?? 0),
                ]
            );
        }
    }

    public function findByKey(string $key): ?Setting
    {
        return Setting::query()->where('key', $key)->first();
    }
}

