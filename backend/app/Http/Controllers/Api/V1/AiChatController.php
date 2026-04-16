<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\AiChatService;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    public function __construct(private readonly AiChatService $aiChatService) {}

    public function chat(Request $request, Document $document)
    {
        $request->validate([
            'message'                     => ['required', 'string', 'max:5000'],
            'conversation_id'             => ['nullable', 'string', 'max:64'],
            'previous_messages'           => ['nullable', 'array', 'max:50'],
            'previous_messages.*.role'    => ['required', 'string', 'in:user,assistant'],
            'previous_messages.*.content' => ['required', 'string'],
        ]);

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

        return ApiResponse::success($result, 'OK');
    }
}
