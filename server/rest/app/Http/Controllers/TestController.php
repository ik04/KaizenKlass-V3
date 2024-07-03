<?php

namespace App\Http\Controllers;

use App\Exceptions\TestAlreadyExistsException;
use App\Http\Requests\AddTestRequest;
use App\Http\Requests\UpdateTestRequest;
use App\Services\TestService;
use Exception;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function __construct(protected TestService $service)
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
            return response()->json(["test"=>$test,"message"=>"Test added successfully!"],201);
        }
        catch(TestAlreadyExistsException $e){
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
            $test = $this->service->getTestWithResources($uuid);
            return response()->json(["test"=>$test],200);
        }catch(Exception $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
    }

    public function updateTest(UpdateTestRequest $request,$uuid){
        try{
            $validated = $request->validated();
            $test = $this->service->updateTest($uuid,$validated);
            return response()->json(["message"=>"Test Updated!"]);
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
}
