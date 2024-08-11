<?php

namespace App\Http\Controllers;

use App\Exceptions\InvalidSlugException;
use App\Exceptions\TestAlreadyExistsException;
use App\Exceptions\TestNotFoundException;
use App\Http\Requests\AddTestRequest;
use App\Http\Requests\UpdateTestRequest;
use App\Services\SubjectService;
use App\Services\TestService;
use Exception;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function __construct(protected TestService $service,protected SubjectService $subjectService)
    {
        
    }
    public function getTests(){
        $tests = $this->service->getTests();
        return response()->json(["tests" => $tests],200);
    }
    public function createTest(AddTestRequest $request){
        try{
            $validated = $request->validated();
            $test = $this->service->createTest($validated["title"],$validated["exam_date"] ?? null,$validated["subject_uuid"]);
            unset($test["id"],$test["subject_id"]);
            $test["subject_uuid"] = $validated["subject_uuid"];
            $test["subject"] = $this->subjectService->getSubjectName($validated["subject_uuid"]);
            return response()->json(["test"=>$test,"message"=>"Test added successfully!"],201);
        }
        catch(TestAlreadyExistsException $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
        catch(InvalidSlugException $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
        catch(Exception $e){
            return response()->json(["error"=>$e->getMessage()]);
        }
    }
    public function getTestsWithSelectedSubjects(Request $request){ // for logged in 
        try{
            $tests = $this->service->getTestsWithSelectedSubjects($request->user()->id);
            return response()->json(["tests"=>$tests],200);
        }catch(Exception $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
    }
    public function getTestsBySubject($uuid){ // for not logged in 
        try{
            $tests = $this->service->getTestsBySubjects($uuid);
            return response()->json(["tests"=>$tests],200);
        }catch(Exception $e){
            return response()->json(["error"=>$e->getMessage(),"code"=>$e->getCode()]);
        }
    }
    public function getTest($uuid){ // for all tests
        try{
            $result = $this->service->getTestWithResources($uuid);
            return response()->json($result,200);
        }catch(TestNotFoundException $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
        catch(Exception $e){
            return response()->json(["error"=>$e->getMessage()]);
        }
    }

    public function updateTest(UpdateTestRequest $request,$uuid){
        try{
            $validated = $request->validated();
            $test = $this->service->updateTest($uuid,$validated);
            return response()->json(["message"=>"Test Updated!","test" => $test]);
        }catch(Exception $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
    }
    public function deleteTest($uuid)
{
    try{
        $this->service->deleteTest($uuid);
        return response()->json(["message" => "Assignment deleted successfully"], 200);
    }catch(Exception $e){
        return response()->json(["error"=>$e->getMessage()],$e->getCode());
    }
}
    public function getDeadlines(){
        
    }
}
