<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
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
}

