<?php

namespace App\Http\Requests;

class UpdateDocumentRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'   => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Nội dung tài liệu là bắt buộc.',
        ];
    }
}
