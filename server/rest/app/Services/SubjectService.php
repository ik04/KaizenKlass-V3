<?php

namespace App\Services;

use App\Exceptions\InvalidSlugException;
use App\Models\Subject;
use Ramsey\Uuid\Uuid;

class SubjectService{
    public function getSubjectId($subjectUuid){
        if(!$actualSubjectId = Subject::select("id")->where("subject_uuid",$subjectUuid)->first()){
            throw new InvalidSlugException(message:"Invalid Subject Slug", code:400);
        }
        return $actualSubjectId->id;
    }
    public function getSubjectName($subjectUuid){
        if(!$subject = Subject::select("subject")->where("subject_uuid",$subjectUuid)->first()->subject){
            throw new InvalidSlugException(message:"Invalid Subject Slug", code:400);
        }
        return $subject;
    }


    public function addSubject(string $subject){
        $subject = Subject::create([
            "subject" => $subject,
            "subject_uuid" => Uuid::uuid4()
        ]);
        return $subject;
    }
    public function getSubjects(){
        $subjects = Subject::select("subject", "subject_uuid")
                    ->orderByDesc('created_at') 
                    ->get();

                    return $subjects;
    }
    public function getSubjectsV2(){
        $subjects = Subject::select("subject", "subject_uuid")
                    ->orderByDesc('created_at')
                    ->paginate(12);
                    return $subjects;
    }
    public function deleteSubject(Uuid $subjectUuid){
        if (!Subject::where('subject_uuid', $subjectUuid)->exists()) {
            return response()->json(["error" => "Subject not found"], 404);
        }
        Subject::where('subject_uuid', $subjectUuid)->delete();
    }
    
    public function getSubjectDetails($subjectId){
        $subjectDetails = Subject::select("subject","subject_uuid")->where("id",$subjectId)->first();
        return $subjectDetails;
    }

    public function searchSubjects(string $query){
        $results = Subject::where('subject', 'LIKE', '%' . $query . '%')->paginate(8);        
        return $results;
    }
}