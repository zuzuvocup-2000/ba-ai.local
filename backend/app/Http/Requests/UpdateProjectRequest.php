<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateProjectRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $projectId = $this->route('project')?->id ?? $this->route('project');

        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('projects', 'code')->ignore($projectId)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', 'string', Rule::in(['planning', 'active', 'on-hold', 'done'])],
            'member_ids' => ['sometimes', 'array'],
            'member_ids.*' => ['integer', Rule::exists('users', 'id')],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Mã dự án là bắt buộc.',
            'code.unique' => 'Mã dự án đã tồn tại.',
            'name.required' => 'Tên dự án là bắt buộc.',
            'status.required' => 'Trạng thái dự án là bắt buộc.',
            'status.in' => 'Trạng thái dự án không hợp lệ.',
            'member_ids.array' => 'Danh sách thành viên phải là mảng.',
            'member_ids.*.exists' => 'Có thành viên không tồn tại trong hệ thống.',
        ];
    }
}

