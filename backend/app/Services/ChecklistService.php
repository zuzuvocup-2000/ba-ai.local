<?php
namespace App\Services;

use App\AI\ClaudeClient;
use App\Models\ChecklistItem;
use App\Models\ChecklistItemComment;
use App\Models\Document;
use App\Models\DocumentChecklist;

class ChecklistService
{
    public function __construct(
        private readonly ClaudeClient $claudeClient,
        private readonly MongoLogService $mongoLogService,
    ) {}

    /** AI-generate checklist items for a document */
    public function generateChecklist(Document $doc, int $userId): DocumentChecklist
    {
        // Build prompt asking for structured JSON checklist items
        $systemPrompt = <<<SYSTEM
Bạn là Business Analyst cấp cao. Nhiệm vụ là tạo danh sách checklist triển khai cho tài liệu nghiệp vụ.
Trả về JSON hợp lệ (không có markdown, không có giải thích). Format:
{
  "items": [
    {
      "code": "CL-API-01",
      "category": "api",
      "title": "Tiêu đề ngắn gọn",
      "description": "Mô tả chi tiết DEV cần làm",
      "doc_section_ref": "Mục X.Y trong tài liệu"
    }
  ]
}
Các category hợp lệ: api, validation, business_rules, database, test, security, documentation
SYSTEM;

        $userPrompt = <<<PROMPT
Tạo checklist triển khai cho tài liệu sau. Mỗi item là một hạng mục DEV cần implement và chứng minh.

Loại tài liệu: {$doc->type}
Tiêu đề: {$doc->title}

Nội dung tài liệu:
{$doc->content}

Tạo 5-15 checklist items cụ thể, có thể đo lường được. CHỈ trả về JSON.
PROMPT;

        $result = $this->claudeClient->generate($systemPrompt, $userPrompt);

        $this->mongoLogService->write('checklist_generation', [
            'document_id'   => $doc->id,
            'model'         => $result['model'],
            'tokens_input'  => $result['input_tokens'],
            'tokens_output' => $result['output_tokens'],
        ]);

        // Parse JSON
        $content = trim($result['content']);
        $content = preg_replace('/^```(?:json)?\s*/m', '', $content);
        $content = preg_replace('/\s*```$/m', '', $content);
        $data = json_decode($content, true);
        $items = $data['items'] ?? [];

        // Create or update checklist
        $checklist = DocumentChecklist::updateOrCreate(
            ['document_id' => $doc->id],
            [
                'generated_by'   => 'ai',
                'status'         => 'active',
                'total_items'    => count($items),
                'verified_items' => 0,
                'created_by'     => $userId,
            ]
        );

        // Delete old items and recreate
        ChecklistItem::where('checklist_id', $checklist->id)->delete();

        foreach ($items as $i => $item) {
            ChecklistItem::create([
                'checklist_id'    => $checklist->id,
                'document_id'     => $doc->id,
                'code'            => $item['code'] ?? ('CL-' . str_pad((string)($i + 1), 2, '0', STR_PAD_LEFT)),
                'category'        => $item['category'] ?? 'general',
                'title'           => $item['title'] ?? '',
                'description'     => $item['description'] ?? null,
                'doc_section_ref' => $item['doc_section_ref'] ?? null,
                'dev_status'      => 'not_started',
                'review_status'   => 'pending',
                'sort_order'      => $i,
                'created_by'      => $userId,
            ]);
        }

        $checklist->refresh();
        return $checklist;
    }

    public function getByDocument(Document $doc): ?array
    {
        $checklist = DocumentChecklist::query()
            ->where('document_id', $doc->id)
            ->with(['items.assignedTo', 'items.reviewedBy', 'items.comments.createdBy'])
            ->first();

        if (!$checklist) {
            return null;
        }

        return $this->toArray($checklist);
    }

    public function updateItem(ChecklistItem $item, array $payload): ChecklistItem
    {
        $item->update($payload);
        $item->refresh();

        // Update verified_items count
        $checklist = $item->checklist;
        $verifiedCount = ChecklistItem::where('checklist_id', $checklist->id)
            ->where('review_status', 'approved')
            ->count();
        $checklist->update(['verified_items' => $verifiedCount]);

        return $item;
    }

    public function addComment(ChecklistItem $item, string $comment, string $type, int $userId): ChecklistItemComment
    {
        $commentRecord = ChecklistItemComment::create([
            'item_id'    => $item->id,
            'comment'    => $comment,
            'type'       => $type, // 'rejection', 'note', 'question'
            'created_by' => $userId,
        ]);

        return $commentRecord;
    }

    public function toArray(DocumentChecklist $checklist): array
    {
        return [
            'id'             => $checklist->id,
            'document_id'    => $checklist->document_id,
            'generated_by'   => $checklist->generated_by,
            'status'         => $checklist->status,
            'total_items'    => $checklist->total_items,
            'verified_items' => $checklist->verified_items,
            'items'          => $checklist->relationLoaded('items')
                ? $checklist->items->map(fn ($i) => $this->itemToArray($i))->values()->all()
                : [],
            'created_at'     => $checklist->created_at,
        ];
    }

    public function itemToArray(ChecklistItem $item): array
    {
        return [
            'id'               => $item->id,
            'code'             => $item->code,
            'category'         => $item->category,
            'title'            => $item->title,
            'description'      => $item->description,
            'doc_section_ref'  => $item->doc_section_ref,
            'dev_status'       => $item->dev_status,
            'assigned_to'      => $item->relationLoaded('assignedTo') ? $item->assignedTo?->name : null,
            'dev_proof'        => $item->dev_proof ?? [],
            'dev_submitted_at' => $item->dev_submitted_at,
            'review_status'    => $item->review_status,
            'reviewed_by'      => $item->relationLoaded('reviewedBy') ? $item->reviewedBy?->name : null,
            'reviewed_at'      => $item->reviewed_at,
            'sort_order'       => $item->sort_order,
            'comments'         => $item->relationLoaded('comments')
                ? $item->comments->map(fn ($c) => [
                    'id'         => $c->id,
                    'comment'    => $c->comment,
                    'type'       => $c->type,
                    'created_by' => $c->relationLoaded('createdBy') ? $c->createdBy?->name : null,
                    'created_at' => $c->created_at,
                ])->values()->all()
                : [],
        ];
    }
}
