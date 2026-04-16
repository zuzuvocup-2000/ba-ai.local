<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentTemplateRequest;
use App\Http\Requests\UpdateDocumentTemplateRequest;
use App\Models\DocumentTemplate;
use App\Services\DocumentTemplateService;
use Illuminate\Http\Request;

class DocumentTemplateController extends Controller
{
    public function __construct(private readonly DocumentTemplateService $documentTemplateService)
    {
    }

    public function index(Request $request)
    {
        $projectId = $request->integer('project_id') ?: null;
        $templates = $this->documentTemplateService->list($projectId);

        return ApiResponse::success($templates, 'Lấy danh sách template thành công.');
    }

    public function store(StoreDocumentTemplateRequest $request)
    {
        $template = $this->documentTemplateService->create($request->validated());

        MongoLogHelper::action([
            'action'      => 'document_templates.create',
            'actor_id'    => request()->user()?->id,
            'template_id' => $template->id,
            'type'        => $template->type,
        ]);

        return ApiResponse::success($this->documentTemplateService->toArray($template), 'Tạo template thành công.', 201);
    }

    public function show(DocumentTemplate $template)
    {
        return ApiResponse::success($this->documentTemplateService->toArray($template), 'Lấy thông tin template thành công.');
    }

    public function update(UpdateDocumentTemplateRequest $request, DocumentTemplate $template)
    {
        $updatedTemplate = $this->documentTemplateService->update($template, $request->validated());

        MongoLogHelper::action([
            'action'      => 'document_templates.update',
            'actor_id'    => request()->user()?->id,
            'template_id' => $updatedTemplate->id,
            'type'        => $updatedTemplate->type,
        ]);

        return ApiResponse::success($this->documentTemplateService->toArray($updatedTemplate), 'Cập nhật template thành công.');
    }

    public function destroy(DocumentTemplate $template)
    {
        $this->documentTemplateService->delete($template);

        MongoLogHelper::action([
            'action'      => 'document_templates.delete',
            'actor_id'    => request()->user()?->id,
            'template_id' => $template->id,
            'type'        => $template->type,
        ]);

        return ApiResponse::success(null, 'Xóa template thành công.');
    }

    public function setDefault(DocumentTemplate $template)
    {
        $updatedTemplate = $this->documentTemplateService->setDefault($template);

        MongoLogHelper::action([
            'action'      => 'document_templates.set_default',
            'actor_id'    => request()->user()?->id,
            'template_id' => $updatedTemplate->id,
            'type'        => $updatedTemplate->type,
        ]);

        return ApiResponse::success($this->documentTemplateService->toArray($updatedTemplate), 'Đặt template mặc định thành công.');
    }
}
