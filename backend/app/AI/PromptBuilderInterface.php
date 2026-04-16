<?php

namespace App\AI;

use App\Models\Requirement;
use App\Models\RequirementAnalysis;

interface PromptBuilderInterface
{
    public function systemPrompt(): string;
    public function userPrompt(RequirementAnalysis $analysis, Requirement $requirement): string;
    public function documentTitle(Requirement $requirement): string;
}
