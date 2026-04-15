<?php

namespace App\Repositories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;

class ProjectRepository
{
    public function listWithMembers(): Collection
    {
        return Project::query()
            ->with('members.roles')
            ->orderBy('id')
            ->get();
    }

    public function create(array $payload): Project
    {
        return Project::query()->create($payload);
    }

    public function update(Project $project, array $payload): bool
    {
        return $project->update($payload);
    }

    public function delete(Project $project): bool
    {
        return (bool) $project->delete();
    }
}

