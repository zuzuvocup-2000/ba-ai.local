<?php

namespace App\Services;

use App\Models\DocumentTemplate;
use App\Repositories\DocumentTemplateRepository;

class DocumentTemplateService
{
    public function __construct(private readonly DocumentTemplateRepository $templateRepository)
    {
    }

    public function list(?int $projectId = null): array
    {
        $global = $this->templateRepository->listGlobal()
            ->map(fn (DocumentTemplate $t) => $this->toArray($t))
            ->values()
            ->all();

        if ($projectId === null) {
            return $global;
        }

        $projectTemplates = $this->templateRepository->listByProject($projectId)
            ->map(fn (DocumentTemplate $t) => $this->toArray($t))
            ->values()
            ->all();

        return array_merge($global, $projectTemplates);
    }

    public function create(array $payload): DocumentTemplate
    {
        // Nếu đặt làm mặc định, xóa mặc định cũ cùng type và scope
        if (!empty($payload['is_default'])) {
            $this->templateRepository->clearDefaultForType(
                $payload['type'],
                $payload['project_id'] ?? null
            );
        }

        return $this->templateRepository->create($payload);
    }

    public function update(DocumentTemplate $template, array $payload): DocumentTemplate
    {
        // Nếu đang được đặt làm mặc định, xóa mặc định cũ cùng type và scope
        if (!empty($payload['is_default'])) {
            $projectId = $payload['project_id'] ?? $template->project_id;

            $this->templateRepository->clearDefaultForType(
                $payload['type'] ?? $template->type,
                $projectId,
                $template->id
            );
        }

        $this->templateRepository->update($template, $payload);
        $template->refresh();

        return $template;
    }

    public function delete(DocumentTemplate $template): bool
    {
        return $this->templateRepository->delete($template);
    }

    public function setDefault(DocumentTemplate $template): DocumentTemplate
    {
        // Xóa mặc định cũ của cùng type và scope, ngoại trừ template hiện tại
        $this->templateRepository->clearDefaultForType(
            $template->type,
            $template->project_id,
            $template->id
        );

        $this->templateRepository->update($template, ['is_default' => true]);
        $template->refresh();

        return $template;
    }

    public function resolveTemplate(string $type, ?int $projectId = null): ?DocumentTemplate
    {
        return $this->templateRepository->findDefault($type, $projectId);
    }

    public function toArray(DocumentTemplate $template): array
    {
        return [
            'id'           => $template->id,
            'type'         => $template->type,
            'name'         => $template->name,
            'description'  => $template->description,
            'content'      => $template->content,
            'placeholders' => $template->placeholders ?? [],
            'is_default'   => (bool) $template->is_default,
            'is_global'    => (bool) $template->is_global,
            'project_id'   => $template->project_id,
            'version'      => $template->version,
            'created_at'   => $template->created_at,
        ];
    }
}
