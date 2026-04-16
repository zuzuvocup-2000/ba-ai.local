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
            ],
            [
                'type.required' => 'Loại nhật ký là bắt buộc.',
                'type.in' => 'Loại nhật ký không hợp lệ.',
                'page.integer' => 'Trang phải là số nguyên.',
                'page.min' => 'Trang phải lớn hơn hoặc bằng 1.',
                'per_page.integer' => 'Số bản ghi mỗi trang phải là số nguyên.',
                'per_page.min' => 'Số bản ghi mỗi trang phải lớn hơn hoặc bằng 1.',
                'per_page.max' => 'Số bản ghi mỗi trang không được vượt quá 200.',
                'search.string' => 'Từ khóa tìm kiếm phải là chuỗi.',
                'search.max' => 'Từ khóa tìm kiếm tối đa 200 ký tự.',
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
        ], 'Lấy danh sách nhật ký thành công.');
    }
}

