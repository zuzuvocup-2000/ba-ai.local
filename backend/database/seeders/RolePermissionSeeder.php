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
        ];

        $permissions = collect($permissionMap)->map(function (string $name, string $slug) {
            return Permission::query()->updateOrCreate(
                ['slug' => $slug],
                ['name' => $name]
            );
        });

        $superAdmin = Role::query()->updateOrCreate(
            ['slug' => 'super-admin'],
            ['name' => 'Super Admin']
        );

        $manager = Role::query()->updateOrCreate(
            ['slug' => 'manager'],
            ['name' => 'Manager']
        );

        $superAdmin->permissions()->sync($permissions->pluck('id'));
        $manager->permissions()->sync(
            $permissions->whereIn('slug', ['users.view', 'users.edit', 'settings.view'])->pluck('id')
        );

        $adminUser = User::query()->updateOrCreate(
            ['email' => 'admin@ba-ai.local'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('Admin@123'),
            ]
        );

        $adminUser->roles()->syncWithoutDetaching([$superAdmin->id]);
    }
}
