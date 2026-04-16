<?php

namespace App\Repositories;

use App\Models\RequirementAnalysis;
use Illuminate\Database\Eloquent\Collection;

class RequirementAnalysisRepository
{
    public function findByRequirementAndType(int $requirementId, string $documentType): ?RequirementAnalysis
    {
        return RequirementAnalysis::query()
            ->where('requirement_id', $requirementId)
            ->where('document_type', $documentType)
            ->first();
    }

    public function listByRequirement(int $requirementId): Collection
    {
        return RequirementAnalysis::query()
            ->where('requirement_id', $requirementId)
            ->get();
    }

    public function create(array $payload): RequirementAnalysis
    {
        return RequirementAnalysis::query()->create($payload);
    }

    public function update(RequirementAnalysis $analysis, array $payload): bool
    {
        return $analysis->update($payload);
    }

    public function delete(RequirementAnalysis $analysis): bool
    {
        return (bool) $analysis->delete();
    }
}
