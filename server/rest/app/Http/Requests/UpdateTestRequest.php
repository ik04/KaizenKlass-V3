<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTestRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            "title" => "string|nullable",
            "subject_uuid" =>"string|nullable",
            "exam_date" =>"nullable|date_format:Y-m-d H:i:s|after_or_equal:today",
        ];
    }
}
