<?php

namespace App\Http\Requests;

class StoreRequirementAttachmentRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:20480'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Vui lòng chọn tệp để tải lên.',
            'file.file'     => 'Tệp tải lên không hợp lệ.',
            'file.max'      => 'Kích thước tệp không được vượt quá 20 MB.',
        ];
    }
}
