<?php

namespace App\Http\Requests;

class ReorderRequirementGroupsRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items'              => ['required', 'array', 'min:1'],
            'items.*.id'         => ['required', 'integer'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'              => 'Danh sách sắp xếp là bắt buộc.',
            'items.array'                 => 'Danh sách sắp xếp phải là mảng.',
            'items.min'                   => 'Danh sách sắp xếp phải có ít nhất 1 phần tử.',
            'items.*.id.required'         => 'ID nhóm là bắt buộc.',
            'items.*.id.integer'          => 'ID nhóm phải là số nguyên.',
            'items.*.sort_order.required' => 'Thứ tự sắp xếp là bắt buộc.',
            'items.*.sort_order.integer'  => 'Thứ tự sắp xếp phải là số nguyên.',
            'items.*.sort_order.min'      => 'Thứ tự sắp xếp không được âm.',
        ];
    }
}
