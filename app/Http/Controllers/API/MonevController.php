<?php

namespace App\Http\Controllers\API;

use App\Helpers\ApiFormatter;
use App\Http\Controllers\Controller;
use App\Models\Monev;
use App\Models\Presentase_kehadiran;
use Exception;
use Illuminate\Http\Request;

class MonevController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $data = Monev::all();

        if ($data){
            return ApiFormatter::createApi(200, 'Success', $data);
        } else {
            return ApiFormatter::createApi(400, 'Failed');
        }
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'semester' => 'required',
                'waktu' => 'required',
                'nim_pj' => 'required',
                'nama_pj' => 'required',
                'hp_pj' => 'required',
                'prodi_pj' => 'required',
                'kodeProdi' => 'required',
                'kodeSeksiMK' => 'required',
                'kodeMK' => 'required',
                'namaMK' => 'required',
                'jumlahSKS' => 'required',
                'jumlahMahasiswa' => 'required',
                'namaDosen' => 'required',
                'rps' => 'required',
                'pertemuanKe' => 'required',
                'tanggalPertemuan' => 'required',
                'platform' => 'required',
                'linkPlatform' => 'required',
                'pokokBahasan' => 'required',
                'keterangan' => 'required'
            ]);

            $monev = Monev::create([
                'semester' => $request->semester,
                'waktu' => $request->waktu,
                'nim_pj' => $request->nim_pj,
                'nama_pj' => $request->nama_pj,
                'hp_pj' => $request->hp_pj,
                'prodi_pj' => $request->prodi_pj,
                'kodeProdi' => $request->kodeProdi,
                'kodeSeksiMK' => $request->kodeSeksiMK,
                'kodeMK' => $request->kodeMK,
                'namaMK' => $request->namaMK,
                'jumlahSKS' => $request->jumlahSKS,
                'jumlahMahasiswa' => $request->jumlahMahasiswa,
                'namaDosen' => $request->namaDosen,
                'rps' => $request->rps,
                'pertemuanKe' => $request->pertemuanKe,
                'tanggalPertemuan' => $request->tanggalPertemuan,
                'platform' => $request->platform,
                'linkPlatform' => $request->linkPlatform,
                'pokokBahasan' => $request->pokokBahasan,
                'keterangan' => $request->keterangan
            ]);

            $data = Monev::where('id', '=', $monev->id)->get();

            if ($data){
                return ApiFormatter::createApi(200, 'Success', $data);
            } else {
                return ApiFormatter::createApi(400, 'Failed');
            }

        } catch (Exception $error) {
            return ApiFormatter::createApi(400, 'Failed');
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $kodeProdi
     * @return \Illuminate\Http\Response
     */
    public function showMonevProdi($kodeProdi)
    {
        $data = Monev::where('kodeProdi', '=', $kodeProdi)->get();

        if ($data){
            return ApiFormatter::createApi(200, 'Success', $data);
        } else {
            return ApiFormatter::createApi(400, 'Failed');
        }
    }

    public function showMonevProdiSortSemester($kodeProdi, $semester)
    {
        $data = Monev::where(function ($query) use ($kodeProdi, $semester){
            $query->where('kodeProdi', '=', $kodeProdi)
                ->Where('semester', '=', $semester);
        })->get();

        if ($data){
            return ApiFormatter::createApi(200, 'Success', $data);
        } else {
            return ApiFormatter::createApi(400, 'Failed');
        }
    }

    public function showMonevProdiSortAll($kodeProdi, $semester, $waktu)
    {
        $data = Monev::where(function ($query) use ($kodeProdi, $semester, $waktu){
            $query->where('kodeProdi', '=', $kodeProdi)
                ->Where('semester', '=', $semester)
                ->Where('waktu', '=', $waktu);
        })->get();

        if ($data){
            return ApiFormatter::createApi(200, 'Success', $data);
        } else {
            return ApiFormatter::createApi(400, 'Failed');
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $nim
     * @return \Illuminate\Http\Response
     */
    public function showMonevMahasiswa($nim)
    {
        $data = Monev::where('nim_pj', '=', $nim)->get();

        if ($data){
            return ApiFormatter::createApi(200, 'Success', $data);
        } else {
            return ApiFormatter::createApi(400, 'Failed');
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $kodeSeksiMK
     * @return \Illuminate\Http\Response
     */
    public function showMonevMataKuliah($kodeSeksiMK)
    {
        $data = Monev::where('kodeSeksiMK', '=', $kodeSeksiMK)->get();

        if ($data){
            return ApiFormatter::createApi(200, 'Success', $data);
        } else {
            return ApiFormatter::createApi(400, 'Failed');
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
