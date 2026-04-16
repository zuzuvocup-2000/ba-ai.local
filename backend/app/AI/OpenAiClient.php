<?php

namespace App\AI;

use App\Repositories\SettingRepository;
use Illuminate\Support\Facades\Http;

class OpenAiClient implements AiClientInterface
{
    private const API_URL = 'https://api.openai.com/v1/chat/completions';
    private const DEFAULT_MODEL = 'gpt-4o';
    private const DEFAULT_MAX_TOKENS = 8000;

    public function __construct(private readonly SettingRepository $settingRepository)
    {
    }

    /** @inheritDoc */
    public function generate(string $systemPrompt, string $userPrompt): array
    {
        return $this->call([
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user',   'content' => $userPrompt],
        ]);
    }

    /** @inheritDoc */
    public function generateMultiTurn(string $systemPrompt, array $messages): array
    {
        $full = array_merge(
            [['role' => 'system', 'content' => $systemPrompt]],
            $messages
        );

        return $this->call($full);
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{content: string, input_tokens: int, output_tokens: int, model: string, duration_ms: int}
     * @throws \RuntimeException
     */
    private function call(array $messages): array
    {
        $apiKey = $this->settingRepository->findByKey('openai_api_key')?->value ?? '';
        if (empty($apiKey)) {
            throw new \RuntimeException('OpenAI API key chưa được cấu hình. Vui lòng vào Settings → AI để thiết lập.');
        }

        $model     = $this->settingRepository->findByKey('openai_model')?->value ?: self::DEFAULT_MODEL;
        $maxTokens = (int) ($this->settingRepository->findByKey('ai_max_tokens')?->value ?? self::DEFAULT_MAX_TOKENS);

        $startMs = (int) round(microtime(true) * 1000);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(120)->post(self::API_URL, [
            'model'      => $model,
            'messages'   => $messages,
            'max_tokens' => $maxTokens,
        ]);

        $durationMs = (int) round(microtime(true) * 1000) - $startMs;

        if ($response->failed()) {
            $errorBody = $response->json('error.message') ?? $response->body();
            throw new \RuntimeException("OpenAI API lỗi [{$response->status()}]: {$errorBody}");
        }

        $json = $response->json();

        return [
            'content'       => $json['choices'][0]['message']['content'] ?? '',
            'input_tokens'  => $json['usage']['prompt_tokens'] ?? 0,
            'output_tokens' => $json['usage']['completion_tokens'] ?? 0,
            'model'         => $json['model'] ?? $model,
            'duration_ms'   => $durationMs,
        ];
    }
}
