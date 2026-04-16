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
            'roles.view' => 'View roles',
            'roles.edit' => 'Edit role permissions',
        ];

        $permissions = collect($permissionMap)->map(function (string $name, string $slug) {
            return Permission::query()->updateOrCreate(
                ['slug' => $slug],
                ['name' => $name]
            );
        });

        $systemAdmin = Role::query()->updateOrCreate(
            ['slug' => 'system-admin'],
            ['name' => 'System Admin']
        );

        $employee = Role::query()->updateOrCreate(
            ['slug' => 'employee'],
            ['name' => 'Employee']
        );

        $systemAdmin->permissions()->sync($permissions->pluck('id'));
        $employee->permissions()->sync(
            $permissions->whereIn('slug', ['projects.view', 'logs.view'])->pluck('id')
        );

        $adminUser = User::query()->updateOrCreate(
            ['email' => 'admin@ba-ai.local'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('Admin@123'),
            ]
        );

        $employeeUser = User::query()->updateOrCreate(
            ['email' => 'employee@ba-ai.local'],
            [
                'name' => 'Nhân viên',
                'password' => Hash::make('Employee@123'),
            ]
        );

        $adminUser->roles()->syncWithoutDetaching([$systemAdmin->id]);
        $employeeUser->roles()->syncWithoutDetaching([$employee->id]);
    }
}
