<?php

namespace App\Repositories;

use App\Models\Requirement;
use Illuminate\Database\Eloquent\Collection;

class RequirementRepository
{
    public function listByProject(int $projectId, array $filters = []): Collection
    {
        $query = Requirement::query()
            ->with(['group', 'documents', 'analyses'])
            ->where('project_id', $projectId);

        if (!empty($filters['group_id'])) {
            $query->where('group_id', $filters['group_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('group_id')->orderBy('sort_order')->get();
    }

    public function findById(int $id): ?Requirement
    {
        return Requirement::query()
            ->with(['group', 'documents', 'analyses', 'createdBy'])
            ->find($id);
    }

    public function create(array $payload): Requirement
    {
        return Requirement::query()->create($payload);
    }

    public function update(Requirement $req, array $payload): bool
    {
        return $req->update($payload);
    }

    public function delete(Requirement $req): bool
    {
        return (bool) $req->delete();
    }

    public function countByGroupAndPrefix(int $projectId, string $prefix): int
    {
        return Requirement::query()
            ->where('project_id', $projectId)
            ->where('code', 'like', $prefix . '-%')
            ->count();
    }

    public function getSiblingTitles(int $groupId, int $excludeId): array
    {
        return Requirement::query()
            ->where('group_id', $groupId)
            ->where('id', '!=', $excludeId)
            ->pluck('title')
            ->all();
    }
}
