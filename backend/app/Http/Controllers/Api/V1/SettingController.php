<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Helpers\SettingHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Services\SettingService;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function __construct(private readonly SettingService $settingService)
    {
    }

    public function index(Request $request)
    {
        $group = $request->query('group');
        $onlyPublic = filter_var($request->query('public', false), FILTER_VALIDATE_BOOLEAN);

        return ApiResponse::success(
            $this->settingService->list($group, $onlyPublic),
            'Settings fetched.'
        );
    }

    public function resolve(Request $request)
    {
        $keys = array_filter(array_map('trim', explode(',', (string) $request->query('keys'))));
        $onlyPublic = filter_var($request->query('public', false), FILTER_VALIDATE_BOOLEAN);

        if (count($keys) === 0) {
            return ApiResponse::error('You must provide at least one key.', 422);
        }

        return ApiResponse::success(
            $this->settingService->resolveByKeys($keys, $onlyPublic),
            'Settings resolved.'
        );
    }

    public function updateMany(UpdateSettingsRequest $request)
    {
        $items = $request->validated('items');
        $this->settingService->updateMany($items);

        foreach ($items as $item) {
            SettingHelper::forget($item['key']);
        }

        MongoLogHelper::action([
            'action' => 'settings.updateMany',
            'actor_id' => request()->user()?->id,
            'keys' => array_map(fn ($item) => $item['key'], $items),
        ]);

        return ApiResponse::success(null, 'Settings updated successfully.');
    }
}

