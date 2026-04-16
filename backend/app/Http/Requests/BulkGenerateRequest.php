<?php

namespace App\Http\Requests;

class BulkGenerateRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_types'   => ['nullable', 'array'],
            'document_types.*' => ['string', 'in:brd,flow_diagram,sql_logic,business_rules,validation_rules,test_cases,checklist'],
        ];
    }

    public function messages(): array
    {
        return [
            'document_types.array'      => 'Danh sách loại tài liệu phải là mảng.',
            'document_types.*.in'       => 'Loại tài liệu không hợp lệ.',
        ];
    }
}
