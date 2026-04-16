<?php

namespace App\AI;

use App\Repositories\SettingRepository;
use Illuminate\Support\Facades\Http;

class ClaudeClient
{
    private const API_URL = 'https://api.anthropic.com/v1/messages';
    private const ANTHROPIC_VERSION = '2023-06-01';
    private const DEFAULT_MODEL = 'claude-sonnet-4-6';
    private const DEFAULT_MAX_TOKENS = 8000;

    public function __construct(private readonly SettingRepository $settingRepository)
    {
    }

    /**
     * @return array{content: string, input_tokens: int, output_tokens: int, model: string, duration_ms: int}
     * @throws \RuntimeException
     */
    public function generate(string $systemPrompt, string $userPrompt): array
    {
        $apiKey = $this->settingRepository->findByKey('ai_api_key')?->value ?? '';
        if (empty($apiKey)) {
            throw new \RuntimeException('API key AI chưa được cấu hình. Vui lòng vào Settings → AI để thiết lập.');
        }

        $model     = $this->settingRepository->findByKey('ai_model')?->value ?: self::DEFAULT_MODEL;
        $maxTokens = (int) ($this->settingRepository->findByKey('ai_max_tokens')?->value ?? self::DEFAULT_MAX_TOKENS);

        $startMs = (int) round(microtime(true) * 1000);

        $response = Http::withHeaders([
            'x-api-key'         => $apiKey,
            'anthropic-version' => self::ANTHROPIC_VERSION,
            'content-type'      => 'application/json',
        ])->timeout(120)->post(self::API_URL, [
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'system'     => $systemPrompt,
            'messages'   => [
                ['role' => 'user', 'content' => $userPrompt],
            ],
        ]);

        $durationMs = (int) round(microtime(true) * 1000) - $startMs;

        if ($response->failed()) {
            $errorBody = $response->json('error.message') ?? $response->body();
            throw new \RuntimeException("Anthropic API lỗi [{$response->status()}]: {$errorBody}");
        }

        $json = $response->json();

        return [
            'content'       => $json['content'][0]['text'] ?? '',
            'input_tokens'  => $json['usage']['input_tokens'] ?? 0,
            'output_tokens' => $json['usage']['output_tokens'] ?? 0,
            'model'         => $json['model'] ?? $model,
            'duration_ms'   => $durationMs,
        ];
    }
}
