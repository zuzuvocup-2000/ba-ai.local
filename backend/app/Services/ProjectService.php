<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use App\Repositories\ProjectRepository;

class ProjectService
{
    public function __construct(private readonly ProjectRepository $projectRepository)
    {
    }

    public function list(): array
    {
        return $this->projectRepository->listWithMembers()
            ->map(fn (Project $project) => $this->toArray($project))
            ->values()
            ->all();
    }

    public function create(array $payload): Project
    {
        $project = $this->projectRepository->create([
            'code' => $payload['code'],
            'name' => $payload['name'],
            'description' => $payload['description'] ?? null,
            'status' => $payload['status'] ?? 'planning',
        ]);

        $project->members()->sync($this->toSyncPayload($payload['member_assignments'] ?? []));
        $project->load('members.roles');

        return $project;
    }

    public function update(Project $project, array $payload): Project
    {
        $this->projectRepository->update($project, [
            'code' => $payload['code'],
            'name' => $payload['name'],
            'description' => $payload['description'] ?? null,
            'status' => $payload['status'],
        ]);

        if (array_key_exists('member_assignments', $payload)) {
            $project->members()->sync($this->toSyncPayload($payload['member_assignments']));
        }

        $project->load('members.roles');

        return $project;
    }

    public function updateMembers(Project $project, array $memberAssignments): Project
    {
        $project->members()->sync($this->toSyncPayload($memberAssignments));
        $project->load('members.roles');

        return $project;
    }

    public function delete(Project $project): bool
    {
        return $this->projectRepository->delete($project);
    }

    public function updateCommonInfo(Project $project, array $payload): Project
    {
        $project->update([
            'roles'       => $payload['roles'] ?? $project->roles,
            'common_info' => $payload['common_info'] ?? $project->common_info,
        ]);

        return $project->fresh();
    }

    public function toArray(Project $project): array
    {
        return [
            'id'          => $project->id,
            'code'        => $project->code,
            'name'        => $project->name,
            'description' => $project->description,
            'status'      => $project->status,
            'roles'       => $project->roles ?? [],
            'common_info' => $project->common_info ?? [],
            'members'     => $project->relationLoaded('members')
                ? $project->members
                    ->map(fn (User $member) => [
                        'id'           => $member->id,
                        'name'         => $member->name,
                        'email'        => $member->email,
                        'role'         => $member->roles->first()?->name,
                        'project_role' => $member->pivot?->project_role ?? 'dev',
                    ])
                    ->values()
                    ->all()
                : [],
            'created_at'  => $project->created_at,
        ];
    }

    private function toSyncPayload(array $memberAssignments): array
    {
        $syncPayload = [];
        foreach ($memberAssignments as $assignment) {
            $syncPayload[(int) $assignment['user_id']] = [
                'project_role' => $assignment['project_role'],
            ];
        }

        return $syncPayload;
    }
}

