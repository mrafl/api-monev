<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Presentase_kehadiran extends Model
{
    use HasFactory;
    use softDeletes;

    protected $table = 'presentase_kehadiran';
    protected $fillable = [
        'kodeProdi',
        'kodeSeksi',
        'semester',
        'namaDosen',
        'namaMataKuliah',
        'presentaseKehadiran',
        'total',
        'rps',
        'pertemuan1',
        'pertemuan2',
        'pertemuan3',
        'pertemuan4',
        'pertemuan5',
        'pertemuan6',
        'pertemuan7',
        'pertemuan8',
        'pertemuan9',
        'pertemuan10',
        'pertemuan11',
        'pertemuan12',
        'pertemuan13',
        'pertemuan14',
        'pertemuan15',
        'pertemuan16'
    ];

    protected $hidden = [];
}
