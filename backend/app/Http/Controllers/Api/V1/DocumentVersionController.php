<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\DocumentService;
use App\Services\DocumentVersionService;
use Illuminate\Http\Request;

class DocumentVersionController extends Controller
{
    public function __construct(
        private readonly DocumentVersionService $documentVersionService,
        private readonly DocumentService $documentService,
    ) {}

    public function index(Document $document)
    {
        $versions = $this->documentVersionService->listByDocument($document);
        return ApiResponse::success($versions, 'Lấy lịch sử phiên bản thành công.');
    }

    public function show(Document $document, int $versionNumber)
    {
        $version = $this->documentVersionService->getVersion($document, $versionNumber);
        if (!$version) {
            return ApiResponse::error('Phiên bản không tồn tại.', 404);
        }
        return ApiResponse::success([
            'id'             => $version->id,
            'document_id'    => $version->document_id,
            'version_number' => $version->version_number,
            'content'        => $version->content,
            'change_summary' => $version->change_summary,
            'change_type'    => $version->change_type,
            'created_at'     => $version->created_at,
        ], 'Lấy nội dung phiên bản thành công.');
    }

    public function restore(Document $document, int $versionNumber)
    {
        $version = $this->documentVersionService->getVersion($document, $versionNumber);
        if (!$version) {
            return ApiResponse::error('Phiên bản không tồn tại.', 404);
        }

        // Update document with old content
        $updated = $this->documentService->update($document, [
            'content'    => $version->content,
            'updated_by' => auth()->id(),
            'status'     => 'draft', // Restored docs go back to draft
        ]);

        // Create a new snapshot marking this as a restore
        $this->documentVersionService->createSnapshot(
            $updated,
            "Khôi phục từ phiên bản {$versionNumber}",
            'restored',
            auth()->id()
        );

        MongoLogHelper::action([
            'action'           => 'documents.restore',
            'actor_id'         => auth()->id(),
            'document_id'      => $document->id,
            'restored_version' => $versionNumber,
        ]);

        $updated->load(['generationLog']);
        return ApiResponse::success($this->documentService->toArray($updated), "Đã khôi phục tài liệu về phiên bản {$versionNumber}.");
    }
}
