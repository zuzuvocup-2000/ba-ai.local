<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpsertRequirementAnalysisRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requirement_id'    => ['required', 'integer', 'exists:requirements,id'],
            'document_type'     => ['required', 'string', Rule::in(['brd', 'flow_diagram', 'sql_logic', 'business_rules', 'validation_rules', 'test_cases', 'checklist'])],
            'actors'            => ['nullable', 'array'],
            'preconditions'     => ['nullable', 'string'],
            'main_flow'         => ['nullable', 'array'],
            'alternative_flows' => ['nullable', 'array'],
            'exception_flows'   => ['nullable', 'array'],
            'business_rules'    => ['nullable', 'array'],
            'data_fields'       => ['nullable', 'array'],
            'non_functional'    => ['nullable', 'string'],
            'notes'             => ['nullable', 'string'],
            'extended_data'     => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'requirement_id.required' => 'Yêu cầu nghiệp vụ là bắt buộc.',
            'requirement_id.exists'   => 'Yêu cầu nghiệp vụ không tồn tại.',
            'document_type.required'  => 'Loại tài liệu là bắt buộc.',
            'document_type.in'        => 'Loại tài liệu không hợp lệ. Giá trị hợp lệ: brd, flow_diagram, sql_logic, business_rules, validation_rules, test_cases, checklist.',
        ];
    }
}
