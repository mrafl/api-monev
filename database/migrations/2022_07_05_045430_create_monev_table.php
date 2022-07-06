<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMonevTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('monev', function (Blueprint $table) {
            $table->id();
            $table->integer('semester');
            $table->integer('waktu');
            $table->string('nim_pj');
            $table->string('nama_pj');
            $table->string('hp_pj');
            $table->string('prodi_pj');
            $table->string('kodeProdi');
            $table->string('kodeSeksiMK');
            $table->string('kodeMK');
            $table->string('namaMK');
            $table->integer('jumlahSKS');
            $table->integer('jumlahMahasiswa');
            $table->string('namaDosen');
            $table->integer('rps');
            $table->integer('pertemuanKe');
            $table->date('tanggalPertemuan');
            $table->string('platform');
            $table->string('linkPlatform');
            $table->text('pokokBahasan');
            $table->text('keterangan');
            $table->string('buktiPerkuliahan');
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
        Schema::dropIfExists('monev');
    }
}
