<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Monev extends Model
{
    use HasFactory;
    use softDeletes;

    protected $table = 'monev';
    protected $fillable = [
        'semester',
        'waktu',
        'nim_pj',
        'nama_pj',
        'hp_pj',
        'prodi_pj',
        'kodeProdi',
        'kodeSeksiMK',
        'kodeMK',
        'namaMK',
        'jumlahSKS',
        'jumlahMahasiswa',
        'namaDosen',
        'rps',
        'pertemuanKe',
        'tanggalPertemuan',
        'platform',
        'linkPlatform',
        'pokokBahasan',
        'keterangan',
        'buktiPerkuliahan'
    ];

    protected $hidden = [];
}
