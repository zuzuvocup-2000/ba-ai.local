<?php

namespace App\AI;

interface AiClientInterface
{
    /**
     * Single-turn generation.
     *
     * @return array{content: string, input_tokens: int, output_tokens: int, model: string, duration_ms: int}
     * @throws \RuntimeException
     */
    public function generate(string $systemPrompt, string $userPrompt): array;

    /**
     * Multi-turn conversation.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{content: string, input_tokens: int, output_tokens: int, model: string, duration_ms: int}
     * @throws \RuntimeException
     */
    public function generateMultiTurn(string $systemPrompt, array $messages): array;
}
