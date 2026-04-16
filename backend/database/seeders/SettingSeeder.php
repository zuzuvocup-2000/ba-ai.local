<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            [
                'key' => 'app.brand_name',
                'name' => 'Brand Name',
                'value' => 'BA AI',
                'type' => 'string',
                'group' => 'branding',
                'description' => 'Application brand name',
                'is_public' => true,
                'sort_order' => 10,
            ],
            [
                'key' => 'app.support_email',
                'name' => 'Support Email',
                'value' => 'support@ba-ai.local',
                'type' => 'string',
                'group' => 'system',
                'description' => 'Support contact email',
                'is_public' => true,
                'sort_order' => 20,
            ],
            [
                'key' => 'auth.max_login_attempts',
                'name' => 'Max Login Attempts',
                'value' => '5',
                'type' => 'int',
                'group' => 'security',
                'description' => 'Maximum allowed login attempts before lock',
                'is_public' => false,
                'sort_order' => 30,
            ],

            // AI Settings
            [
                'key' => 'ai_provider',
                'name' => 'AI Provider',
                'value' => 'anthropic',
                'type' => 'string',
                'group' => 'ai',
                'description' => 'AI provider to use: anthropic or openai',
                'is_public' => false,
                'sort_order' => 95,
            ],
            [
                'key' => 'ai_api_key',
                'name' => 'Anthropic API Key',
                'value' => '',
                'type' => 'string',
                'group' => 'ai',
                'description' => 'Anthropic Claude API key (sk-ant-...)',
                'is_public' => false,
                'sort_order' => 100,
            ],
            [
                'key' => 'ai_model',
                'name' => 'Anthropic Model',
                'value' => 'claude-sonnet-4-6',
                'type' => 'string',
                'group' => 'ai',
                'description' => 'Anthropic Claude model name (e.g. claude-sonnet-4-6)',
                'is_public' => false,
                'sort_order' => 110,
            ],
            [
                'key' => 'openai_api_key',
                'name' => 'OpenAI API Key',
                'value' => '',
                'type' => 'string',
                'group' => 'ai',
                'description' => 'OpenAI API key (sk-...)',
                'is_public' => false,
                'sort_order' => 115,
            ],
            [
                'key' => 'openai_model',
                'name' => 'OpenAI Model',
                'value' => 'gpt-4o',
                'type' => 'string',
                'group' => 'ai',
                'description' => 'OpenAI model name (e.g. gpt-4o, gpt-4o-mini)',
                'is_public' => false,
                'sort_order' => 117,
            ],
            [
                'key' => 'ai_max_tokens',
                'name' => 'Max Tokens',
                'value' => '8000',
                'type' => 'int',
                'group' => 'ai',
                'description' => 'Maximum output tokens for AI generation (shared, default: 8000)',
                'is_public' => false,
                'sort_order' => 120,
            ],
        ];

        foreach ($items as $item) {
            Setting::query()->updateOrCreate(
                ['key' => $item['key']],
                $item
            );
        }
    }
}

