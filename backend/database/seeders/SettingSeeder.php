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
        ];

        foreach ($items as $item) {
            Setting::query()->updateOrCreate(
                ['key' => $item['key']],
                $item
            );
        }
    }
}

