<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:projects,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', 'string', Rule::in(['planning', 'active', 'on-hold', 'done'])],
            'member_ids' => ['sometimes', 'array'],
            'member_ids.*' => ['integer', Rule::exists('users', 'id')],
        ];
    }
}

