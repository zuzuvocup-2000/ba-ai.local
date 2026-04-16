<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentChangeProposal;
use App\Services\DocumentChangeProposalService;
use App\Services\DocumentService;

class DocumentChangeProposalController extends Controller
{
    public function __construct(
        private readonly DocumentChangeProposalService $proposalService,
        private readonly DocumentService $documentService,
    ) {}

    public function index(Document $document)
    {
        $proposals = $this->proposalService->listByDocument($document);
        return ApiResponse::success($proposals, 'Lấy danh sách đề xuất thành công.');
    }

    public function accept(Document $document, DocumentChangeProposal $proposal)
    {
        if ($proposal->document_id !== $document->id) {
            return ApiResponse::error('Đề xuất không thuộc tài liệu này.', 403);
        }

        try {
            $updated = $this->proposalService->accept($proposal, auth()->id());
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        MongoLogHelper::action([
            'action'      => 'proposals.accept',
            'actor_id'    => auth()->id(),
            'proposal_id' => $proposal->id,
            'document_id' => $document->id,
        ]);

        $updated->load(['generationLog']);
        return ApiResponse::success($this->documentService->toArray($updated), 'Đã áp dụng đề xuất thành công.');
    }

    public function dismiss(Document $document, DocumentChangeProposal $proposal)
    {
        if ($proposal->document_id !== $document->id) {
            return ApiResponse::error('Đề xuất không thuộc tài liệu này.', 403);
        }

        try {
            $this->proposalService->dismiss($proposal, auth()->id());
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        MongoLogHelper::action([
            'action'      => 'proposals.dismiss',
            'actor_id'    => auth()->id(),
            'proposal_id' => $proposal->id,
            'document_id' => $document->id,
        ]);

        return ApiResponse::success(null, 'Đã từ chối đề xuất.');
    }
}
