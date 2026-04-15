<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncProjectMembersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_ids' => ['required', 'array'],
            'member_ids.*' => ['integer', Rule::exists('users', 'id')],
        ];
    }
}

