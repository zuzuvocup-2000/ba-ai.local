<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\ListRequirementGroupsRequest;
use App\Http\Requests\MoveRequirementGroupParentRequest;
use App\Http\Requests\ReorderRequirementGroupsRequest;
use App\Http\Requests\StoreRequirementGroupRequest;
use App\Http\Requests\UpdateRequirementGroupRequest;
use App\Models\RequirementGroup;
use App\Services\RequirementGroupService;

class RequirementGroupController extends Controller
{
    public function __construct(private readonly RequirementGroupService $requirementGroupService)
    {
    }

    public function index(ListRequirementGroupsRequest $request)
    {
        $tree = $this->requirementGroupService->getTree($request->integer('project_id'));

        return ApiResponse::success($tree, 'Lấy danh sách nhóm yêu cầu thành công.');
    }

    public function store(StoreRequirementGroupRequest $request)
    {
        $group = $this->requirementGroupService->create($request->validated());

        MongoLogHelper::action([
            'action'     => 'requirement_groups.create',
            'actor_id'   => request()->user()?->id,
            'group_id'   => $group->id,
            'project_id' => $group->project_id,
        ]);

        return ApiResponse::success($this->requirementGroupService->toArray($group), 'Tạo nhóm yêu cầu thành công.', 201);
    }

    public function update(UpdateRequirementGroupRequest $request, RequirementGroup $group)
    {
        $updatedGroup = $this->requirementGroupService->update($group, $request->validated());

        MongoLogHelper::action([
            'action'     => 'requirement_groups.update',
            'actor_id'   => request()->user()?->id,
            'group_id'   => $updatedGroup->id,
            'project_id' => $updatedGroup->project_id,
        ]);

        return ApiResponse::success($this->requirementGroupService->toArray($updatedGroup), 'Cập nhật nhóm yêu cầu thành công.');
    }

    public function destroy(RequirementGroup $group)
    {
        $this->requirementGroupService->delete($group);

        MongoLogHelper::action([
            'action'     => 'requirement_groups.delete',
            'actor_id'   => request()->user()?->id,
            'group_id'   => $group->id,
            'project_id' => $group->project_id,
        ]);

        return ApiResponse::success(null, 'Xóa nhóm yêu cầu thành công.');
    }

    public function reorder(ReorderRequirementGroupsRequest $request)
    {
        $this->requirementGroupService->reorder($request->validated('items'));

        return ApiResponse::success(null, 'Sắp xếp nhóm yêu cầu thành công.');
    }

    public function move(MoveRequirementGroupParentRequest $request, RequirementGroup $group)
    {
        $updatedGroup = $this->requirementGroupService->update($group, [
            'parent_id' => $request->input('parent_id'),
        ]);

        MongoLogHelper::action([
            'action'     => 'requirement_groups.move',
            'actor_id'   => request()->user()?->id,
            'group_id'   => $updatedGroup->id,
            'parent_id'  => $request->input('parent_id'),
            'project_id' => $updatedGroup->project_id,
        ]);

        return ApiResponse::success($this->requirementGroupService->toArray($updatedGroup), 'Di chuyển nhóm yêu cầu thành công.');
    }
}
