<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function login(LoginRequest $request)
    {
        $system = $request->string('system')->toString();
        $result = $this->authService->login(
            $request->string('email')->toString(),
            $request->string('password')->toString(),
            $system
        );

        if (! $result) {
            MongoLogHelper::login([
                'email' => $request->string('email')->toString(),
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'target_system' => $system,
                'status' => 'failed',
                'reason' => 'invalid_credentials',
            ]);

            return ApiResponse::error('Email or password is invalid.', 422);
        }

        if (($result['forbidden'] ?? false) === true) {
            MongoLogHelper::login([
                'email' => $request->string('email')->toString(),
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'target_system' => $system,
                'status' => 'failed',
                'reason' => 'system_access_denied',
            ]);

            return ApiResponse::error($result['message'], 403);
        }

        MongoLogHelper::action([
            'action' => 'auth.login',
            'email' => $request->string('email')->toString(),
            'user_id' => $result['user']['id'] ?? null,
            'target_system' => $system,
        ]);
        MongoLogHelper::login([
            'email' => $request->string('email')->toString(),
            'user_id' => $result['user']['id'] ?? null,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'target_system' => $system,
            'status' => 'success',
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

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = request()->user();

        if (! Hash::check($request->string('current_password')->toString(), $user->password)) {
            return ApiResponse::error('Current password is invalid.', 422);
        }

        $user->update([
            'password' => Hash::make($request->string('new_password')->toString()),
        ]);

        MongoLogHelper::action([
            'action' => 'auth.change_password',
            'user_id' => $user->id,
        ]);

        return ApiResponse::success(null, 'Password updated successfully.');
    }
}
