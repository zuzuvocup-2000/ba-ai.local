<?php

namespace App\Http\Requests;

class ReviewChecklistItemRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'review_status' => ['required', 'string', 'in:approved,rejected'],
            'comment'       => ['required_if:review_status,rejected', 'nullable', 'string', 'max:1000'],
        ];
    }
}
