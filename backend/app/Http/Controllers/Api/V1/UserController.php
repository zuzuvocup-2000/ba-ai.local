<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService)
    {
    }

    public function index()
    {
        return ApiResponse::success($this->userService->list(), 'Lấy danh sách tài khoản thành công.');
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->userService->create($request->validated());

        MongoLogHelper::action([
            'action' => 'users.create',
            'actor_id' => request()->user()?->id,
            'target_user_id' => $user->id,
        ]);

        return ApiResponse::success($user, 'Tạo tài khoản thành công.', 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $updatedUser = $this->userService->update($user, $request->validated());

        MongoLogHelper::action([
            'action' => 'users.update',
            'actor_id' => request()->user()?->id,
            'target_user_id' => $updatedUser->id,
        ]);

        return ApiResponse::success($updatedUser, 'Cập nhật tài khoản thành công.');
    }

    public function destroy(User $user)
    {
        $deleted = $this->userService->delete($user, request()->user());

        if (! $deleted) {
            return ApiResponse::error('Bạn không thể tự xóa chính tài khoản của mình.', 422);
        }

        MongoLogHelper::action([
            'action' => 'users.delete',
            'actor_id' => request()->user()?->id,
            'target_user_id' => $user->id,
        ]);

        return ApiResponse::success(null, 'Xóa tài khoản thành công.');
    }
}
