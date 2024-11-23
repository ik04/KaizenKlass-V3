<?php

namespace App\Services;

use App\Exceptions\TestAlreadyExistsException;
use App\Exceptions\TestNotFoundException;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestResource;
use App\Models\User;
use Carbon\Carbon;
use DateTime;
use Ramsey\Uuid\Uuid;

class TestService{
    public function __construct(protected SubjectService $subjectService){


    }

    public function getTests(){
        $currentDate = now();
        $tests = Test::select("tests.title","tests.exam_date","tests.test_uuid","subjects.subject","subjects.subject_uuid")->orderByRaw("CASE
        WHEN tests.exam_date >= ? THEN 0
        WHEN tests.exam_date < ? THEN 2
        WHEN tests.exam_date IS NULL THEN 1
        END", [$currentDate, $currentDate])
        ->join("subjects","subjects.id","=","tests.subject_id")->paginate(5);
        return $tests;
    }

    public function getTestId($uuid){
        $testId = Test::select("id")->where("test_uuid",$uuid)->first();
        if(!$testId){
            throw new TestNotFoundException(message:"invalid uuid, test not found",code:404);
        }
        return $testId->id;
    }

    public function createTest($title, string $examDate = null,$subjectUuid){
        $subjectId = $this->subjectService->getSubjectId($subjectUuid);
        $data = [
            "title" => $title,
            "subject_id" => $subjectId,
            "test_uuid" => Uuid::uuid4()
        ];
        if($examDate){
            $data["exam_date"] = $examDate;
        }
        $currentDate = now();
        $existingTest = Test::where('subject_id', $subjectId)
        ->whereRaw('LOWER(title) = ?', [strtolower($title)])
        ->where(function ($query) use ($currentDate) {
            $query->where("exam_date", ">=", $currentDate)
                  ->orWhereNull("exam_date");
        })
        ->first();
        if($existingTest){
            throw new TestAlreadyExistsException(message:"Test with same title already exists for this subject",code:400);
        }
        $test = Test::create($data);
        return $test;
    }
    public function getTestsWithSelectedSubjects($userId){
        $currentDate = now();
        $tests = Test::join("subjects", "subjects.id", "=", "tests.subject_id")
        ->leftJoin("selected_subjects", "selected_subjects.subject_id", "=", "tests.subject_id")
        ->select("tests.title", "tests.test_uuid", "subjects.subject", "subjects.subject_uuid", "tests.exam_date")
        ->where("selected_subjects.user_id", $userId)
        ->orderByRaw("CASE
            WHEN tests.exam_date >= ? THEN 0
            WHEN tests.exam_date < ? THEN 2
            WHEN tests.exam_date IS NULL THEN 1
            END", [$currentDate, $currentDate])
        ->orderBy("tests.exam_date", "ASC")
        ->paginate(5);
        return $tests;
    }
    public function getTestsBySubjects(string $subjectUuid){
        $currentDate = now();
        $subjectId = $this->subjectService->getSubjectId($subjectUuid);
        $tests = Test::select("title","exam_date","test_uuid")->where("subject_id",$subjectId)->orderByRaw("CASE
        WHEN tests.exam_date >= ? THEN 0
        WHEN tests.exam_date < ? THEN 2
        WHEN tests.exam_date IS NULL THEN 1
        END", [$currentDate, $currentDate])
    ->orderBy("tests.exam_date", "ASC")->paginate(5);
        return $tests;
    }
    public function getTestWithResources(string $uuid)
    {
        $test = Test::with(['testResources' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }])
            ->select("tests.*", "subjects.subject_uuid", "subjects.subject")
            ->join("subjects", "subjects.id", "=", "tests.subject_id")
            ->where("tests.test_uuid", $uuid)
            ->first();

        if (!$test) {
            throw new TestNotFoundException(message: "Test not found", code: 404);
        }

        $resourceData = $test->testResources->map(function ($resource) {
            $user = User::select("name", "user_uuid")->where("id", $resource->user_id)->first();
            return [
                "user_uuid" => $user->user_uuid,
                "username" => $user->name,
                "test_resource_uuid" => $resource->test_resource_uuid,
                "description" => $resource->description,
                "content" => $resource->content
            ];
        })->toArray();

        return [
            "test" => [
                "title" => $test->title,
                "exam_date" => $test->exam_date,
                "test_uuid" => $test->test_uuid,
                "subject_uuid" => $test->subject_uuid,
                "subject" => $test->subject,
            ],
            "resources" => $resourceData,
        ];
    }

    public function deleteTest(string $uuid){
        $test = Test::where("test_uuid",$uuid)->first();
        if(!$test){
            throw new TestNotFoundException(message:"Test Not Found",code:404);
        }
        $test->delete();
    }
    public function updateTest(string $uuid,$data){
        $test = Test::where("test_uuid",$uuid)->first();
        if(!$test){
            throw new TestNotFoundException(message:"Test Not Found",code:404);
        }
        if (isset($data['title'])) {
            $test->title = $data['title'];
        }
        if (isset($data['subject_uuid'])) {
            $subjectId = $this->subjectService->getSubjectId($data['subject_uuid']);
            $test->subject_id = $subjectId;
        }
        if (isset($data['exam_date'])) {
            $test->exam_date = $data['exam_date'];
        }
        $test->save();
        $subject = Subject::select("subject_uuid","subject")->where("id",$test->subject_id)->first();
        $test["subject_uuid"] = $subject->subject_uuid;
        $test["subject"] = $subject->subject;
        unset($test["id"],$test["subject_id"]);
        return $test;
    }
    public function createEndsemWithCts($userId, string $subjectUuid) {
        $subjectId = $this->subjectService->getSubjectId($subjectUuid);

        $currentDate = now();
        $existingEndsem = Test::where('subject_id', $subjectId)
            ->whereRaw('LOWER(title) = ?', [strtolower("End-Sem")])
            ->where(function ($query) use ($currentDate) {
                $query->where("exam_date", ">=", $currentDate)
                      ->orWhereNull("exam_date");
            })
            ->first();

        if ($existingEndsem) {
            throw new TestAlreadyExistsException(message: "An End-Sem test already exists for this subject", code: 400);
        }

        $endsem = Test::create([
            "title" => "End-Sem",
            "subject_id" => $subjectId,
            "test_uuid" => Uuid::uuid4()
        ]);

        $oldTests = Test::select("title", "created_at", "test_uuid")
                       ->where("subject_id", $subjectId)
                       ->where("id", "!=", $endsem->id)
                       ->get();

        foreach ($oldTests as $oldTest) {
            $frontendTestUrl = env('FRONTEND_URL') . "/tests/" . $oldTest->test_uuid;
            TestResource::create([
                "test_id" => $endsem->id,
                "test_resource_uuid" => Uuid::uuid4(),
                "description" => sprintf(
                    "%s\n%s\nPosted at: %s",
                    $oldTest->title,
                    $frontendTestUrl,
                    $oldTest->created_at->format('Y-m-d H:i:s')
                ),
                "user_id" => $userId
            ]);
        }

        return $endsem;
    }

}
