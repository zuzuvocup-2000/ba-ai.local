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
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(private readonly ProjectService $projectService)
    {
    }

    public function index()
    {
        return ApiResponse::success($this->projectService->list(), 'Lấy danh sách dự án thành công.');
    }

    public function show(Project $project)
    {
        $project->loadMissing('members.roles');

        return ApiResponse::success($this->projectService->toArray($project), 'Lấy thông tin dự án thành công.');
    }

    public function updateCommonInfo(Request $request, Project $project)
    {
        $payload = $request->validate([
            'roles'                    => 'nullable|array',
            'roles.*.name'             => 'required|string|max:100',
            'roles.*.description'      => 'nullable|string|max:500',
            'common_info'              => 'nullable|array',
            'common_info.tech_stack'   => 'nullable|string',
            'common_info.database'     => 'nullable|string',
            'common_info.naming'       => 'nullable|string',
            'common_info.common_rules' => 'nullable|string',
            'common_info.notes'        => 'nullable|string',
        ]);

        $updated = $this->projectService->updateCommonInfo($project, $payload);

        MongoLogHelper::action([
            'action'     => 'projects.common_info.update',
            'actor_id'   => request()->user()?->id,
            'project_id' => $project->id,
        ]);

        return ApiResponse::success($this->projectService->toArray($updated), 'Cập nhật thông tin chung dự án thành công.');
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
        $updatedProject = $this->projectService->updateMembers($project, $request->validated()['member_assignments']);

        MongoLogHelper::action([
            'action' => 'projects.members.sync',
            'actor_id' => request()->user()?->id,
            'project_id' => $updatedProject->id,
            'member_count' => count($request->validated()['member_assignments']),
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

