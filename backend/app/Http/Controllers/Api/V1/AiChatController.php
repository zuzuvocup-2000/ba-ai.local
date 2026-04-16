<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChatDocumentRequest;
use App\Models\Document;
use App\Services\AiChatService;

class AiChatController extends Controller
{
    public function __construct(private readonly AiChatService $aiChatService) {}

    public function chat(ChatDocumentRequest $request, Document $document)
    {
        $conversationId   = $request->input('conversation_id') ?: uniqid('chat_', true);
        $previousMessages = $request->input('previous_messages', []);

        try {
            $result = $this->aiChatService->chat(
                $document,
                $request->input('message'),
                $conversationId,
                $previousMessages,
                auth()->id()
            );
        } catch (\RuntimeException $e) {
            return ApiResponse::error($e->getMessage(), 502);
        }

        return ApiResponse::success($result, 'Trả lời thành công.');
    }
}
