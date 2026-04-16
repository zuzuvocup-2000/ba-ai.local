<?php

namespace App\Services;

use App\Models\Document;

class DocumentService
{
    public function listByRequirement(int $requirementId): array
    {
        return Document::query()
            ->where('requirement_id', $requirementId)
            ->with(['generationLog', 'approvedBy'])
            ->orderBy('type')
            ->get()
            ->map(fn (Document $doc) => $this->toArray($doc))
            ->values()
            ->all();
    }

    public function update(Document $doc, array $payload): Document
    {
        $doc->update($payload);
        $doc->refresh();

        return $doc;
    }

    public function delete(Document $doc): bool
    {
        return $doc->delete();
    }

    public function toArray(Document $doc): array
    {
        return [
            'id'              => $doc->id,
            'requirement_id'  => $doc->requirement_id,
            'type'            => $doc->type,
            'title'           => $doc->title,
            'content'         => $doc->content,
            'status'          => $doc->status,
            'current_version' => $doc->current_version,
            'generation_log'  => $doc->relationLoaded('generationLog') && $doc->generationLog ? [
                'id'           => $doc->generationLog->id,
                'model_used'   => $doc->generationLog->model_used,
                'tokens_input' => $doc->generationLog->tokens_input,
                'tokens_output'=> $doc->generationLog->tokens_output,
                'duration_ms'  => $doc->generationLog->duration_ms,
                'status'       => $doc->generationLog->status,
            ] : null,
            'approved_by'     => $doc->relationLoaded('approvedBy') ? $doc->approvedBy?->name : null,
            'approved_at'     => $doc->approved_at,
            'created_at'      => $doc->created_at,
            'updated_at'      => $doc->updated_at,
        ];
    }
}
