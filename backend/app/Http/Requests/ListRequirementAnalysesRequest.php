<?php

namespace App\Http\Requests;

class ListRequirementAnalysesRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requirement_id' => ['required', 'integer', 'exists:requirements,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'requirement_id.required' => 'Yêu cầu là bắt buộc.',
            'requirement_id.exists'   => 'Yêu cầu không tồn tại.',
        ];
    }
}
