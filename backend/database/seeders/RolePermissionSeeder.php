<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissionMap = [
            'users.view' => 'View users',
            'users.create' => 'Create users',
            'users.edit' => 'Edit users',
            'users.delete' => 'Delete users',
            'settings.view' => 'View settings',
            'settings.edit' => 'Edit settings',
            'logs.view' => 'View logs',
            'projects.view' => 'View projects',
            'projects.create' => 'Create projects',
            'projects.edit' => 'Edit projects',
            'projects.delete' => 'Delete projects',
        ];

        $permissions = collect($permissionMap)->map(function (string $name, string $slug) {
            return Permission::query()->updateOrCreate(
                ['slug' => $slug],
                ['name' => $name]
            );
        });

        $admin = Role::query()->updateOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin']
        );

        $projectManager = Role::query()->updateOrCreate(
            ['slug' => 'project-manager'],
            ['name' => 'Project Manager']
        );

        $ba = Role::query()->updateOrCreate(
            ['slug' => 'ba'],
            ['name' => 'BA']
        );

        $dev = Role::query()->updateOrCreate(
            ['slug' => 'dev'],
            ['name' => 'Dev']
        );

        $admin->permissions()->sync($permissions->pluck('id'));
        $projectManager->permissions()->sync(
            $permissions->whereIn('slug', ['users.view', 'users.edit', 'settings.view', 'logs.view', 'projects.view', 'projects.create', 'projects.edit'])->pluck('id')
        );
        $ba->permissions()->sync($permissions->whereIn('slug', ['logs.view', 'projects.view'])->pluck('id'));
        $dev->permissions()->sync($permissions->whereIn('slug', ['logs.view', 'projects.view'])->pluck('id'));

        $adminUser = User::query()->updateOrCreate(
            ['email' => 'admin@ba-ai.local'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('Admin@123'),
            ]
        );

        $projectManagerUser = User::query()->updateOrCreate(
            ['email' => 'pm@ba-ai.local'],
            [
                'name' => 'Project Manager',
                'password' => Hash::make('Pm@123456'),
            ]
        );

        $baUser = User::query()->updateOrCreate(
            ['email' => 'ba@ba-ai.local'],
            [
                'name' => 'Business Analyst',
                'password' => Hash::make('Ba@123456'),
            ]
        );

        $devUser = User::query()->updateOrCreate(
            ['email' => 'dev@ba-ai.local'],
            [
                'name' => 'Developer',
                'password' => Hash::make('Dev@123456'),
            ]
        );

        $adminUser->roles()->syncWithoutDetaching([$admin->id]);
        $projectManagerUser->roles()->syncWithoutDetaching([$projectManager->id]);
        $baUser->roles()->syncWithoutDetaching([$ba->id]);
        $devUser->roles()->syncWithoutDetaching([$dev->id]);
    }
}
