<?php

namespace App\Services;

use App\Models\RequirementAnalysis;
use App\Repositories\RequirementAnalysisRepository;

class RequirementAnalysisService
{
    public function __construct(private readonly RequirementAnalysisRepository $analysisRepository)
    {
    }

    public function get(int $requirementId, string $documentType): ?RequirementAnalysis
    {
        return $this->analysisRepository->findByRequirementAndType($requirementId, $documentType);
    }

    public function listByRequirement(int $requirementId): array
    {
        return $this->analysisRepository->listByRequirement($requirementId)
            ->map(fn (RequirementAnalysis $analysis) => $this->toArray($analysis))
            ->values()
            ->all();
    }

    public function upsert(int $requirementId, string $documentType, array $payload): RequirementAnalysis
    {
        $existing = $this->analysisRepository->findByRequirementAndType($requirementId, $documentType);

        if ($existing) {
            $this->analysisRepository->update($existing, $payload);
            $existing->refresh();

            return $existing;
        }

        return $this->analysisRepository->create(array_merge($payload, [
            'requirement_id' => $requirementId,
            'document_type'  => $documentType,
        ]));
    }

    public function delete(RequirementAnalysis $analysis): bool
    {
        return $this->analysisRepository->delete($analysis);
    }

    public function toArray(RequirementAnalysis $analysis): array
    {
        return [
            'id'              => $analysis->id,
            'requirement_id'  => $analysis->requirement_id,
            'document_type'   => $analysis->document_type,
            'actors'          => $analysis->actors,
            'main_flow'       => $analysis->main_flow,
            'prefilled_by_ai' => $analysis->prefilled_by_ai,
            'prefilled_at'    => $analysis->prefilled_at,
            'created_at'      => $analysis->created_at,
            'updated_at'      => $analysis->updated_at,
        ];
    }
}
