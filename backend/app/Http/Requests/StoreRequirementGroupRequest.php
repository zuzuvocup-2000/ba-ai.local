<?php

namespace App\Http\Requests;

class StoreRequirementGroupRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id'  => ['required', 'integer', 'exists:projects,id'],
            'parent_id'   => ['nullable', 'integer', 'exists:requirement_groups,id'],
            'name'        => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1000'],
            'prefix'      => ['nullable', 'string', 'max:10', 'regex:/^[A-Z0-9\-]+$/i'],
            'color'       => ['nullable', 'string', 'max:20'],
            'icon'        => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'project_id.required' => 'Dự án là bắt buộc.',
            'project_id.exists'   => 'Dự án không tồn tại.',
            'parent_id.exists'    => 'Nhóm cha không tồn tại.',
            'name.required'       => 'Tên nhóm là bắt buộc.',
            'name.max'            => 'Tên nhóm không được vượt quá 200 ký tự.',
            'description.max'     => 'Mô tả không được vượt quá 1000 ký tự.',
            'prefix.max'          => 'Tiền tố không được vượt quá 10 ký tự.',
            'prefix.regex'        => 'Tiền tố chỉ được chứa chữ cái, chữ số và dấu gạch ngang.',
            'color.max'           => 'Màu sắc không được vượt quá 20 ký tự.',
            'icon.max'            => 'Icon không được vượt quá 50 ký tự.',
        ];
    }
}
