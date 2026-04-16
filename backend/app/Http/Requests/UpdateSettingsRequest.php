<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends ApiFormRequest
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
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.key' => ['required', 'string', 'max:120'],
            'items.*.name' => ['required', 'string', 'max:190'],
            'items.*.value' => ['nullable'],
            'items.*.type' => ['required', 'string', Rule::in(['string', 'int', 'float', 'bool', 'json'])],
            'items.*.group' => ['nullable', 'string', 'max:120'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.is_public' => ['nullable', 'boolean'],
            'items.*.sort_order' => ['nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Danh sách cấu hình là bắt buộc.',
            'items.array' => 'Danh sách cấu hình phải là mảng.',
            'items.*.key.required' => 'Key cấu hình là bắt buộc.',
            'items.*.name.required' => 'Tên cấu hình là bắt buộc.',
            'items.*.type.in' => 'Kiểu dữ liệu cấu hình không hợp lệ.',
            'items.*.is_public.boolean' => 'Trạng thái công khai phải là true hoặc false.',
            'items.*.sort_order.integer' => 'Thứ tự sắp xếp phải là số nguyên.',
        ];
    }
}

