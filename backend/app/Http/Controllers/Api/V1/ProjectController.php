<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\SyncProjectMembersRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Services\ProjectService;

class ProjectController extends Controller
{
    public function __construct(private readonly ProjectService $projectService)
    {
    }

    public function index()
    {
        return ApiResponse::success($this->projectService->list(), 'Lấy danh sách dự án thành công.');
    }

    public function store(StoreProjectRequest $request)
    {
        $project = $this->projectService->create($request->validated());

        MongoLogHelper::action([
            'action' => 'projects.create',
            'actor_id' => request()->user()?->id,
            'project_id' => $project->id,
        ]);

        return ApiResponse::success($this->projectService->toArray($project), 'Tạo dự án thành công.', 201);
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $updatedProject = $this->projectService->update($project, $request->validated());

        MongoLogHelper::action([
            'action' => 'projects.update',
            'actor_id' => request()->user()?->id,
            'project_id' => $updatedProject->id,
        ]);

        return ApiResponse::success($this->projectService->toArray($updatedProject), 'Cập nhật dự án thành công.');
    }

    public function syncMembers(SyncProjectMembersRequest $request, Project $project)
    {
        $updatedProject = $this->projectService->updateMembers($project, $request->validated()['member_ids']);

        MongoLogHelper::action([
            'action' => 'projects.members.sync',
            'actor_id' => request()->user()?->id,
            'project_id' => $updatedProject->id,
            'member_count' => count($request->validated()['member_ids']),
        ]);

        return ApiResponse::success($this->projectService->toArray($updatedProject), 'Cập nhật thành viên dự án thành công.');
    }

    public function destroy(Project $project)
    {
        $this->projectService->delete($project);

        MongoLogHelper::action([
            'action' => 'projects.delete',
            'actor_id' => request()->user()?->id,
            'project_id' => $project->id,
        ]);

        return ApiResponse::success(null, 'Xóa dự án thành công.');
    }
}

