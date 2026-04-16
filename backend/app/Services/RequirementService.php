<?php

namespace App\Services;

use App\Models\Requirement;
use App\Repositories\RequirementGroupRepository;
use App\Repositories\RequirementRepository;

class RequirementService
{
    public function __construct(
        private readonly RequirementRepository $requirementRepository,
        private readonly RequirementGroupRepository $groupRepository,
    ) {
    }

    public function list(int $projectId, array $filters = []): array
    {
        return $this->requirementRepository->listByProject($projectId, $filters)
            ->map(fn (Requirement $req) => $this->toArray($req))
            ->values()
            ->all();
    }

    public function create(array $payload): Requirement
    {
        // Tự động sinh mã yêu cầu nếu chưa có
        if (empty($payload['code'])) {
            $payload['code'] = $this->generateCode(
                $payload['project_id'],
                $payload['group_id'] ?? null
            );
        }

        return $this->requirementRepository->create($payload);
    }

    public function update(Requirement $req, array $payload): Requirement
    {
        $this->requirementRepository->update($req, $payload);
        $req->refresh();
        $req->load(['group', 'documents', 'analyses', 'attachments', 'createdBy']);

        return $req;
    }

    public function delete(Requirement $req): bool
    {
        return $this->requirementRepository->delete($req);
    }

    public function moveGroup(Requirement $req, array $payload): Requirement
    {
        $newGroupId = $payload['group_id'] ?? null;
        $sortOrder  = $payload['sort_order'] ?? null;
        $oldGroupId = $req->group_id;

        $updatePayload = ['group_id' => $newGroupId];

        if ($sortOrder !== null) {
            $updatePayload['sort_order'] = (int) $sortOrder;
        }

        // Tái tạo mã yêu cầu nếu nhóm thay đổi
        if ($oldGroupId !== $newGroupId) {
            $newCode = $this->generateCode($req->project_id, $newGroupId);
            if ($newCode !== null) {
                $updatePayload['code'] = $newCode;
            }
        }

        $this->requirementRepository->update($req, $updatePayload);
        $req->refresh();
        $req->load(['group', 'documents', 'analyses', 'attachments', 'createdBy']);

        return $req;
    }

    public function toArray(Requirement $req): array
    {
        $group = $req->relationLoaded('group') ? $req->group : null;

        return [
            'id'                  => $req->id,
            'project_id'          => $req->project_id,
            'group_id'            => $req->group_id,
            'code'                => $req->code,
            'title'               => $req->title,
            'raw_content'         => $req->raw_content,
            'screens'             => $req->screens ?? [],
            'tags'                => $req->tags ?? [],
            'status'              => $req->status,
            'priority'            => $req->priority,
            'sort_order'          => $req->sort_order,
            'group'               => $group ? [
                'id'     => $group->id,
                'name'   => $group->name,
                'prefix' => $group->prefix,
            ] : null,
            'documents_count'     => $req->relationLoaded('documents') ? $req->documents->count() : 0,
            'analyses_count'      => $req->relationLoaded('analyses') ? $req->analyses->count() : 0,
            'attachments_count'   => $req->relationLoaded('attachments') ? $req->attachments->count() : 0,
            'created_by_name'     => $req->relationLoaded('createdBy') ? $req->createdBy?->name : null,
            'created_at'          => $req->created_at,
        ];
    }

    private function generateCode(int $projectId, ?int $groupId): ?string
    {
        if ($groupId === null) {
            return null;
        }

        $group = $this->groupRepository->findById($groupId);

        if (!$group || empty($group->prefix)) {
            return null;
        }

        $prefix = $group->prefix;
        $count  = $this->requirementRepository->countByGroupAndPrefix($projectId, $prefix);

        // Định dạng: PREFIX-001, PREFIX-002, ...
        return $prefix . '-' . str_pad((string) ($count + 1), 3, '0', STR_PAD_LEFT);
    }
}
