<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
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

        return ApiResponse::success($result, 'Login success.');
    }

    public function me()
    {
        return ApiResponse::success($this->authService->me(request()->user()), 'Profile fetched.');
    }

    public function logout()
    {
        $this->authService->logout(request()->bearerToken());

        return ApiResponse::success(null, 'Logged out successfully.');
    }
}
