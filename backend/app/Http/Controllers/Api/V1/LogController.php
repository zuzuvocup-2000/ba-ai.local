<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Services\MongoLogService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LogController extends Controller
{
    public function index(string $type, Request $request, MongoLogService $mongoLogService)
    {
        $validated = validator(
            ['type' => $type, 'limit' => $request->query('limit', 50)],
            [
                'type' => ['required', Rule::in(['access', 'action', 'error'])],
                'limit' => ['nullable', 'integer', 'min:1', 'max:500'],
            ]
        )->validate();

        $items = MongoLogHelper::list($validated['type'], (int) $validated['limit']);

        return ApiResponse::success([
            'available' => $mongoLogService->isAvailable(),
            'type' => $validated['type'],
            'items' => $items,
        ], 'Logs fetched.');
    }
}

