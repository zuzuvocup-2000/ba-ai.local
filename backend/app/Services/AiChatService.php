<?php

namespace App\Services;

use App\AI\AiClientFactory;
use App\Models\Document;
use App\Models\DocumentChangeProposal;

class AiChatService
{
    public function __construct(
        private readonly AiClientFactory $aiClientFactory,
        private readonly MongoLogService $mongoLogService,
    ) {}

    /**
     * Multi-turn AI chat about a specific document.
     *
     * @param  array<int, array{role: string, content: string}>  $previousMessages
     * @return array{reply: string, proposal_id: int|null, proposed_content: string|null, conversation_id: string}
     */
    public function chat(
        Document $document,
        string $userMessage,
        string $conversationId,
        array $previousMessages,
        int $userId
    ): array {
        $systemPrompt = <<<SYSTEM
Bạn là Business Analyst cấp cao, hỗ trợ review và cải thiện tài liệu phân tích nghiệp vụ.
Tài liệu hiện tại đang được review:

---DOCUMENT START---
{$document->title}

{$document->content}
---DOCUMENT END---

Khi được yêu cầu chỉnh sửa tài liệu, hãy kết thúc phản hồi với đúng cú pháp sau (không thêm text sau [[PROPOSAL]]):
[[PROPOSAL]]
[Toàn bộ nội dung tài liệu đã sửa — đầy đủ, không tóm tắt]

Nếu chỉ trả lời câu hỏi hoặc giải thích (không đề xuất thay đổi), KHÔNG sử dụng [[PROPOSAL]].
SYSTEM;

        $messages = array_merge(
            $previousMessages,
            [['role' => 'user', 'content' => $userMessage]]
        );

        $result = $this->aiClientFactory->make()->generateMultiTurn($systemPrompt, $messages);
        $reply  = $result['content'];

        // Parse proposal marker
        $proposedContent = null;
        $replyText       = $reply;

        if (str_contains($reply, '[[PROPOSAL]]')) {
            $parts           = explode('[[PROPOSAL]]', $reply, 2);
            $replyText       = trim($parts[0]);
            $proposedContent = trim($parts[1] ?? '');

            if ($proposedContent === '') {
                $proposedContent = null;
            }
        }

        // Log to MongoDB
        $this->mongoLogService->write('chat_exchange', [
            'conversation_id' => $conversationId,
            'document_id'     => $document->id,
            'model'           => $result['model'],
            'user_message'    => $userMessage,
            'ai_response'     => $replyText,
            'has_proposal'    => ! is_null($proposedContent),
            'tokens_input'    => $result['input_tokens'],
            'tokens_output'   => $result['output_tokens'],
            'duration_ms'     => $result['duration_ms'],
        ]);

        // Create proposal record if AI suggested changes
        $proposalId = null;
        if (! is_null($proposedContent)) {
            $proposal = DocumentChangeProposal::create([
                'document_id'      => $document->id,
                'conversation_id'  => $conversationId,
                'proposed_content' => $proposedContent,
                'change_summary'   => mb_substr($replyText, 0, 490),
                'status'           => 'pending',
                'created_by'       => $userId,
            ]);
            $proposalId = $proposal->id;
        }

        return [
            'reply'            => $replyText,
            'conversation_id'  => $conversationId,
            'proposal_id'      => $proposalId,
            'proposed_content' => $proposedContent,
        ];
    }
}
