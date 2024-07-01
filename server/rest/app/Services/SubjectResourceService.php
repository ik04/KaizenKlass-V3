<?php

namespace App\Services;

use App\Models\SubjectResource;
use Ramsey\Uuid\Uuid;

class SubjectResourceService{
    public function __construct(protected SubjectService $subjectService)
    {
        
    }
    public function addSubjectResource($content,$userId,$subjectUuid){
        $subjectId = $this->subjectService->getSubjectId($subjectUuid);
        $subjectResource = SubjectResource::create([
            "content" => $content,
            "user_id" => $userId,
            "subject_id" => $subjectId,
            "subject_resource_uuid" => Uuid::uuid4()
        ]);
        return $subjectResource;
    }
}