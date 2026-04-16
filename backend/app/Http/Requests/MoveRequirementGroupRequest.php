<?php

namespace App\Http\Requests;

class MoveRequirementGroupRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_id'   => ['nullable', 'integer', 'exists:requirement_groups,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'group_id.exists'    => 'Nhóm yêu cầu không tồn tại.',
            'sort_order.integer' => 'Thứ tự sắp xếp phải là số nguyên.',
            'sort_order.min'     => 'Thứ tự sắp xếp không được âm.',
        ];
    }
}
