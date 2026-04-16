<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreDocumentTemplateRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'         => ['required', 'string', Rule::in(['brd', 'flow_diagram', 'sql_logic', 'business_rules', 'validation_rules', 'test_cases', 'checklist'])],
            'name'         => ['required', 'string', 'max:200'],
            'description'  => ['nullable', 'string'],
            'content'      => ['required', 'string'],
            'placeholders' => ['nullable', 'array'],
            'is_default'   => ['nullable', 'boolean'],
            'is_global'    => ['nullable', 'boolean'],
            'project_id'   => ['nullable', 'integer', 'exists:projects,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required'    => 'Loại template là bắt buộc.',
            'type.in'          => 'Loại template không hợp lệ. Giá trị hợp lệ: brd, flow_diagram, sql_logic, business_rules, validation_rules, test_cases, checklist.',
            'name.required'    => 'Tên template là bắt buộc.',
            'name.max'         => 'Tên template không được vượt quá 200 ký tự.',
            'content.required' => 'Nội dung template là bắt buộc.',
            'is_default.boolean' => 'Giá trị mặc định phải là true hoặc false.',
            'is_global.boolean'  => 'Giá trị toàn cục phải là true hoặc false.',
            'project_id.exists'  => 'Dự án không tồn tại.',
        ];
    }
}
