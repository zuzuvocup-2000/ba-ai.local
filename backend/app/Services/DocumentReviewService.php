<?php
namespace App\Services;

use App\Models\Document;
use App\Models\DocumentReview;
use App\Models\DocumentVersion;

class DocumentReviewService
{
    public function __construct(private readonly DocumentService $documentService) {}

    public function submitForReview(Document $doc, int $userId): Document
    {
        if (!in_array($doc->status, ['generated', 'draft'])) {
            throw new \InvalidArgumentException('Chỉ có thể gửi tài liệu ở trạng thái "generated" hoặc "draft" để review.');
        }

        return $this->documentService->update($doc, [
            'status'     => 'under_review',
            'updated_by' => $userId,
        ]);
    }

    public function approve(Document $doc, int $reviewerId, ?string $comment = null): Document
    {
        if ($doc->status !== 'under_review') {
            throw new \InvalidArgumentException('Chỉ có thể phê duyệt tài liệu đang trong trạng thái review.');
        }

        // Get current version
        $currentVersion = DocumentVersion::query()
            ->where('document_id', $doc->id)
            ->orderByDesc('version_number')
            ->first();

        DocumentReview::create([
            'document_id'  => $doc->id,
            'version_id'   => $currentVersion?->id,
            'reviewer_id'  => $reviewerId,
            'status'       => 'approved',
            'comment'      => $comment,
            'reviewed_at'  => now(),
        ]);

        $updated = $this->documentService->update($doc, [
            'status'      => 'approved',
            'approved_by' => $reviewerId,
            'approved_at' => now(),
            'updated_by'  => $reviewerId,
        ]);

        return $updated;
    }

    public function reject(Document $doc, int $reviewerId, string $comment): Document
    {
        if ($doc->status !== 'under_review') {
            throw new \InvalidArgumentException('Chỉ có thể từ chối tài liệu đang trong trạng thái review.');
        }

        $currentVersion = DocumentVersion::query()
            ->where('document_id', $doc->id)
            ->orderByDesc('version_number')
            ->first();

        DocumentReview::create([
            'document_id' => $doc->id,
            'version_id'  => $currentVersion?->id,
            'reviewer_id' => $reviewerId,
            'status'      => 'rejected',
            'comment'     => $comment,
            'reviewed_at' => now(),
        ]);

        $updated = $this->documentService->update($doc, [
            'status'     => 'generated',
            'updated_by' => $reviewerId,
        ]);

        return $updated;
    }

    public function listReviews(Document $doc): array
    {
        return DocumentReview::query()
            ->where('document_id', $doc->id)
            ->with(['reviewer'])
            ->orderByDesc('id')
            ->get()
            ->map(fn ($r) => [
                'id'          => $r->id,
                'status'      => $r->status,
                'comment'     => $r->comment,
                'reviewer'    => $r->reviewer?->name,
                'reviewed_at' => $r->reviewed_at,
                'version_id'  => $r->version_id,
            ])
            ->values()
            ->all();
    }
}
