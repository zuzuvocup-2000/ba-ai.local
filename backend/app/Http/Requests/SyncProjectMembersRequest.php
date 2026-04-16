<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class SyncProjectMembersRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_assignments' => ['required', 'array'],
            'member_assignments.*.user_id' => ['required', 'integer', Rule::exists('users', 'id')],
            'member_assignments.*.project_role' => ['required', 'string', Rule::in(['project-manager', 'ba', 'dev'])],
        ];
    }

    public function messages(): array
    {
        return [
            'member_assignments.required' => 'Danh sách phân quyền thành viên là bắt buộc.',
            'member_assignments.array' => 'Danh sách phân quyền thành viên phải là mảng.',
            'member_assignments.*.user_id.exists' => 'Có thành viên không tồn tại trong hệ thống.',
            'member_assignments.*.project_role.in' => 'Vai trò dự án chỉ gồm Project Manager, BA hoặc Dev.',
        ];
    }
}

