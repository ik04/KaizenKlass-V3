<?php

namespace App\Http\Controllers;

use App\Exceptions\SubjectAlreadySelectedException;
use App\Exceptions\UserAlreadyOnboardedException;
use App\Http\Requests\AddSelectedSubjectRequest;
use App\Http\Requests\AddSelectedSubjectsRequest;
use App\Services\SelectedSubjectService;
use Exception;
use Illuminate\Http\Request;

class SelectedSubjectController extends Controller
{
    public function __construct(protected SelectedSubjectService $service)
    {
        
    }
    public function onboard(AddSelectedSubjectsRequest $request) {
        try {
            if ($request->user()->is_onboard) {
                throw new UserAlreadyOnboardedException("User Already Onboarded.", 409);
            }
            
            $validated = $request->validated();
            $this->service->onboard($validated["subject_uuid"], $request->user());
            
            $request->user()->is_onboard = true;
            $request->user()->save();
            
            return response()->json(["message" => "You have been Onboarded!"]);
        } catch (UserAlreadyOnboardedException $e) {
            return response()->json(["error" => $e->getMessage()], $e->getCode());
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()]);
        }
    }
    
    public function getSelectedSubjects(Request $request){
        $selectedSubjects = $this->service->getSelectedSubjects($request->user()->id);
        return response()->json(["selected_subjects" => $selectedSubjects]);
    }
    public function getAllSelectedSubjects(Request $request){
        $selectedSubjects = $this->service->getAllSelectedSubjects($request->user()->id);
        return response()->json(["selected_subjects" => $selectedSubjects]);
    }

    public function selectSubjects(AddSelectedSubjectsRequest $request){
        try{
            $validated = $request->validated();
            $this->service->selectSubjects($validated["subject_uuid"],$request->user()->id);
            return response()->json(["message"=>"Subjects added"]);
        }catch(Exception $e){
            return response()->json(["error"=>$e->getMessage()]);
        }catch(SubjectAlreadySelectedException $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
    }

    public function selectSubject(AddSelectedSubjectRequest $request){
        try{
            $validated = $request->validated();
            $this->service->selectSubject($validated["subject_uuid"],$request->user()->id);
            return response()->json(["message"=>"Subjects added"]);
        }catch(Exception $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
    }
    public function removeSelectedSubject(Request $request, $uuid){
        try{
            $this->service->removeSubject($uuid,$request->user()->id);
            return response()->json(["message"=>"Selection Removed"]);
        }catch(Exception $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
    }
    public function removeAllSelectedSubject(Request $request){
        try{
            $this->service->removeAllSubjects($request->user()->id);
            return response()->json(["message"=>"All Selections Removed"]);
        }catch(Exception $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
    }
}
