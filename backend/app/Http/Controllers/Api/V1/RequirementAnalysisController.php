<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Helpers\MongoLogHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpsertRequirementAnalysisRequest;
use App\Models\RequirementAnalysis;
use App\Services\AiGenerationService;
use App\Services\RequirementAnalysisService;
use Illuminate\Http\Request;

class RequirementAnalysisController extends Controller
{
    public function __construct(
        private readonly RequirementAnalysisService $requirementAnalysisService,
        private readonly AiGenerationService $aiGenerationService,
    ) {
    }

    public function index(Request $request)
    {
        $request->validate([
            'requirement_id' => ['required', 'integer', 'exists:requirements,id'],
        ]);

        $analyses = $this->requirementAnalysisService->listByRequirement($request->integer('requirement_id'));

        return ApiResponse::success($analyses, 'Lấy danh sách phân tích yêu cầu thành công.');
    }

    public function show(RequirementAnalysis $analysis)
    {
        return ApiResponse::success($this->requirementAnalysisService->toArray($analysis), 'Lấy thông tin phân tích yêu cầu thành công.');
    }

    public function upsert(UpsertRequirementAnalysisRequest $request)
    {
        $analysis = $this->requirementAnalysisService->upsert($request->validated());

        MongoLogHelper::action([
            'action'          => 'requirement_analyses.upsert',
            'actor_id'        => request()->user()?->id,
            'analysis_id'     => $analysis->id,
            'requirement_id'  => $analysis->requirement_id,
            'document_type'   => $analysis->document_type,
        ]);

        return ApiResponse::success($this->requirementAnalysisService->toArray($analysis), 'Lưu phân tích yêu cầu thành công.');
    }

    public function destroy(RequirementAnalysis $analysis)
    {
        $this->requirementAnalysisService->delete($analysis);

        MongoLogHelper::action([
            'action'         => 'requirement_analyses.delete',
            'actor_id'       => request()->user()?->id,
            'analysis_id'    => $analysis->id,
            'requirement_id' => $analysis->requirement_id,
        ]);

        return ApiResponse::success(null, 'Xóa phân tích yêu cầu thành công.');
    }

    public function prefill(Request $request)
    {
        $request->validate([
            'requirement_id' => ['required', 'integer', 'exists:requirements,id'],
            'document_type'  => ['required', 'string', 'in:brd,flow_diagram,sql_logic,business_rules,validation_rules,test_cases,checklist'],
        ]);

        $requirement = \App\Models\Requirement::findOrFail($request->integer('requirement_id'));

        try {
            $prefilled = $this->aiGenerationService->prefillAnalysis(
                $requirement,
                $request->input('document_type'),
                auth()->id()
            );
        } catch (\RuntimeException $e) {
            return ApiResponse::error($e->getMessage(), 502);
        }

        return ApiResponse::success($prefilled, 'AI đã phân tích và điền sẵn form. Vui lòng kiểm tra và xác nhận trước khi lưu.');
    }
}
