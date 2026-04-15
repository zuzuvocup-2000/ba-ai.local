<?php

namespace App\Services;

use App\Repositories\SettingRepository;

class SettingService
{
    public function __construct(private readonly SettingRepository $settingRepository)
    {
    }

    public function list(?string $group = null, bool $onlyPublic = false): array
    {
        return $this->settingRepository->listAll($group, $onlyPublic)
            ->map(fn ($setting) => $this->formatSetting($setting))
            ->values()
            ->all();
    }

    public function resolveByKeys(array $keys, bool $onlyPublic = false): array
    {
        $settings = $this->settingRepository->listByKeys($keys, $onlyPublic)->keyBy('key');
        $resolved = [];

        foreach ($keys as $key) {
            if (! isset($settings[$key])) {
                $resolved[$key] = null;
                continue;
            }

            $resolved[$key] = $this->castValue($settings[$key]->value, $settings[$key]->type);
        }

        return $resolved;
    }

    public function updateMany(array $items): void
    {
        $this->settingRepository->updateOrCreateMany($items);
    }

    public function castValue(?string $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'int' => (int) $value,
            'float' => (float) $value,
            'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    private function formatSetting(object $setting): array
    {
        return [
            'id' => $setting->id,
            'key' => $setting->key,
            'name' => $setting->name,
            'value' => $this->castValue($setting->value, $setting->type),
            'type' => $setting->type,
            'group' => $setting->group,
            'description' => $setting->description,
            'is_public' => $setting->is_public,
            'sort_order' => $setting->sort_order,
        ];
    }
}

