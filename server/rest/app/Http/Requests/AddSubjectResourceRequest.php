<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddSubjectResourceRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            "title" => "required|string",
            "content" => [
                "required",
                "string",
                "regex:/(https?:\/\/[^\s]+)/"
            ],
            "subject_uuid" => "string|required"
        ];
    }
}
