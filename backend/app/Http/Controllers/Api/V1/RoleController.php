<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\RoleService;

class RoleController extends Controller
{
    public function __construct(private readonly RoleService $roleService)
    {
    }

    public function index()
    {
        return ApiResponse::success($this->roleService->list(), 'Lấy danh sách vai trò thành công.');
    }
}
