<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreRequirementRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id'  => ['required', 'integer', 'exists:projects,id'],
            'group_id'    => ['nullable', 'integer', 'exists:requirement_groups,id'],
            'title'       => ['required', 'string', 'max:500'],
            'raw_content' => ['required', 'string'],
            'tags'        => ['nullable', 'array'],
            'tags.*'      => ['string', 'max:50'],
            'status'      => ['nullable', 'string', Rule::in(['draft', 'in_analysis', 'completed', 'archived'])],
            'priority'    => ['nullable', 'string', Rule::in(['low', 'medium', 'high', 'critical'])],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'project_id.required'  => 'Dự án là bắt buộc.',
            'project_id.exists'    => 'Dự án không tồn tại.',
            'group_id.exists'      => 'Nhóm yêu cầu không tồn tại.',
            'title.required'       => 'Tiêu đề yêu cầu là bắt buộc.',
            'title.max'            => 'Tiêu đề không được vượt quá 500 ký tự.',
            'raw_content.required' => 'Nội dung yêu cầu là bắt buộc.',
            'tags.array'           => 'Tags phải là mảng.',
            'tags.*.max'           => 'Mỗi tag không được vượt quá 50 ký tự.',
            'status.in'            => 'Trạng thái không hợp lệ. Giá trị hợp lệ: draft, in_analysis, completed, archived.',
            'priority.in'          => 'Mức độ ưu tiên không hợp lệ. Giá trị hợp lệ: low, medium, high, critical.',
            'sort_order.integer'   => 'Thứ tự sắp xếp phải là số nguyên.',
            'sort_order.min'       => 'Thứ tự sắp xếp không được âm.',
        ];
    }
}
