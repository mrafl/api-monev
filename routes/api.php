<?php

use App\Http\Controllers\API\MonevController;
use App\Http\Controllers\API\PresentaseKehadiranController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('monev', [MonevController::class, 'index']);
Route::post('monev/store', [MonevController::class, 'store']);
Route::get('monev/prodi/{kodeProdi}', [MonevController::class, 'showMonevProdi']);
Route::get('monev/prodi/{kodeProdi}/{semester}', [MonevController::class, 'showMonevProdiSortSemester']);
Route::get('monev/prodi/{kodeProdi}/{semester}/{waktu}', [MonevController::class, 'showMonevProdiSortAll']);
Route::get('monev/mahasiswa/{nim}', [MonevController::class, 'showMonevMahasiswa']);
Route::get('monev/mataKuliah/{kodeSeksiMK}', [MonevController::class, 'showMonevMataKuliah']);

Route::get('rekapMonev', [PresentaseKehadiranController::class, 'index']);
Route::get('rekapMonev/{kodeProdi}/{semester}', [PresentaseKehadiranController::class, 'showRekapMonevSortAll']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
