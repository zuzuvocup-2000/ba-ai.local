<?php

namespace App\Repositories;

use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Support\Carbon;

class ApiTokenRepository
{
    public function createForUser(User $user, string $plainToken, array $abilities): ApiToken
    {
        return ApiToken::query()->create([
            'user_id' => $user->id,
            'name' => 'admin-session',
            'token' => hash('sha256', $plainToken),
            'abilities' => $abilities,
            'expires_at' => Carbon::now()->addDays(7),
        ]);
    }

    public function deleteByPlainToken(string $plainToken): int
    {
        return ApiToken::query()
            ->where('token', hash('sha256', $plainToken))
            ->delete();
    }
}

