<?php

namespace App\Services;

use App\Models\RequirementGroup;
use App\Repositories\RequirementGroupRepository;
use Illuminate\Validation\ValidationException;

class RequirementGroupService
{
    public function __construct(private readonly RequirementGroupRepository $groupRepository)
    {
    }

    public function getTree(int $projectId): array
    {
        return $this->groupRepository->getTree($projectId)
            ->map(fn (RequirementGroup $group) => $this->toArray($group, true))
            ->values()
            ->all();
    }

    /**
     * @throws ValidationException
     */
    public function create(array $payload): RequirementGroup
    {
        $parentId = $payload['parent_id'] ?? null;

        // Kiểm tra độ sâu tối đa 2 cấp (parent không được có parent_id)
        if ($parentId !== null) {
            $parent = $this->groupRepository->findById($parentId);

            if ($parent && $parent->parent_id !== null) {
                throw ValidationException::withMessages([
                    'parent_id' => ['Chỉ cho phép tối đa 2 cấp nhóm yêu cầu. Không thể tạo nhóm con trong nhóm đã là con.'],
                ]);
            }
        }

        // Tự động tính sort_order cho nhóm mới
        $payload['sort_order'] = $this->groupRepository->getMaxSortOrder(
            $payload['project_id'],
            $parentId
        );

        return $this->groupRepository->create($payload);
    }

    public function update(RequirementGroup $group, array $payload): RequirementGroup
    {
        $this->groupRepository->update($group, $payload);
        $group->refresh();

        return $group;
    }

    public function delete(RequirementGroup $group): bool
    {
        $group->load('children');

        // Chuyển các nhóm con lên cấp cha của nhóm đang xóa
        if ($group->children->isNotEmpty()) {
            foreach ($group->children as $child) {
                $child->update(['parent_id' => $group->parent_id]);
            }
        }

        return $this->groupRepository->delete($group);
    }

    public function reorder(int $projectId, array $items): void
    {
        foreach ($items as $item) {
            RequirementGroup::query()
                ->where('id', $item['id'])
                ->where('project_id', $projectId)
                ->update(['sort_order' => $item['sort_order']]);
        }
    }

    public function toArray(RequirementGroup $group, bool $withChildren = true): array
    {
        $data = [
            'id'                 => $group->id,
            'project_id'         => $group->project_id,
            'parent_id'          => $group->parent_id,
            'name'               => $group->name,
            'description'        => $group->description,
            'prefix'             => $group->prefix,
            'color'              => $group->color,
            'icon'               => $group->icon,
            'sort_order'         => $group->sort_order,
            'requirements_count' => $group->requirements ? $group->requirements->count() : 0,
        ];

        if ($withChildren) {
            $data['children'] = $group->relationLoaded('children')
                ? $group->children
                    ->map(fn (RequirementGroup $child) => $this->toArray($child, true))
                    ->values()
                    ->all()
                : [];
        }

        return $data;
    }
}
