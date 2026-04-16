<?php

namespace App\Http\Requests;

class ChatDocumentRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message'                     => ['required', 'string', 'max:5000'],
            'conversation_id'             => ['nullable', 'string', 'max:64'],
            'previous_messages'           => ['nullable', 'array', 'max:50'],
            'previous_messages.*.role'    => ['required', 'string', 'in:user,assistant'],
            'previous_messages.*.content' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required'                     => 'Tin nhắn là bắt buộc.',
            'message.max'                          => 'Tin nhắn không được vượt quá 5000 ký tự.',
            'conversation_id.max'                  => 'ID cuộc hội thoại không được vượt quá 64 ký tự.',
            'previous_messages.array'              => 'Lịch sử tin nhắn phải là mảng.',
            'previous_messages.max'                => 'Lịch sử tin nhắn tối đa 50 tin nhắn.',
            'previous_messages.*.role.required'    => 'Vai trò tin nhắn là bắt buộc.',
            'previous_messages.*.role.in'          => 'Vai trò tin nhắn không hợp lệ. Giá trị hợp lệ: user, assistant.',
            'previous_messages.*.content.required' => 'Nội dung tin nhắn là bắt buộc.',
        ];
    }
}
