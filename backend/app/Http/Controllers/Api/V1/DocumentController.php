<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\BulkGenerateRequest;
use App\Http\Requests\GenerateDocumentRequest;
use App\Http\Requests\ListDocumentsRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use App\Models\Requirement;
use App\Models\RequirementAnalysis;
use App\Models\RequirementGroup;
use App\Services\AiGenerationService;
use App\Services\DocumentService;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly AiGenerationService $aiGenerationService,
    ) {}

    public function index(ListDocumentsRequest $request)
    {
        $documents = $this->documentService->listByRequirement($request->integer('requirement_id'));

        return ApiResponse::success($documents, 'Lấy danh sách tài liệu thành công.');
    }

    public function show(Document $document)
    {
        $document->load(['generationLog', 'approvedBy']);

        return ApiResponse::success($this->documentService->toArray($document), 'Lấy tài liệu thành công.');
    }

    public function update(UpdateDocumentRequest $request, Document $document)
    {
        $updated = $this->documentService->update($document, array_merge(
            $request->validated(),
            ['updated_by' => auth()->id()]
        ));

        MongoLogHelper::action([
            'action'         => 'documents.update',
            'actor_id'       => auth()->id(),
            'document_id'    => $updated->id,
            'requirement_id' => $updated->requirement_id,
        ]);

        return ApiResponse::success($this->documentService->toArray($updated), 'Cập nhật tài liệu thành công.');
    }

    public function destroy(Document $document)
    {
        $reqId = $document->requirement_id;
        $docId = $document->id;

        $this->documentService->delete($document);

        MongoLogHelper::action([
            'action'         => 'documents.delete',
            'actor_id'       => auth()->id(),
            'document_id'    => $docId,
            'requirement_id' => $reqId,
        ]);

        return ApiResponse::success(null, 'Xóa tài liệu thành công.');
    }

    public function generate(GenerateDocumentRequest $request)
    {
        $analysis = RequirementAnalysis::query()
            ->where('requirement_id', $request->integer('requirement_id'))
            ->where('document_type', $request->input('document_type'))
            ->first();

        if (!$analysis) {
            return ApiResponse::error(
                'Vui lòng điền form phân tích yêu cầu trước khi sinh tài liệu.',
                422
            );
        }

        try {
            $document = $this->aiGenerationService->generate($analysis, auth()->id());
        } catch (\RuntimeException $e) {
            return ApiResponse::error($e->getMessage(), 502);
        }

        MongoLogHelper::action([
            'action'         => 'documents.generate',
            'actor_id'       => auth()->id(),
            'document_id'    => $document->id,
            'requirement_id' => $request->integer('requirement_id'),
            'document_type'  => $request->input('document_type'),
        ]);

        $document->load(['generationLog']);

        return ApiResponse::success($this->documentService->toArray($document), 'Sinh tài liệu thành công.', 201);
    }

    public function bulkGenerate(BulkGenerateRequest $request, RequirementGroup $group)
    {
        $docTypes = $request->input('document_types') ?: [
            'brd', 'flow_diagram', 'sql_logic', 'business_rules', 'validation_rules', 'test_cases', 'checklist',
        ];

        $requirements = Requirement::query()
            ->where('group_id', $group->id)
            ->with(['analyses'])
            ->get();

        $total     = 0;
        $generated = 0;
        $failed    = 0;
        $errors    = [];

        foreach ($requirements as $req) {
            foreach ($docTypes as $docType) {
                $analysis = $req->analyses->firstWhere('document_type', $docType);
                if (!$analysis) {
                    continue;
                }

                $total++;
                try {
                    $this->aiGenerationService->generate($analysis, auth()->id());
                    $generated++;
                } catch (\Throwable $e) {
                    $failed++;
                    $errors[] = "[{$req->code}:{$docType}] " . $e->getMessage();
                }
            }
        }

        return ApiResponse::success([
            'total'     => $total,
            'generated' => $generated,
            'failed'    => $failed,
            'errors'    => $errors,
        ], "Sinh hàng loạt hoàn tất: {$generated}/{$total} thành công.");
    }
}
