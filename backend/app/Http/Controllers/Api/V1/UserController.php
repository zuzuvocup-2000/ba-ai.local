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
        return ApiResponse::success($this->userService->list(), 'Users fetched.');
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->userService->create($request->validated());

        MongoLogHelper::action([
            'action' => 'users.create',
            'actor_id' => request()->user()?->id,
            'target_user_id' => $user->id,
        ]);

        return ApiResponse::success($user, 'User created successfully.', 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $updatedUser = $this->userService->update($user, $request->validated());

        MongoLogHelper::action([
            'action' => 'users.update',
            'actor_id' => request()->user()?->id,
            'target_user_id' => $updatedUser->id,
        ]);

        return ApiResponse::success($updatedUser, 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $deleted = $this->userService->delete($user, request()->user());

        if (! $deleted) {
            return ApiResponse::error('You cannot delete your own account.', 422);
        }

        MongoLogHelper::action([
            'action' => 'users.delete',
            'actor_id' => request()->user()?->id,
            'target_user_id' => $user->id,
        ]);

        return ApiResponse::success(null, 'User deleted successfully.');
    }
}
