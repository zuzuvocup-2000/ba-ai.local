<?php

namespace App\Http\Requests;

class ListRequirementGroupsRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['required', 'integer', 'exists:projects,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'project_id.required' => 'Dự án là bắt buộc.',
            'project_id.exists'   => 'Dự án không tồn tại.',
        ];
    }
}
