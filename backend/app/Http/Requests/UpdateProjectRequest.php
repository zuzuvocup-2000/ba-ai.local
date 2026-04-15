<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $projectId = $this->route('project')?->id ?? $this->route('project');

        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('projects', 'code')->ignore($projectId)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', 'string', Rule::in(['planning', 'active', 'on-hold', 'done'])],
            'member_ids' => ['sometimes', 'array'],
            'member_ids.*' => ['integer', Rule::exists('users', 'id')],
        ];
    }
}

