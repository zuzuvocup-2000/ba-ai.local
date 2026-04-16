<?php

namespace App\Http\Requests;

class GenerateDocumentRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requirement_id' => ['required', 'integer', 'exists:requirements,id'],
            'document_type'  => ['required', 'string', 'in:brd,flow_diagram,sql_logic,business_rules,validation_rules,test_cases,checklist'],
        ];
    }

    public function messages(): array
    {
        return [
            'requirement_id.required' => 'Yêu cầu nghiệp vụ là bắt buộc.',
            'requirement_id.exists'   => 'Yêu cầu nghiệp vụ không tồn tại.',
            'document_type.required'  => 'Loại tài liệu là bắt buộc.',
            'document_type.in'        => 'Loại tài liệu không hợp lệ.',
        ];
    }
}
