<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentVersion;

class DocumentVersionService
{
    /**
     * Create a version snapshot for the document's CURRENT content.
     * Increments document.current_version and saves it.
     */
    public function createSnapshot(
        Document $doc,
        string $changeSummary,
        string $changeType,
        int $userId,
        ?int $proposalId = null
    ): DocumentVersion {
        $nextVersion = ($doc->current_version ?? 0) + 1;

        $version = DocumentVersion::create([
            'document_id'    => $doc->id,
            'version_number' => $nextVersion,
            'content'        => $doc->content,
            'change_summary' => mb_substr($changeSummary, 0, 490),
            'change_type'    => $changeType,
            'proposal_id'    => $proposalId,
            'created_by'     => $userId,
        ]);

        $doc->update(['current_version' => $nextVersion]);

        return $version;
    }

    public function listByDocument(Document $doc): array
    {
        return DocumentVersion::query()
            ->where('document_id', $doc->id)
            ->with(['createdBy'])
            ->orderByDesc('version_number')
            ->get()
            ->map(fn (DocumentVersion $v) => $this->toListItem($v))
            ->values()
            ->all();
    }

    public function getVersion(Document $doc, int $versionNumber): ?DocumentVersion
    {
        return DocumentVersion::query()
            ->where('document_id', $doc->id)
            ->where('version_number', $versionNumber)
            ->first();
    }

    public function toListItem(DocumentVersion $v): array
    {
        return [
            'id'             => $v->id,
            'document_id'    => $v->document_id,
            'version_number' => $v->version_number,
            'change_summary' => $v->change_summary,
            'change_type'    => $v->change_type,
            'created_by'     => $v->relationLoaded('createdBy') ? $v->createdBy?->name : null,
            'created_at'     => $v->created_at,
        ];
    }
}
