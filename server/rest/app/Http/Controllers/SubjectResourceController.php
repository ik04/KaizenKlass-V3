<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddSubjectResourceRequest;
use App\Services\SubjectResourceService;
use Illuminate\Http\Request;

class SubjectResourceController extends Controller
{
    public function __construct(protected SubjectResourceService $service)
    {
        
    }
    public function addSubjectResource(AddSubjectResourceRequest $request){
        $validated = $request->validated();
        $subjectResource = $this->service->addSubjectResource($validated["content"],$request->user()->id,$validated["subject_uuid"]);
        return response()->json([
            "subject_resource" => $subjectResource,
            "message" => "Subject Resource Added!"
        ]);
    }
}
