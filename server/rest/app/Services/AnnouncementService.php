<?php

use App\Exceptions\InvalidUserException;
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
    public function getAnnouncements(){
        $announcements = Announcement::join("users","users.id","=","announcements.user_id")
        ->select("announcements.title","announcements.description","users.name","users.user_uuid")
        ->get();
        return $announcements;
    }
    public function deleteAnnouncement($userId,$announcementId){
        $announcement = Announcement::where("id",$announcementId)->first();
        if ($announcement->id != $userId){
            throw new InvalidUserException("The users do not match",409);
        }
        $announcement->delete();
    }
}