<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LogController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::prefix('auth')->group(function () {
            Route::post('/login', [AuthController::class, 'login']);

            Route::middleware('auth.token')->group(function () {
                Route::get('/me', [AuthController::class, 'me']);
                Route::post('/logout', [AuthController::class, 'logout']);
                Route::put('/change-password', [AuthController::class, 'changePassword']);
            });
        });

        Route::middleware('auth.token')->group(function () {
            Route::get('/roles', [RoleController::class, 'index'])
                ->defaults('permission', 'roles.view')
                ->middleware('permission');
            Route::get('/roles/permissions', [RoleController::class, 'permissions'])
                ->defaults('permission', 'roles.view')
                ->middleware('permission');
            Route::put('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])
                ->defaults('permission', 'roles.edit')
                ->middleware('permission');

            Route::get('/settings', [SettingController::class, 'index'])
                ->defaults('permission', 'settings.view')
                ->middleware('permission');

            Route::get('/settings/resolve', [SettingController::class, 'resolve'])
                ->defaults('permission', 'settings.view')
                ->middleware('permission');

            Route::put('/settings', [SettingController::class, 'updateMany'])
                ->defaults('permission', 'settings.edit')
                ->middleware('permission');

            Route::get('/logs/{type}', [LogController::class, 'index'])
                ->defaults('permission', 'logs.view')
                ->middleware('permission');

            Route::get('/users', [UserController::class, 'index'])
                ->defaults('permission', 'users.view')
                ->middleware('permission');

            Route::post('/users', [UserController::class, 'store'])
                ->defaults('permission', 'users.create')
                ->middleware('permission');

            Route::put('/users/{user}', [UserController::class, 'update'])
                ->defaults('permission', 'users.edit')
                ->middleware('permission');

            Route::delete('/users/{user}', [UserController::class, 'destroy'])
                ->defaults('permission', 'users.delete')
                ->middleware('permission');

            Route::get('/projects', [ProjectController::class, 'index'])
                ->defaults('permission', 'projects.view')
                ->middleware('permission');

            Route::post('/projects', [ProjectController::class, 'store'])
                ->defaults('permission', 'projects.create')
                ->middleware('permission');

            Route::put('/projects/{project}', [ProjectController::class, 'update'])
                ->defaults('permission', 'projects.edit')
                ->middleware('permission');

            Route::put('/projects/{project}/members', [ProjectController::class, 'syncMembers'])
                ->defaults('permission', 'projects.edit')
                ->middleware('permission');

            Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])
                ->defaults('permission', 'projects.delete')
                ->middleware('permission');
        });
    });

    Route::prefix('user')->group(function () {
        Route::prefix('auth')->group(function () {
            Route::post('/login', [AuthController::class, 'login']);

            Route::middleware('auth.token')->group(function () {
                Route::get('/me', [AuthController::class, 'me']);
                Route::post('/logout', [AuthController::class, 'logout']);
                Route::put('/change-password', [AuthController::class, 'changePassword']);
            });
        });

        Route::middleware('auth.token')->group(function () {
            Route::get('/projects', [ProjectController::class, 'index'])
                ->defaults('permission', 'projects.view')
                ->middleware('permission');
        });

        Route::get('/public/settings/resolve', [SettingController::class, 'resolve']);
    });
});

