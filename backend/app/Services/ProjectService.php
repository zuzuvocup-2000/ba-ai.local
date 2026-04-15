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

        $project->members()->sync($payload['member_ids'] ?? []);
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

        if (array_key_exists('member_ids', $payload)) {
            $project->members()->sync($payload['member_ids']);
        }

        $project->load('members.roles');

        return $project;
    }

    public function updateMembers(Project $project, array $memberIds): Project
    {
        $project->members()->sync($memberIds);
        $project->load('members.roles');

        return $project;
    }

    public function delete(Project $project): bool
    {
        return $this->projectRepository->delete($project);
    }

    public function toArray(Project $project): array
    {
        return [
            'id' => $project->id,
            'code' => $project->code,
            'name' => $project->name,
            'description' => $project->description,
            'status' => $project->status,
            'members' => $project->members
                ->map(fn (User $member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'role' => $member->roles->first()?->name,
                ])
                ->values()
                ->all(),
            'created_at' => $project->created_at,
        ];
    }
}

