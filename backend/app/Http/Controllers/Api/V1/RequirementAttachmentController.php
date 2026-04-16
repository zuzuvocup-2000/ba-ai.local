<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRequirementAttachmentRequest;
use App\Models\Requirement;
use App\Models\RequirementAttachment;
use App\Services\RequirementAttachmentService;

class RequirementAttachmentController extends Controller
{
    public function __construct(private readonly RequirementAttachmentService $attachmentService) {}

    public function index(Requirement $requirement)
    {
        return ApiResponse::success(
            $this->attachmentService->list($requirement),
            'Lấy danh sách tài liệu đính kèm thành công.'
        );
    }

    public function store(StoreRequirementAttachmentRequest $request, Requirement $requirement)
    {
        $attachment = $this->attachmentService->upload(
            $requirement,
            $request->file('file'),
            auth()->id()
        );

        return ApiResponse::success(
            $this->attachmentService->toArray($attachment),
            'Tải lên tài liệu thành công.',
            201
        );
    }

    public function destroy(Requirement $requirement, RequirementAttachment $attachment)
    {
        if ($attachment->requirement_id !== $requirement->id) {
            return ApiResponse::error('Tài liệu không thuộc yêu cầu này.', 404);
        }

        $this->attachmentService->delete($attachment);

        return ApiResponse::success(null, 'Xóa tài liệu thành công.');
    }
}
