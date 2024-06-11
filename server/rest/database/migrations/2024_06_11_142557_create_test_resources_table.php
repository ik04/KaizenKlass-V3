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
        Schema::create('test_resources', function (Blueprint $table) {
            $table->id();
            $table->string("content");
            $table->string("description")->nullable();
            $table->uuid("test_resource_uuid")->unique();
            $table->unsignedBigInteger("user_id");
            $table->unsignedBigInteger("test_id");
            $table->foreign("user_id")->references("id")->on('users')->onDelete("cascade");
            $table->foreign("test_id")->references("id")->on('tests')->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_resources');
    }
};
