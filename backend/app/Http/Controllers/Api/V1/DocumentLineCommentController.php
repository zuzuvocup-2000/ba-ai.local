<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentLineComment;
use Illuminate\Http\Request;

class DocumentLineCommentController extends Controller
{
    public function index(Document $document)
    {
        $comments = $document->lineComments()
            ->with(['author:id,name', 'resolvedBy:id,name'])
            ->orderBy('line_number')
            ->orderBy('created_at')
            ->get();

        return ApiResponse::success($comments, 'Lấy danh sách nhận xét thành công.');
    }

    public function store(Request $request, Document $document)
    {
        $validated = $request->validate([
            'line_number'  => 'required|integer|min:1',
            'line_snippet' => 'nullable|string|max:300',
            'content'      => 'required|string|max:2000',
            'comment_type' => 'nullable|in:issue,note,question',
        ]);

        $comment = $document->lineComments()->create([
            'line_number'  => $validated['line_number'],
            'line_snippet' => $validated['line_snippet'] ?? null,
            'content'      => $validated['content'],
            'comment_type' => $validated['comment_type'] ?? 'issue',
            'author_id'    => auth()->id(),
        ]);

        $comment->load(['author:id,name']);

        return ApiResponse::success($comment, 'Thêm nhận xét thành công.', 201);
    }

    public function resolve(DocumentLineComment $comment)
    {
        if ($comment->is_resolved) {
            return ApiResponse::error('Nhận xét này đã được giải quyết.', 422);
        }

        $comment->update([
            'is_resolved' => true,
            'resolved_by' => auth()->id(),
            'resolved_at' => now(),
        ]);

        $comment->load(['author:id,name', 'resolvedBy:id,name']);

        return ApiResponse::success($comment, 'Đánh dấu đã giải quyết thành công.');
    }

    public function destroy(DocumentLineComment $comment)
    {
        if ($comment->author_id !== auth()->id()) {
            return ApiResponse::error('Bạn không có quyền xóa nhận xét này.', 403);
        }

        $comment->delete();

        return ApiResponse::success(null, 'Xóa nhận xét thành công.');
    }
}
