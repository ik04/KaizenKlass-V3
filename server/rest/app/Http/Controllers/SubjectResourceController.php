<?php

namespace App\Http\Controllers;

use App\Exceptions\InvalidSubjectResourceUuidException;
use App\Http\Requests\AddSubjectResourceRequest;
use App\Http\Requests\UpdateSubjectResourceRequest;
use App\Models\SubjectResource;
use App\Services\SubjectResourceService;
use App\Services\SubjectService;
use Exception;

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
        $validated = $request->validated();
        $subjectResource = $this->service->addSubjectResource($validated["content"],$request->user()->id,$validated["subject_uuid"]);
        return response()->json([
            "subject_resource" => $subjectResource,
            "message" => "Subject Resource Added!"
        ]);
    }
    public function getSubjectResources($uuid){
        $subjectId = $this->subjectService->getSubjectId($uuid);
        $subjectResources = SubjectResource::join("users","users.id","subject_resources.user_id")
        ->select("subject_resources.content","subject_resources.subject_resource_uuid","users.name")
        ->where("subject_id",$subjectId)
        ->get();
        return response()->json(["subject_resources" => $subjectResources]);
    }
    public function updateSubjectResource(UpdateSubjectResourceRequest $request, $subjectResourceUuid){
        try{
            $validated = $request->validated();
            $subjectResource = $this->service->updateSubjectResource($validated["content"],$subjectResourceUuid);
            return response()->json(["message" => "Updated Subject Resource!","subject_resource" => $subjectResource]);
        }catch(InvalidSubjectResourceUuidException $e){
            return response()->json(["message" => $e->getMessage()],$e->getCode());
        }catch(Exception $e){
            return response()->json(["message" => $e->getMessage()]);
        }
    }
}
