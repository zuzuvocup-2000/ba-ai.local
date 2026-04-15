<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
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
        return ApiResponse::success($this->userService->list(), 'Users fetched.');
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->userService->create($request->validated());

        return ApiResponse::success($user, 'User created successfully.', 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $updatedUser = $this->userService->update($user, $request->validated());

        return ApiResponse::success($updatedUser, 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $deleted = $this->userService->delete($user, request()->user());

        if (! $deleted) {
            return ApiResponse::error('You cannot delete your own account.', 422);
        }

        return ApiResponse::success(null, 'User deleted successfully.');
    }
}
