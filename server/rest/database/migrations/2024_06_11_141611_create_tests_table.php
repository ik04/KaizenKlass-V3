<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->id();
            $table->string("title")->unique();
            $table->dateTime("exam_date");
            $table->foreign("subject_id")->references("id")->on("subjects")->onDelete("cascade");
            $table->unsignedBigInteger("subject_id");
            $table->uuid("test_uuid")->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tests');
    }
};
