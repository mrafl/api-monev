<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('presentase_kehadiran', function (Blueprint $table) {
            $table->id();
            $table->integer('kodeSeksi');
            $table->integer('semester');
            $table->integer('waktu');
            $table->string('namaDosen');
            $table->string('namaMataKuliah');
            $table->integer('presentaseKehadiran');
            $table->integer('total');
            $table->integer('rps');
            $table->integer('pertemuan1')->nullable();
            $table->integer('pertemuan2')->nullable();
            $table->integer('pertemuan3')->nullable();
            $table->integer('pertemuan4')->nullable();
            $table->integer('pertemuan5')->nullable();
            $table->integer('pertemuan6')->nullable();
            $table->integer('pertemuan7')->nullable();
            $table->integer('pertemuan8')->nullable();
            $table->integer('pertemuan9')->nullable();
            $table->integer('pertemuan10')->nullable();
            $table->integer('pertemuan11')->nullable();
            $table->integer('pertemuan12')->nullable();
            $table->integer('pertemuan13')->nullable();
            $table->integer('pertemuan14')->nullable();
            $table->integer('pertemuan15')->nullable();
            $table->integer('pertemuan16')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('presentase_kehadiran');
    }
};
