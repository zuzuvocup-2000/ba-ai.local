<?php

namespace App\Http\Requests;

class MoveRequirementGroupParentRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'integer', 'exists:requirement_groups,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'parent_id.exists' => 'Nhóm cha không tồn tại.',
        ];
    }
}
