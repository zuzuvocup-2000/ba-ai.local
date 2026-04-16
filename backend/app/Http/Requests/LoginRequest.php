<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class LoginRequest extends ApiFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'system' => ['required', 'string', Rule::in(['admin', 'project'])],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email là bắt buộc.',
            'email.email' => 'Email không đúng định dạng.',
            'password.required' => 'Mật khẩu là bắt buộc.',
            'system.required' => 'Loại hệ thống đăng nhập là bắt buộc.',
            'system.in' => 'Loại hệ thống đăng nhập không hợp lệ.',
        ];
    }
}
