<?php

namespace App\Repositories;

use App\Models\DocumentTemplate;
use Illuminate\Database\Eloquent\Collection;

class DocumentTemplateRepository
{
    public function listGlobal(): Collection
    {
        return DocumentTemplate::query()
            ->where('is_global', true)
            ->orderBy('type')
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();
    }

    public function listByProject(int $projectId): Collection
    {
        return DocumentTemplate::query()
            ->where('project_id', $projectId)
            ->orderBy('type')
            ->orderBy('name')
            ->get();
    }

    public function findDefault(string $type, ?int $projectId = null): ?DocumentTemplate
    {
        // Ưu tiên 1: template mặc định theo project
        if ($projectId !== null) {
            $template = DocumentTemplate::query()
                ->where('type', $type)
                ->where('project_id', $projectId)
                ->where('is_default', true)
                ->first();

            if ($template) {
                return $template;
            }
        }

        // Ưu tiên 2: template mặc định toàn cục
        $template = DocumentTemplate::query()
            ->where('type', $type)
            ->where('is_global', true)
            ->where('is_default', true)
            ->first();

        if ($template) {
            return $template;
        }

        // Ưu tiên 3: bất kỳ template nào khớp type
        return DocumentTemplate::query()
            ->where('type', $type)
            ->where(function ($query) use ($projectId) {
                $query->where('is_global', true);
                if ($projectId !== null) {
                    $query->orWhere('project_id', $projectId);
                }
            })
            ->first();
    }

    public function findById(int $id): ?DocumentTemplate
    {
        return DocumentTemplate::query()->find($id);
    }

    public function create(array $payload): DocumentTemplate
    {
        return DocumentTemplate::query()->create($payload);
    }

    public function update(DocumentTemplate $template, array $payload): bool
    {
        return $template->update($payload);
    }

    public function delete(DocumentTemplate $template): bool
    {
        return (bool) $template->delete();
    }

    public function clearDefaultForType(string $type, ?int $projectId, ?int $excludeId = null): void
    {
        $query = DocumentTemplate::query()
            ->where('type', $type)
            ->where('is_default', true);

        if ($projectId !== null) {
            $query->where('project_id', $projectId);
        } else {
            $query->where('is_global', true)->whereNull('project_id');
        }

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        $query->update(['is_default' => false]);
    }
}
