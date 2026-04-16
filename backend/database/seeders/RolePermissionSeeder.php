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
            // Users
            'users.view'   => 'View users',
            'users.create' => 'Create users',
            'users.edit'   => 'Edit users',
            'users.delete' => 'Delete users',
            // Settings
            'settings.view' => 'View settings',
            'settings.edit' => 'Edit settings',
            // Logs
            'logs.view' => 'View logs',
            // Projects
            'projects.view'   => 'View projects',
            'projects.create' => 'Create projects',
            'projects.edit'   => 'Edit projects',
            'projects.delete' => 'Delete projects',
            // Roles
            'roles.view' => 'View roles',
            'roles.edit' => 'Edit role permissions',
            // Feature Groups
            'groups.view'          => 'Xem nhóm chức năng',
            'groups.create'        => 'Tạo nhóm chức năng',
            'groups.edit'          => 'Sửa nhóm chức năng',
            'groups.delete'        => 'Xóa nhóm chức năng',
            'groups.bulk_generate' => 'Sinh hàng loạt tài liệu',
            // Requirements
            'requirements.view'   => 'Xem yêu cầu',
            'requirements.create' => 'Tạo yêu cầu',
            'requirements.edit'   => 'Sửa yêu cầu',
            'requirements.delete' => 'Xóa yêu cầu',
            // Documents
            'documents.view'     => 'Xem tài liệu',
            'documents.create'   => 'Tạo tài liệu',
            'documents.edit'     => 'Sửa tài liệu',
            'documents.generate' => 'Sinh tài liệu bằng AI',
            'documents.approve'  => 'Phê duyệt tài liệu',
            'documents.delete'   => 'Xóa tài liệu',
            // Templates
            'templates.view'   => 'Xem mẫu tài liệu',
            'templates.manage' => 'Quản lý mẫu tài liệu',
            // AI Settings
            'ai_settings.manage' => 'Quản lý cài đặt AI',
            // Checklists
            'checklist.view'   => 'Xem checklist',
            'checklist.submit' => 'Submit checklist item',
            'checklist.review' => 'Review checklist item',
        ];

        $permissions = collect($permissionMap)->map(function (string $name, string $slug) {
            return Permission::query()->updateOrCreate(
                ['slug' => $slug],
                ['name' => $name]
            );
        });

        // ── Roles ──────────────────────────────────────────────────────────────

        $systemAdmin = Role::query()->updateOrCreate(
            ['slug' => 'system-admin'],
            ['name' => 'System Admin']
        );

        $employee = Role::query()->updateOrCreate(
            ['slug' => 'employee'],
            ['name' => 'Employee']
        );

        $ba = Role::query()->updateOrCreate(
            ['slug' => 'ba'],
            ['name' => 'Business Analyst']
        );

        $dev = Role::query()->updateOrCreate(
            ['slug' => 'dev'],
            ['name' => 'Developer']
        );

        $pm = Role::query()->updateOrCreate(
            ['slug' => 'pm'],
            ['name' => 'Project Manager']
        );

        // ── Permission assignments ─────────────────────────────────────────────

        // System Admin: all permissions
        $systemAdmin->permissions()->sync($permissions->pluck('id'));

        // Employee: minimal read access
        $employee->permissions()->sync(
            $permissions->whereIn('slug', ['projects.view', 'logs.view'])->pluck('id')
        );

        // Business Analyst
        $ba->permissions()->sync(
            $permissions->whereIn('slug', [
                'groups.view', 'groups.create', 'groups.edit', 'groups.delete', 'groups.bulk_generate',
                'requirements.view', 'requirements.create', 'requirements.edit', 'requirements.delete',
                'documents.view', 'documents.create', 'documents.edit', 'documents.generate', 'documents.delete',
                'templates.view',
                'checklist.view', 'checklist.review',
            ])->pluck('id')
        );

        // Developer
        $dev->permissions()->sync(
            $permissions->whereIn('slug', [
                'groups.view',
                'requirements.view',
                'documents.view',
                'templates.view',
                'checklist.view', 'checklist.submit',
            ])->pluck('id')
        );

        // Project Manager
        $pm->permissions()->sync(
            $permissions->whereIn('slug', [
                'groups.view', 'groups.create', 'groups.edit', 'groups.delete',
                'requirements.view', 'requirements.create', 'requirements.edit', 'requirements.delete',
                'documents.view', 'documents.create', 'documents.edit', 'documents.generate', 'documents.approve', 'documents.delete',
                'templates.view',
                'checklist.view', 'checklist.review',
            ])->pluck('id')
        );

        // ── Sample users ───────────────────────────────────────────────────────

        $adminUser = User::query()->updateOrCreate(
            ['email' => 'admin@ba-ai.local'],
            [
                'name'     => 'System Admin',
                'password' => Hash::make('Admin@123'),
            ]
        );

        $employeeUser = User::query()->updateOrCreate(
            ['email' => 'employee@ba-ai.local'],
            [
                'name'     => 'Nhân viên',
                'password' => Hash::make('Employee@123'),
            ]
        );

        $baUser = User::query()->updateOrCreate(
            ['email' => 'ba@ba-ai.local'],
            ['name' => 'Nguyễn BA', 'password' => Hash::make('Ba@12345')]
        );

        $devUser = User::query()->updateOrCreate(
            ['email' => 'dev@ba-ai.local'],
            ['name' => 'Trần DEV', 'password' => Hash::make('Dev@12345')]
        );

        $pmUser = User::query()->updateOrCreate(
            ['email' => 'pm@ba-ai.local'],
            ['name' => 'Lê PM', 'password' => Hash::make('Pm@12345')]
        );

        $adminUser->roles()->syncWithoutDetaching([$systemAdmin->id]);
        $employeeUser->roles()->syncWithoutDetaching([$employee->id]);
        $baUser->roles()->syncWithoutDetaching([$ba->id]);
        $devUser->roles()->syncWithoutDetaching([$dev->id]);
        $pmUser->roles()->syncWithoutDetaching([$pm->id]);
    }
}
