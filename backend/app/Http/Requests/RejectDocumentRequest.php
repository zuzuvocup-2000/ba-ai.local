<?php

namespace App\Http\Requests;

class RejectDocumentRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'comment' => ['required', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'comment.required' => 'Lý do từ chối là bắt buộc.',
            'comment.max'      => 'Lý do từ chối không được vượt quá 1000 ký tự.',
        ];
    }
}
