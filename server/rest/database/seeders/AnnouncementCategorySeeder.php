<?php

namespace Database\Seeders;

use App\Models\AnnouncementCategories;
use App\Models\AnnouncementCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AnnouncementCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $relativePath = __DIR__ . "/init/announcement_categories.json";
        $categoriesJson = json_decode(file_get_contents($relativePath));
        $categories = $categoriesJson->categories;
        foreach($categories as $category){
            AnnouncementCategory::create([
                "category" => $category->category
            ]);
        }

    }
}
