<?php

use App\Models\Announcement;

class AnnouncementService{
    private function sanitizeOutput($announcement, string ...$keys){
        foreach ($keys as $key) {
            unset($announcement[$key]);
        }
        return $announcement;
    }

    public function createAnnouncement($title, $description, $categoryId, $userId){
        $announcement = Announcement::create([
            "title" => $title,
            "description" => $description,
            "category_id" => $categoryId,
            "user_id" => $userId
        ]);
        $announcement = $this->sanitizeOutput($announcement,"id");
        return $announcement;
    }
}