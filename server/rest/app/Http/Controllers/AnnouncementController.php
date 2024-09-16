<?php

namespace App\Http\Controllers;

use AnnouncementService;
use App\Exceptions\InvalidUserException;
use App\Http\Requests\AddAnnouncementRequest;
use App\Services\AnnouncementService as ServicesAnnouncementService;
use Exception;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function __construct(protected ServicesAnnouncementService $service)
    {
        
    }
    public function createAnnouncement(AddAnnouncementRequest $request){
        $validated = $request->validated();
        $announcement = $this->service->createAnnouncement($validated["title"],$validated["description"],$validated["category_id"],$request->user()->id);
        return response()->json(["announcement" => $announcement, "message" => "Announcement Made Successfully!"]);
    }
    public function getAnnouncements(){
        $announcements = $this->service->getAnnouncements();
        return response()->json(["announcements" => $announcements]);
    }


    public function deleteAnnouncement(Request $request, $id){
        try{
            $this->service->deleteAnnouncement($request->user()->id,$id);
            return response()->json(["message" => "Announcement deleted!"]);
        }
        catch(InvalidUserException $e){
            return response()->json(["error" => $e->getMessage()],$e->getCode());
        }
        catch(Exception $e){
            return response()->json(["error" => $e->getMessage()],500);
        }
    }
}
