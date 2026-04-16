<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class ListRequirementsRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'group_id'   => ['nullable', 'integer', 'exists:requirement_groups,id'],
            'status'     => ['nullable', 'string', Rule::in(['draft', 'in_analysis', 'completed', 'archived'])],
        ];
    }

    public function messages(): array
    {
        return [
            'project_id.required' => 'Dự án là bắt buộc.',
            'project_id.exists'   => 'Dự án không tồn tại.',
            'group_id.exists'     => 'Nhóm yêu cầu không tồn tại.',
            'status.in'           => 'Trạng thái không hợp lệ. Giá trị hợp lệ: draft, in_analysis, completed, archived.',
        ];
    }
}
