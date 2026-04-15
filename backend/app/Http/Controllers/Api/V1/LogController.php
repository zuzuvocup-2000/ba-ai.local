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
            [
                'type' => $type,
                'page' => $request->query('page', 1),
                'per_page' => $request->query('per_page', 20),
                'search' => $request->query('search'),
            ],
            [
                'type' => ['required', Rule::in(['access', 'action', 'error', 'login'])],
                'page' => ['nullable', 'integer', 'min:1'],
                'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
                'search' => ['nullable', 'string', 'max:200'],
            ]
        )->validate();

        $result = MongoLogHelper::list(
            $validated['type'],
            (int) $validated['page'],
            (int) $validated['per_page'],
            $validated['search'] ?? null
        );

        return ApiResponse::success([
            'available' => $mongoLogService->isAvailable(),
            'type' => $validated['type'],
            'items' => $result['items'],
            'meta' => $result['meta'],
        ], 'Logs fetched.');
    }
}

