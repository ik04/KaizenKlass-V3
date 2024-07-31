<?php

namespace App\Http\Controllers;

use App\Exceptions\InvalidSlugException;
use App\Exceptions\InvalidSubjectResourceUuidException;
use App\Http\Requests\AddSubjectResourceRequest;
use App\Http\Requests\UpdateSubjectResourceRequest;
use App\Models\SubjectResource;
use App\Services\SubjectResourceService;
use App\Services\SubjectService;
use Exception;
use Illuminate\Http\Request;

class SubjectResourceController extends Controller
{
    protected $subjectService;

    public function __construct(
        protected SubjectResourceService $service,
        SubjectService $subjectService
    ) {
        $this->subjectService = $subjectService;
    }
    
    public function addSubjectResource(AddSubjectResourceRequest $request){
        try{

            $validated = $request->validated();
            $subjectResource = $this->service->addSubjectResource($validated["title"],$validated["content"],$request->user()->id,$validated["subject_uuid"]);
            return response()->json([
                "subject_resource" => $subjectResource,
                "message" => "Subject Resource Added!"
            ]);
        }catch(Exception $e){
            return response()->json(["error" => $e->getMessage()]);
        }
        catch(InvalidSlugException $e){
            return response()->json(["error" => $e->getMessage()],$e->getCode());
        }
    }
    public function getSubjectResources($uuid){
        $subjectId = $this->subjectService->getSubjectId($uuid);
        $subjectResources = SubjectResource::join("users","users.id","subject_resources.user_id")
        ->select("subject_resources.content","subject_resources.subject_resource_uuid","users.name","users.user_uuid","subject_resources.title")
        ->where("subject_id",$subjectId)
        ->paginate(5);
        return response()->json(["subject_resources" => $subjectResources]);
    }
    public function updateSubjectResource(UpdateSubjectResourceRequest $request, $subjectResourceUuid){
        try{
            $validated = $request->validated();
            $subjectResource = $this->service->updateSubjectResource($validated["content"],$subjectResourceUuid,$request->user()->id);
            return response()->json(["message" => "Updated Subject Resource!","subject_resource" => $subjectResource]);
        }catch(InvalidSubjectResourceUuidException $e){
            return response()->json(["message" => $e->getMessage()],$e->getCode());
        }catch(Exception $e){
            return response()->json(["message" => $e->getMessage()]);
        }
    }
    public function removeSubjectResources(Request $request,$subjectResourceUuid){
        try{
            $deleteSubjectResource = $this->service->deleteSubjectResource($subjectResourceUuid,$request->user()->id);
            return response()->json(["message" => "Deleted Subject Resource!"]);
        }catch(InvalidSubjectResourceUuidException $e){
            return response()->json(["message" => $e->getMessage()],$e->getCode());
        }catch(Exception $e){
            return response()->json(["message" => $e->getMessage()]);
        }
    }
}
