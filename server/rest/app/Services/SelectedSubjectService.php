<?php

namespace App\Services;

use App\Exceptions\SelectionNotFoundException;
use App\Exceptions\SubjectAlreadySelectedException;
use App\Models\SelectedSubject;
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
        $user->is_onboard = true;
    }
    public function getSelectedSubjects($userId){
        $selectedSubjects = SelectedSubject::join("subjects","selected_subjects.subject_id","=","subjects.id")->select("subjects.slug","subjects.subject")->where("selected_subjects.user_id",$userId)->get();
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
    public function removeSubject($uuid){
        if(!$selectedSubject = SelectedSubject::where("selection_uuid",$uuid)->first()){
            throw new SelectionNotFoundException(message:"selection not found", code:404);
        }
        $selectedSubject->delete();
    }
    public function removeAllSubjects($userId){
        SelectedSubject::where("user_id",$userId)->delete();        
    }
}