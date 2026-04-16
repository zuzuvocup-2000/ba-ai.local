<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateRolePermissionsRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'permission_slugs' => ['required', 'array'],
            'permission_slugs.*' => ['required', 'string', Rule::exists('permissions', 'slug')],
        ];
    }

    public function messages(): array
    {
        return [
            'permission_slugs.required' => 'Danh sách quyền là bắt buộc.',
            'permission_slugs.array' => 'Danh sách quyền phải là mảng.',
            'permission_slugs.*.exists' => 'Có quyền không tồn tại trong hệ thống.',
        ];
    }
}

