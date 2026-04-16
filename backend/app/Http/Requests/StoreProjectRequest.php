<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreProjectRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:projects,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', 'string', Rule::in(['planning', 'active', 'on-hold', 'done'])],
            'member_assignments' => ['sometimes', 'array'],
            'member_assignments.*.user_id' => ['required', 'integer', Rule::exists('users', 'id')],
            'member_assignments.*.project_role' => ['required', 'string', Rule::in(['project-manager', 'ba', 'dev'])],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Mã dự án là bắt buộc.',
            'code.unique' => 'Mã dự án đã tồn tại.',
            'name.required' => 'Tên dự án là bắt buộc.',
            'status.in' => 'Trạng thái dự án không hợp lệ.',
            'member_assignments.array' => 'Danh sách phân quyền thành viên phải là mảng.',
            'member_assignments.*.user_id.exists' => 'Có thành viên không tồn tại trong hệ thống.',
            'member_assignments.*.project_role.in' => 'Vai trò dự án chỉ gồm Project Manager, BA hoặc Dev.',
        ];
    }
}

