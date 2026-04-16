<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\ListRequirementsRequest;
use App\Http\Requests\MoveRequirementGroupRequest;
use App\Http\Requests\StoreRequirementRequest;
use App\Http\Requests\UpdateRequirementRequest;
use App\Models\Requirement;
use App\Services\RequirementService;

class RequirementController extends Controller
{
    public function __construct(private readonly RequirementService $requirementService)
    {
    }

    public function index(ListRequirementsRequest $request)
    {
        $filters = $request->only(['group_id', 'status']);
        $requirements = $this->requirementService->list($request->integer('project_id'), $filters);

        return ApiResponse::success($requirements, 'Lấy danh sách yêu cầu thành công.');
    }

    public function store(StoreRequirementRequest $request)
    {
        $requirement = $this->requirementService->create($request->validated());

        MongoLogHelper::action([
            'action'          => 'requirements.create',
            'actor_id'        => request()->user()?->id,
            'requirement_id'  => $requirement->id,
            'project_id'      => $requirement->project_id,
        ]);

        return ApiResponse::success($this->requirementService->toArray($requirement), 'Tạo yêu cầu thành công.', 201);
    }

    public function show(Requirement $requirement)
    {
        return ApiResponse::success($this->requirementService->toArray($requirement), 'Lấy thông tin yêu cầu thành công.');
    }

    public function update(UpdateRequirementRequest $request, Requirement $requirement)
    {
        $updatedRequirement = $this->requirementService->update($requirement, $request->validated());

        MongoLogHelper::action([
            'action'         => 'requirements.update',
            'actor_id'       => request()->user()?->id,
            'requirement_id' => $updatedRequirement->id,
            'project_id'     => $updatedRequirement->project_id,
        ]);

        return ApiResponse::success($this->requirementService->toArray($updatedRequirement), 'Cập nhật yêu cầu thành công.');
    }

    public function destroy(Requirement $requirement)
    {
        $this->requirementService->delete($requirement);

        MongoLogHelper::action([
            'action'         => 'requirements.delete',
            'actor_id'       => request()->user()?->id,
            'requirement_id' => $requirement->id,
            'project_id'     => $requirement->project_id,
        ]);

        return ApiResponse::success(null, 'Xóa yêu cầu thành công.');
    }

    public function moveGroup(MoveRequirementGroupRequest $request, Requirement $requirement)
    {
        $updatedRequirement = $this->requirementService->moveGroup($requirement, $request->validated());

        MongoLogHelper::action([
            'action'         => 'requirements.move_group',
            'actor_id'       => request()->user()?->id,
            'requirement_id' => $updatedRequirement->id,
            'group_id'       => $request->input('group_id'),
        ]);

        return ApiResponse::success($this->requirementService->toArray($updatedRequirement), 'Di chuyển yêu cầu sang nhóm mới thành công.');
    }
}
