<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login(
            $request->string('email')->toString(),
            $request->string('password')->toString()
        );

        if (! $result) {
            return ApiResponse::error('Email or password is invalid.', 422);
        }

        MongoLogHelper::action([
            'action' => 'auth.login',
            'email' => $request->string('email')->toString(),
            'user_id' => $result['user']['id'] ?? null,
        ]);

        return ApiResponse::success($result, 'Login success.');
    }

    public function me()
    {
        return ApiResponse::success($this->authService->me(request()->user()), 'Profile fetched.');
    }

    public function logout()
    {
        MongoLogHelper::action([
            'action' => 'auth.logout',
            'user_id' => request()->user()?->id,
        ]);

        $this->authService->logout(request()->bearerToken());

        return ApiResponse::success(null, 'Logged out successfully.');
    }
}
