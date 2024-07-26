<?php

namespace App\Http\Controllers;

use App\Exceptions\EmptyDescriptionException;
use App\Http\Requests\AddTestResourceRequest;
use App\Http\Requests\UpdateTestResourceRequest;
use App\Models\TestResource;
use App\Services\TestResourceService;
use Exception;
use Illuminate\Http\Request;

class TestResourceController extends Controller
{
    public function __construct(protected TestResourceService $service)
    {
        
    }
    public function createTestResource(AddTestResourceRequest $request){
        try{

            $validated = $request->validated();
            $testResource = $this->service->createTestResource($validated["description"] ?? null,$validated["test_uuid"],$validated["content"] ?? null,$request->user()->id);
            unset($testResource["id"],$testResource["user_id"],$testResource["test_id"]);
            $testResource["user_uuid"] = $request->user()->user_uuid;
            return response(["test_resource" => $testResource],201);
        }catch(EmptyDescriptionException $e){
            return response()->json(["error"=>$e->getMessage()],$e->getCode());
        }
        catch(Exception $e){
            return response()->json(["error"=>$e->getMessage()]);
        }
    }
    public function deleteOwnTestResource(Request $request,$uuid){
        $this->service->deleteOwnTestResource($uuid, $request->user()->id);
    return response()->json(["message" => "test resource deleted successfully"], 200);
    }
    public function updateOwnTestResource(UpdateTestResourceRequest $request,$uuid){
        $validated = $request->validated();
        $testResource = $this->service->updateOwnTestResource($validated["description"] ?? null,$validated["content"] ?? null,$uuid,$request->user()->id);
        unset($testResource["id"],$testResource["user_id"],$testResource["test_id"]);
        $testResource["user_uuid"] = $request->user()->user_uuid;
        return response()->json(["message" => "Test Resource updated successfully","test_resource" => $testResource], 200);
    }
   
}