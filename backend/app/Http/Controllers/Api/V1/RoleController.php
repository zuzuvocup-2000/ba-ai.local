<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateRolePermissionsRequest;
use App\Models\Role;
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

    public function permissions()
    {
        return ApiResponse::success($this->roleService->permissionCatalog(), 'Lấy danh mục quyền thành công.');
    }

    public function updatePermissions(UpdateRolePermissionsRequest $request, Role $role)
    {
        $updatedRole = $this->roleService->updatePermissions($role, $request->validated('permission_slugs'));

        MongoLogHelper::action([
            'action' => 'roles.permissions.update',
            'actor_id' => request()->user()?->id,
            'role_id' => $role->id,
            'permissions' => $updatedRole['permissions'],
        ]);

        return ApiResponse::success($updatedRole, 'Cập nhật quyền cho vai trò thành công.');
    }
}
