<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddSubjectResourceRequest;
use App\Models\SubjectResource;
use App\Services\SubjectResourceService;
use App\Services\SubjectService;

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
}
