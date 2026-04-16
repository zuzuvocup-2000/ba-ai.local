<?php

namespace App\Http\Requests;

class ApproveDocumentRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'comment.max' => 'Nhận xét không được vượt quá 1000 ký tự.',
        ];
    }
}
