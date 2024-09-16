<?php

namespace App\Http\Controllers;

use AnnouncementService;
use App\Exceptions\InvalidUserException;
use App\Http\Requests\AddAnnouncementRequest;
use Exception;
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
    public function getAnnouncements(){
        $announcements = $this->service->getAnnouncements();
        return response()->json(["announcements" => $announcements]);
    }


    public function deleteAnnouncement(Request $request, $id){
        try{
            $this->service->deleteAnnouncement($request->user()->id,$id);
            return response()->json(["message" => "Announcement deleted!z"]);
        }
        catch(InvalidUserException $e){
            return response()->json(["error" => $e->getMessage()],$e->getCode());
        }
        catch(Exception $e){
            return response()->json(["error" => $e->getMessage()],500);
        }
    }
}
