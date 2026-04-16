<?php

namespace App\Repositories;

use App\Models\RequirementGroup;
use Illuminate\Database\Eloquent\Collection;

class RequirementGroupRepository
{
    public function listByProject(int $projectId): Collection
    {
        return RequirementGroup::query()
            ->with(['children', 'requirements'])
            ->where('project_id', $projectId)
            ->orderBy('sort_order')
            ->get();
    }

    public function getTree(int $projectId): Collection
    {
        return RequirementGroup::query()
            ->with(['children.requirements', 'requirements'])
            ->where('project_id', $projectId)
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();
    }

    public function findById(int $id): ?RequirementGroup
    {
        return RequirementGroup::query()
            ->with(['children', 'requirements'])
            ->find($id);
    }

    public function create(array $payload): RequirementGroup
    {
        return RequirementGroup::query()->create($payload);
    }

    public function update(RequirementGroup $group, array $payload): bool
    {
        return $group->update($payload);
    }

    public function delete(RequirementGroup $group): bool
    {
        return (bool) $group->delete();
    }

    public function getMaxSortOrder(int $projectId, ?int $parentId): int
    {
        $max = RequirementGroup::query()
            ->where('project_id', $projectId)
            ->where('parent_id', $parentId)
            ->max('sort_order');

        return (int) $max + 1;
    }
}
