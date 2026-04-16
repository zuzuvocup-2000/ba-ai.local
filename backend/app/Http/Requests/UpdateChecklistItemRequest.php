<?php

namespace App\Http\Requests;

class UpdateChecklistItemRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dev_status'        => ['nullable', 'string', 'in:not_started,in_progress,dev_done'],
            'dev_proof'         => ['nullable', 'array'],
            'dev_proof.*.key'   => ['string'],
            'dev_proof.*.value' => ['string'],
        ];
    }
}
