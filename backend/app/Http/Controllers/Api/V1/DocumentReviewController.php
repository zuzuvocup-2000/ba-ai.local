<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveDocumentRequest;
use App\Http\Requests\RejectDocumentRequest;
use App\Models\Document;
use App\Services\DocumentReviewService;
use App\Services\DocumentService;

class DocumentReviewController extends Controller
{
    public function __construct(
        private readonly DocumentReviewService $reviewService,
        private readonly DocumentService $documentService,
    ) {}

    public function index(Document $document)
    {
        $reviews = $this->reviewService->listReviews($document);

        MongoLogHelper::action([
            'action'      => 'reviews.list',
            'actor_id'    => auth()->id(),
            'document_id' => $document->id,
        ]);

        return ApiResponse::success($reviews, 'Lấy danh sách review thành công.');
    }

    public function submitReview(Document $document)
    {
        try {
            $updated = $this->reviewService->submitForReview($document, auth()->id());
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        MongoLogHelper::action([
            'action'      => 'reviews.submit',
            'actor_id'    => auth()->id(),
            'document_id' => $document->id,
        ]);

        $updated->load(['generationLog', 'approvedBy']);
        return ApiResponse::success($this->documentService->toArray($updated), 'Đã gửi tài liệu để review.');
    }

    public function approve(ApproveDocumentRequest $request, Document $document)
    {
        try {
            $updated = $this->reviewService->approve($document, auth()->id(), $request->input('comment'));
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        MongoLogHelper::action([
            'action'      => 'reviews.approve',
            'actor_id'    => auth()->id(),
            'document_id' => $document->id,
        ]);

        $updated->load(['generationLog', 'approvedBy']);
        return ApiResponse::success($this->documentService->toArray($updated), 'Tài liệu đã được phê duyệt.');
    }

    public function reject(RejectDocumentRequest $request, Document $document)
    {
        try {
            $updated = $this->reviewService->reject($document, auth()->id(), $request->input('comment'));
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        MongoLogHelper::action([
            'action'      => 'reviews.reject',
            'actor_id'    => auth()->id(),
            'document_id' => $document->id,
        ]);

        $updated->load(['generationLog', 'approvedBy']);
        return ApiResponse::success($this->documentService->toArray($updated), 'Tài liệu đã bị từ chối.');
    }
}
