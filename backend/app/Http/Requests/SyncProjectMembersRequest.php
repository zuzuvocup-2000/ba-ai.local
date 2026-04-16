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
            'member_ids' => ['required', 'array'],
            'member_ids.*' => ['integer', Rule::exists('users', 'id')],
        ];
    }

    public function messages(): array
    {
        return [
            'member_ids.required' => 'Danh sách thành viên là bắt buộc.',
            'member_ids.array' => 'Danh sách thành viên phải là mảng.',
            'member_ids.*.exists' => 'Có thành viên không tồn tại trong hệ thống.',
        ];
    }
}

