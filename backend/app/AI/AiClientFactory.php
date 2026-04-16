<?php

namespace App\AI;

use App\Repositories\SettingRepository;

class AiClientFactory
{
    public function __construct(private readonly SettingRepository $settingRepository)
    {
    }

    /**
     * Returns the configured AI client based on the ai_provider setting.
     */
    public function make(): AiClientInterface
    {
        $provider = $this->settingRepository->findByKey('ai_provider')?->value ?? 'anthropic';

        return match ($provider) {
            'openai' => new OpenAiClient($this->settingRepository),
            default  => new ClaudeClient($this->settingRepository),
        };
    }
}
