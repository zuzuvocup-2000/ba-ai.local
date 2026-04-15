<?php

namespace App\Helpers;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingHelper
{
    public static function get(string $key, mixed $default = null): mixed
    {
        $cacheKey = self::cacheKey($key);

        return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($key, $default) {
            $setting = Setting::query()->where('key', $key)->first();

            if (! $setting) {
                return $default;
            }

            return self::castValue($setting->value, $setting->type);
        });
    }

    public static function getMany(array $keys): array
    {
        $result = [];

        foreach ($keys as $key) {
            $result[$key] = self::get($key);
        }

        return $result;
    }

    public static function forget(string $key): void
    {
        Cache::forget(self::cacheKey($key));
    }

    private static function cacheKey(string $key): string
    {
        return "app_setting:{$key}";
    }

    private static function castValue(?string $value, string $type): mixed
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
}

