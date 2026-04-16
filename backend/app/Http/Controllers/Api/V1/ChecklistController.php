<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewChecklistItemRequest;
use App\Http\Requests\UpdateChecklistItemRequest;
use App\Models\ChecklistItem;
use App\Models\Document;
use App\Services\ChecklistService;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    public function __construct(
        private readonly ChecklistService $checklistService,
    ) {}

    /**
     * GET /user/documents/{document}/checklist
     */
    public function show(Document $document)
    {
        $data = $this->checklistService->getByDocument($document);

        if (!$data) {
            return ApiResponse::success(null, 'Tài liệu chưa có checklist.');
        }

        return ApiResponse::success($data, 'Lấy checklist thành công.');
    }

    /**
     * POST /user/documents/{document}/checklist/generate
     */
    public function generate(Document $document)
    {
        try {
            $checklist = $this->checklistService->generateChecklist($document, auth()->id());
        } catch (\RuntimeException $e) {
            return ApiResponse::error($e->getMessage(), 502);
        }

        MongoLogHelper::action([
            'action'      => 'checklist.generate',
            'actor_id'    => auth()->id(),
            'document_id' => $document->id,
            'checklist_id' => $checklist->id,
        ]);

        $checklist->load(['items.assignedTo', 'items.reviewedBy', 'items.comments.createdBy']);
        return ApiResponse::success($this->checklistService->toArray($checklist), 'Tạo checklist thành công.', 201);
    }

    /**
     * PUT /user/checklist-items/{item}
     */
    public function updateItem(UpdateChecklistItemRequest $request, ChecklistItem $item)
    {
        $payload = $request->validated();

        // Mark dev_submitted_at when transitioning to dev_done
        if (($payload['dev_status'] ?? null) === 'dev_done' && $item->dev_status !== 'dev_done') {
            $payload['dev_submitted_at'] = now();
        }

        $updated = $this->checklistService->updateItem($item, $payload);

        MongoLogHelper::action([
            'action'       => 'checklist.item.update',
            'actor_id'     => auth()->id(),
            'checklist_item_id' => $item->id,
            'document_id'  => $item->document_id,
        ]);

        return ApiResponse::success($this->checklistService->itemToArray($updated), 'Cập nhật checklist item thành công.');
    }

    /**
     * POST /user/checklist-items/{item}/review
     */
    public function reviewItem(ReviewChecklistItemRequest $request, ChecklistItem $item)
    {
        $validated = $request->validated();

        $payload = [
            'review_status' => $validated['review_status'],
            'reviewed_by'   => auth()->id(),
            'reviewed_at'   => now(),
        ];

        $updated = $this->checklistService->updateItem($item, $payload);

        // Add rejection comment if rejected
        if ($validated['review_status'] === 'rejected' && !empty($validated['comment'])) {
            $this->checklistService->addComment($item, $validated['comment'], 'rejection', auth()->id());
        } elseif (!empty($validated['comment'])) {
            $this->checklistService->addComment($item, $validated['comment'], 'note', auth()->id());
        }

        MongoLogHelper::action([
            'action'            => 'checklist.item.review',
            'actor_id'          => auth()->id(),
            'checklist_item_id' => $item->id,
            'review_status'     => $validated['review_status'],
            'document_id'       => $item->document_id,
        ]);

        return ApiResponse::success($this->checklistService->itemToArray($updated), 'Review checklist item thành công.');
    }

    /**
     * POST /user/checklist-items/{item}/comments
     */
    public function addComment(Request $request, ChecklistItem $item)
    {
        $request->validate([
            'comment' => ['required', 'string', 'max:2000'],
            'type'    => ['nullable', 'string', 'in:rejection,note,question'],
        ]);

        $comment = $this->checklistService->addComment(
            $item,
            $request->input('comment'),
            $request->input('type', 'note'),
            auth()->id()
        );

        MongoLogHelper::action([
            'action'            => 'checklist.item.comment',
            'actor_id'          => auth()->id(),
            'checklist_item_id' => $item->id,
            'document_id'       => $item->document_id,
        ]);

        return ApiResponse::success([
            'id'         => $comment->id,
            'comment'    => $comment->comment,
            'type'       => $comment->type,
            'created_at' => $comment->created_at,
        ], 'Thêm comment thành công.', 201);
    }
}
