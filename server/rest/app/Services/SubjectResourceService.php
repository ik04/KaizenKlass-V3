<?php

namespace App\Services;

use App\Exceptions\EmptySubjectResourceContentException;
use App\Exceptions\InvalidSubjectResourceUuidException;
use App\Models\SubjectResource;
use Ramsey\Uuid\Uuid;

class SubjectResourceService{
    public function __construct(protected SubjectService $subjectService)
    {
        
    }
    public function removeIds($subjectResource){
        unset($subjectResource["id"]);
        unset($subjectResource["user_id"]);
        return $subjectResource;
    }
    public function getSubjectResouceId($subjectResourceUuid){
        if(!$actualSubjectResourceId = SubjectResource::select("id")->where("subject_uuid",$subjectResourceUuid)->first()->id){
            throw new InvalidSubjectResourceUuidException(message:"Invalid Subject Resource Uuid", code:400);
        }
        return $actualSubjectResourceId;

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
    public function updateSubjectResource($content,$subjectResourceUuid){
        $subjectResource = SubjectResource::where("subject_resource_uuid",$subjectResourceUuid)->first();
        if (!$subjectResource) {
            throw new InvalidSubjectResourceUuidException(message:"Subject Resource not found",code:404);
        }
        if($content){
            if(strip_tags($content) == ""){
                throw new EmptySubjectResourceContentException(message:"Empty Description, please don't use tags.",code:400);
            }
            $subjectResource->content = strip_tags($content);
        }
        $subjectResource->save();
        $subjectResource = $this->removeIds($subjectResource);
        return $subjectResource;
    }
    public function deleteSubjectResource($subjectResourceUuid){
        $subjectResource = SubjectResource::where("subject_resource_uuid",$subjectResourceUuid)->first();
        if (!$subjectResource) {
            throw new InvalidSubjectResourceUuidException(message:"Subject Resource not found",code:404);
        }
        $subjectResource->delete();
    }
}