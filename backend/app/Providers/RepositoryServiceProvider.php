<?php

namespace App\Providers;

use App\Repositories\ApiTokenRepository;
use App\Repositories\ProjectRepository;
use App\Repositories\RoleRepository;
use App\Repositories\SettingRepository;
use App\Repositories\UserRepository;
use App\Services\AuthService;
use App\Services\MongoLogService;
use App\Services\ProjectService;
use App\Services\RoleService;
use App\Services\SettingService;
use App\Services\UserService;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(UserRepository::class);
        $this->app->singleton(RoleRepository::class);
        $this->app->singleton(ApiTokenRepository::class);
        $this->app->singleton(SettingRepository::class);
        $this->app->singleton(ProjectRepository::class);

        $this->app->singleton(AuthService::class);
        $this->app->singleton(UserService::class);
        $this->app->singleton(RoleService::class);
        $this->app->singleton(SettingService::class);
        $this->app->singleton(MongoLogService::class);
        $this->app->singleton(ProjectService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
