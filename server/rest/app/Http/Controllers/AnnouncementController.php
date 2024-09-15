<?php

namespace App\Http\Controllers;

use AnnouncementService;
use App\Http\Requests\AddAnnouncementRequest;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function __construct(protected AnnouncementService $service)
    {
        
    }
    public function createAnnouncement(AddAnnouncementRequest $request){
        $validated = $request->validated();
        $announcement = $this->service($validated["title"],$validated["description"],$validated["category_id"]);
        return response()->json(["Announcement" => $announcement, "message" => "Announcement Made Successfully!"]);
    }
}
