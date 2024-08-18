<?php

namespace App\Services;

use App\Exceptions\SelectionNotFoundException;
use App\Exceptions\SubjectAlreadySelectedException;
use App\Models\SelectedSubject;
use App\Models\Subject;
use Exception;
use Ramsey\Uuid\Uuid;

class SelectedSubjectService{
    public function __construct(protected SubjectService $service)
    {
    }
    public function onboard($subjectSlugs, $user)
    {
        foreach ($subjectSlugs as $slug) {
            $subjectId = $this->service->getSubjectId($slug);
            // * check not needed since this will only run once
            SelectedSubject::create([
                'user_id' => $user->id,
                'subject_id' => $subjectId,
                'selection_uuid' => Uuid::uuid4()
            ]);
        }
     }
    public function getSelectedSubjects($userId){
        $selectedSubjects = SelectedSubject::join("subjects","selected_subjects.subject_id","=","subjects.id")->select("subjects.subject_uuid","subjects.subject")->where("selected_subjects.user_id",$userId)->orderBy("subjects.subject")->paginate(8);
        return $selectedSubjects;
    }
    public function getAllSelectedSubjects($userId){
        $selectedSubjects = SelectedSubject::join("subjects","selected_subjects.subject_id","=","subjects.id")->select("subjects.subject_uuid","subjects.subject")->where("selected_subjects.user_id",$userId)->get();
        return $selectedSubjects;
    }
    
    public function selectSubjects($subjectSlugs, $userId)
    {
        foreach ($subjectSlugs as $slug) {
            $subjectId = $this->service->getSubjectId($slug);
    
            $exists = SelectedSubject::where('user_id', $userId)
                                     ->where('subject_id', $subjectId)
                                     ->exists();
            if ($exists) {
                throw new SubjectAlreadySelectedException('Some Subjects are Already Selected.', 409);
            }
            SelectedSubject::create([
                'user_id' => $userId,
                'subject_id' => $subjectId,
                'selection_uuid' => Uuid::uuid4()
            ]);
        }
    }
    // ! possibly redundant
    public function selectSubject($subjectSlug,$userId){
        $subjectId = $this->service->getSubjectId($subjectSlug);
            SelectedSubject::create([
                "user_id" => $userId,
                "subject_id" => $subjectId,
                "selection_uuid" => Uuid::uuid4()
            ]);
    }
    public function removeSubject($uuid, $userId){
        $subjectId = $this->service->getSubjectId($uuid);
        if(!$selectedSubject = SelectedSubject::where("subject_id",$subjectId)->where("user_id",$userId)->first()){
            throw new SelectionNotFoundException(message:"selection not found", code:404);
        }
        $selectedSubject->delete();
    }
    public function removeAllSubjects($userId){
        SelectedSubject::where("user_id",$userId)->delete();        
    }
    public function searchSelectedSubjects(string $query){
        $results = Subject::select('subjects.subject', 'subjects.subject_uuid')
        ->leftJoin('selected_subjects', 'selected_subjects.subject_id', '=', 'subjects.id')
        ->where('subjects.subject', 'like', '%' . $query . '%')
        ->paginate(8);
        return $results;

    }
}