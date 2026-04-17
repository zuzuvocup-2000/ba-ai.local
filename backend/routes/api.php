<?php

use App\Http\Controllers\Api\V1\AiChatController;
use App\Http\Controllers\Api\V1\DocumentLineCommentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChecklistController;
use App\Http\Controllers\Api\V1\DocumentChangeProposalController;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\DocumentReviewController;
use App\Http\Controllers\Api\V1\DocumentTemplateController;
use App\Http\Controllers\Api\V1\DocumentVersionController;
use App\Http\Controllers\Api\V1\LogController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\RequirementAnalysisController;
use App\Http\Controllers\Api\V1\RequirementAttachmentController;
use App\Http\Controllers\Api\V1\RequirementController;
use App\Http\Controllers\Api\V1\RequirementGroupController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::prefix('auth')->group(function () {
            Route::post('/login', [AuthController::class, 'login']);

            Route::middleware('auth.token')->group(function () {
                Route::get('/me', [AuthController::class, 'me']);
                Route::post('/logout', [AuthController::class, 'logout']);
                Route::put('/change-password', [AuthController::class, 'changePassword']);
            });
        });

        Route::middleware('auth.token')->group(function () {
            Route::get('/roles', [RoleController::class, 'index'])
                ->defaults('permission', 'roles.view')
                ->middleware('permission');
            Route::get('/roles/permissions', [RoleController::class, 'permissions'])
                ->defaults('permission', 'roles.view')
                ->middleware('permission');
            Route::put('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])
                ->defaults('permission', 'roles.edit')
                ->middleware('permission');

            Route::get('/settings', [SettingController::class, 'index'])
                ->defaults('permission', 'settings.view')
                ->middleware('permission');

            Route::get('/settings/resolve', [SettingController::class, 'resolve'])
                ->defaults('permission', 'settings.view')
                ->middleware('permission');

            Route::put('/settings', [SettingController::class, 'updateMany'])
                ->defaults('permission', 'settings.edit')
                ->middleware('permission');

            Route::get('/logs/{type}', [LogController::class, 'index'])
                ->defaults('permission', 'logs.view')
                ->middleware('permission');

            Route::get('/users', [UserController::class, 'index'])
                ->defaults('permission', 'users.view')
                ->middleware('permission');

            Route::post('/users', [UserController::class, 'store'])
                ->defaults('permission', 'users.create')
                ->middleware('permission');

            Route::put('/users/{user}', [UserController::class, 'update'])
                ->defaults('permission', 'users.edit')
                ->middleware('permission');

            Route::delete('/users/{user}', [UserController::class, 'destroy'])
                ->defaults('permission', 'users.delete')
                ->middleware('permission');

            Route::get('/projects', [ProjectController::class, 'index'])
                ->defaults('permission', 'projects.view')
                ->middleware('permission');

            Route::post('/projects', [ProjectController::class, 'store'])
                ->defaults('permission', 'projects.create')
                ->middleware('permission');

            Route::put('/projects/{project}', [ProjectController::class, 'update'])
                ->defaults('permission', 'projects.edit')
                ->middleware('permission');

            Route::put('/projects/{project}/members', [ProjectController::class, 'syncMembers'])
                ->defaults('permission', 'projects.edit')
                ->middleware('permission');

            Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])
                ->defaults('permission', 'projects.delete')
                ->middleware('permission');

            // Document Templates
            Route::get('/templates', [DocumentTemplateController::class, 'index'])
                ->defaults('permission', 'templates.manage')
                ->middleware('permission');
            Route::post('/templates', [DocumentTemplateController::class, 'store'])
                ->defaults('permission', 'templates.manage')
                ->middleware('permission');
            Route::get('/templates/{template}', [DocumentTemplateController::class, 'show'])
                ->defaults('permission', 'templates.manage')
                ->middleware('permission');
            Route::put('/templates/{template}', [DocumentTemplateController::class, 'update'])
                ->defaults('permission', 'templates.manage')
                ->middleware('permission');
            Route::delete('/templates/{template}', [DocumentTemplateController::class, 'destroy'])
                ->defaults('permission', 'templates.manage')
                ->middleware('permission');
            Route::post('/templates/{template}/set-default', [DocumentTemplateController::class, 'setDefault'])
                ->defaults('permission', 'templates.manage')
                ->middleware('permission');
        });
    });

    Route::prefix('user')->group(function () {
        Route::prefix('auth')->group(function () {
            Route::post('/login', [AuthController::class, 'login']);

            Route::middleware('auth.token')->group(function () {
                Route::get('/me', [AuthController::class, 'me']);
                Route::post('/logout', [AuthController::class, 'logout']);
                Route::put('/change-password', [AuthController::class, 'changePassword']);
            });
        });

        Route::middleware('auth.token')->group(function () {
            Route::get('/projects', [ProjectController::class, 'index'])
                ->defaults('permission', 'projects.view')
                ->middleware('permission');

            Route::get('/projects/{project}', [ProjectController::class, 'show'])
                ->defaults('permission', 'projects.view')
                ->middleware('permission');

            Route::put('/projects/{project}/common-info', [ProjectController::class, 'updateCommonInfo'])
                ->defaults('permission', 'projects.edit')
                ->middleware('permission');

            Route::post('/projects/{project}/generate-common-doc', [DocumentController::class, 'generateCommonDoc'])
                ->defaults('permission', 'documents.generate')
                ->middleware('permission');

            // Feature Groups
            Route::get('/groups', [RequirementGroupController::class, 'index'])
                ->defaults('permission', 'groups.view')
                ->middleware('permission');
            Route::post('/groups', [RequirementGroupController::class, 'store'])
                ->defaults('permission', 'groups.create')
                ->middleware('permission');
            Route::put('/groups/reorder', [RequirementGroupController::class, 'reorder'])
                ->defaults('permission', 'groups.edit')
                ->middleware('permission');
            Route::put('/groups/{group}', [RequirementGroupController::class, 'update'])
                ->defaults('permission', 'groups.edit')
                ->middleware('permission');
            Route::put('/groups/{group}/move', [RequirementGroupController::class, 'move'])
                ->defaults('permission', 'groups.edit')
                ->middleware('permission');
            Route::post('/groups/{group}/bulk-generate', [DocumentController::class, 'bulkGenerate'])
                ->defaults('permission', 'groups.bulk_generate')
                ->middleware('permission');
            Route::delete('/groups/{group}', [RequirementGroupController::class, 'destroy'])
                ->defaults('permission', 'groups.delete')
                ->middleware('permission');

            // Requirements
            Route::get('/requirements', [RequirementController::class, 'index'])
                ->defaults('permission', 'requirements.view')
                ->middleware('permission');
            Route::post('/requirements', [RequirementController::class, 'store'])
                ->defaults('permission', 'requirements.create')
                ->middleware('permission');
            Route::get('/requirements/{requirement}', [RequirementController::class, 'show'])
                ->defaults('permission', 'requirements.view')
                ->middleware('permission');
            Route::put('/requirements/{requirement}', [RequirementController::class, 'update'])
                ->defaults('permission', 'requirements.edit')
                ->middleware('permission');
            Route::delete('/requirements/{requirement}', [RequirementController::class, 'destroy'])
                ->defaults('permission', 'requirements.delete')
                ->middleware('permission');
            Route::put('/requirements/{requirement}/move-group', [RequirementController::class, 'moveGroup'])
                ->defaults('permission', 'requirements.edit')
                ->middleware('permission');

            Route::post('/requirements/{requirement}/generate-all', [DocumentController::class, 'generateAll'])
                ->defaults('permission', 'documents.generate')
                ->middleware('permission');

            // Requirement Attachments
            Route::get('/requirements/{requirement}/attachments', [RequirementAttachmentController::class, 'index'])
                ->defaults('permission', 'requirements.view')
                ->middleware('permission');
            Route::post('/requirements/{requirement}/attachments', [RequirementAttachmentController::class, 'store'])
                ->defaults('permission', 'requirements.edit')
                ->middleware('permission');
            Route::delete('/requirements/{requirement}/attachments/{attachment}', [RequirementAttachmentController::class, 'destroy'])
                ->defaults('permission', 'requirements.edit')
                ->middleware('permission');

            // Analyses
            Route::get('/analyses', [RequirementAnalysisController::class, 'index'])
                ->defaults('permission', 'requirements.view')
                ->middleware('permission');
            Route::post('/analyses/prefill', [RequirementAnalysisController::class, 'prefill'])
                ->defaults('permission', 'requirements.create')
                ->middleware('permission');
            Route::post('/analyses', [RequirementAnalysisController::class, 'upsert'])
                ->defaults('permission', 'requirements.create')
                ->middleware('permission');
            Route::get('/analyses/{analysis}', [RequirementAnalysisController::class, 'show'])
                ->defaults('permission', 'requirements.view')
                ->middleware('permission');
            Route::put('/analyses/{analysis}', [RequirementAnalysisController::class, 'upsert'])
                ->defaults('permission', 'requirements.edit')
                ->middleware('permission');
            Route::delete('/analyses/{analysis}', [RequirementAnalysisController::class, 'destroy'])
                ->defaults('permission', 'requirements.edit')
                ->middleware('permission');

            // Documents — static route before dynamic to avoid conflict
            Route::get('/documents', [DocumentController::class, 'index'])
                ->defaults('permission', 'documents.view')
                ->middleware('permission');
            Route::post('/documents/generate', [DocumentController::class, 'generate'])
                ->defaults('permission', 'documents.generate')
                ->middleware('permission');
            Route::get('/documents/{document}', [DocumentController::class, 'show'])
                ->defaults('permission', 'documents.view')
                ->middleware('permission');
            Route::put('/documents/{document}', [DocumentController::class, 'update'])
                ->defaults('permission', 'documents.edit')
                ->middleware('permission');
            Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])
                ->defaults('permission', 'documents.delete')
                ->middleware('permission');

            // Document Versions
            Route::get('/documents/{document}/versions', [DocumentVersionController::class, 'index'])
                ->defaults('permission', 'documents.view')->middleware('permission');
            Route::get('/documents/{document}/versions/{versionNumber}', [DocumentVersionController::class, 'show'])
                ->defaults('permission', 'documents.view')->middleware('permission');
            Route::post('/documents/{document}/versions/{versionNumber}/restore', [DocumentVersionController::class, 'restore'])
                ->defaults('permission', 'documents.edit')->middleware('permission');

            // AI Chat
            Route::post('/documents/{document}/chat', [AiChatController::class, 'chat'])
                ->defaults('permission', 'documents.view')->middleware('permission');

            // Change Proposals
            Route::get('/documents/{document}/proposals', [DocumentChangeProposalController::class, 'index'])
                ->defaults('permission', 'documents.view')->middleware('permission');
            Route::post('/documents/{document}/proposals/{proposal}/accept', [DocumentChangeProposalController::class, 'accept'])
                ->defaults('permission', 'documents.edit')->middleware('permission');
            Route::post('/documents/{document}/proposals/{proposal}/dismiss', [DocumentChangeProposalController::class, 'dismiss'])
                ->defaults('permission', 'documents.edit')->middleware('permission');

            // Document Reviews
            Route::get('/documents/{document}/reviews', [DocumentReviewController::class, 'index'])
                ->defaults('permission', 'documents.view')->middleware('permission');
            Route::post('/documents/{document}/submit-review', [DocumentReviewController::class, 'submitReview'])
                ->defaults('permission', 'documents.edit')->middleware('permission');
            Route::post('/documents/{document}/approve', [DocumentReviewController::class, 'approve'])
                ->defaults('permission', 'documents.approve')->middleware('permission');
            Route::post('/documents/{document}/reject', [DocumentReviewController::class, 'reject'])
                ->defaults('permission', 'documents.approve')->middleware('permission');

            // Checklists
            Route::get('/documents/{document}/checklist', [ChecklistController::class, 'show'])
                ->defaults('permission', 'documents.view')->middleware('permission');
            Route::post('/documents/{document}/checklist/generate', [ChecklistController::class, 'generate'])
                ->defaults('permission', 'checklist.review')->middleware('permission');

            // Checklist Items
            Route::put('/checklist-items/{item}', [ChecklistController::class, 'updateItem'])
                ->defaults('permission', 'checklist.submit')->middleware('permission');
            Route::post('/checklist-items/{item}/review', [ChecklistController::class, 'reviewItem'])
                ->defaults('permission', 'checklist.review')->middleware('permission');
            Route::post('/checklist-items/{item}/comments', [ChecklistController::class, 'addComment'])
                ->defaults('permission', 'documents.view')->middleware('permission');

            // Line Comments
            Route::get('/documents/{document}/line-comments', [DocumentLineCommentController::class, 'index'])
                ->defaults('permission', 'documents.view')->middleware('permission');
            Route::post('/documents/{document}/line-comments', [DocumentLineCommentController::class, 'store'])
                ->defaults('permission', 'documents.view')->middleware('permission');
            Route::post('/line-comments/{comment}/resolve', [DocumentLineCommentController::class, 'resolve'])
                ->defaults('permission', 'documents.view')->middleware('permission');
            Route::delete('/line-comments/{comment}', [DocumentLineCommentController::class, 'destroy'])
                ->defaults('permission', 'documents.view')->middleware('permission');
        });

        Route::get('/public/settings/resolve', [SettingController::class, 'resolve']);
    });
});

