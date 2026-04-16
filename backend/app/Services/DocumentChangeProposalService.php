<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentChangeProposal;

class DocumentChangeProposalService
{
    public function __construct(
        private readonly DocumentVersionService $versionService,
        private readonly DocumentService $documentService,
    ) {}

    public function listByDocument(Document $doc): array
    {
        return DocumentChangeProposal::query()
            ->where('document_id', $doc->id)
            ->with(['acceptedBy'])
            ->orderByDesc('id')
            ->get()
            ->map(fn ($p) => $this->toArray($p))
            ->values()
            ->all();
    }

    public function accept(DocumentChangeProposal $proposal, int $userId): Document
    {
        if ($proposal->status !== 'pending') {
            throw new \InvalidArgumentException('Đề xuất đã được xử lý.');
        }

        $document = $proposal->document;

        // Apply the proposed content (DocumentService::update will snapshot current content first)
        $updated = $this->documentService->update($document, [
            'content'         => $proposal->proposed_content,
            'updated_by'      => $userId,
            '_change_type'    => 'accepted_proposal',
            '_change_summary' => mb_substr($proposal->change_summary ?? 'Áp dụng đề xuất AI', 0, 490),
        ]);

        // Mark proposal as accepted
        $proposal->update([
            'status'      => 'accepted',
            'accepted_by' => $userId,
            'accepted_at' => now(),
        ]);

        return $updated;
    }

    public function dismiss(DocumentChangeProposal $proposal, int $userId): void
    {
        if ($proposal->status !== 'pending') {
            throw new \InvalidArgumentException('Đề xuất đã được xử lý.');
        }

        $proposal->update([
            'status'       => 'dismissed',
            'dismissed_at' => now(),
        ]);
    }

    public function toArray(DocumentChangeProposal $p): array
    {
        return [
            'id'               => $p->id,
            'document_id'      => $p->document_id,
            'conversation_id'  => $p->conversation_id,
            'change_summary'   => $p->change_summary,
            'proposed_content' => $p->proposed_content,
            'status'           => $p->status,
            'accepted_by'      => $p->relationLoaded('acceptedBy') ? $p->acceptedBy?->name : null,
            'accepted_at'      => $p->accepted_at,
            'dismissed_at'     => $p->dismissed_at,
            'created_at'       => $p->created_at,
        ];
    }
}
