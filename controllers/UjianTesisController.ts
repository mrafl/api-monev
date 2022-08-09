import {RouteConfig} from "../utilities/router";
import Constants from "../utilities/constants";
import {knex} from "../utilities/knex";
import {createLog, error, now, success} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Services from "../utilities/Services";

export default class UjianTesisController {

    static async index({user, mode}: RouteConfig): Promise<any> {
        let ujian = null
        switch (mode) {
            case Constants.mhs:
                ujian = await knex("ujian_tesis")
                    .where("nim", user.nim)
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.dosen:
                const bimbingan = await knex("ujian_tesis")
                    .whereIn("id",
                        knex("ujian_tesis_pembimbing_status")
                            .where("nidn", user.nidn)
                            .select("tesisId")
                    ).orderBy("createdAt", "desc");
                const pengujian = await knex("ujian_tesis")
                    .where("status", Constants.ujianTesis.diSetujuiProdi)
                    .whereIn("id",
                        knex("ujian_tesis_penguji")
                            .where("nidn", user.nidn)
                            .select("tesisId")
                    ).orderBy("createdAt", "desc");
                ujian = {
                    bimbingan: bimbingan,
                    pengujian: pengujian
                }
                break;
            case Constants.prodi:
                ujian = await knex("ujian_tesis")
                    .where("kodeProdi", user.kodeProdi)
                    .where("status", Constants.ujianTesis.disetujuiPembimbing)
                    .orWhere("status", Constants.ujianTesis.diSetujuiProdi)
                    .orWhere("status", Constants.ujianTesis.dalamProses)
                    .orWhere("status", Constants.ujianTesis.dalamPerbaikan)
                    .orWhere("status", Constants.ujianTesis.telahDiperbaiki)
                    .orWhere("status", Constants.ujianTesis.selesai)
                    .orderBy("updatedAt", "desc");
                break;
        }
        return success(ujian)
    }

    static async cekSetujuPembimbing({request, user}: RouteConfig): Promise<any> {
        let cek = null;
        cek = await knex("ujian_tesis_pembimbing_status")
            .where("tesisId", request.params['id'])
            .where("nidn", user.nidn)

        return success(cek)
    }

    static async cekSetujuPenguji({request, user}: RouteConfig): Promise<any> {
        let cek = null;
        cek = await knex("ujian_tesis_penguji")
            .where("tesisId", request.params['id'])
            .where("nidn", user.nidn)

        return success(cek)
    }

    static async store({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nim, "Mengajukan Ujian Tesis")
        const sempro = await knex("seminar_proposal")
            .where("nim", user.nim)
            .orderBy("updatedAt", "desc")
            .first()
        if (sempro == null) return error("Anda belum mengajukan Seminar Proposal")

        const d1 = new Date()
        const d2 = new Date(sempro.updatedAt)
        const diff = d1.getTime() - d2.getTime() / (1000 * 3600 * 24)
        if (diff < 90) return error("Ujian Tesis dapat diajukan minimal 3 bulan setelah seminar proposal")

        const bimbingan = await knex("bimbingan")
            .where("nim", user.nim)
            .where("tujuanBimbingan", "ujianTesis")
            .where("status", Constants.bimbingan.selesai)
        if (bimbingan.length < 10) return error("Ujian Tesis dapat diajukan setelah minimal 5 kali bimbingan dengan masing - masing pembimbing")

        const ujian = await knex("ujian_tesis")
            .where("nim", user.nim)
            .whereNotIn("status", [Constants.ujianTesis.selesai, Constants.ujianTesis.ditolak])
            .orderBy("updatedAt", "desc")
            .first()
        if (ujian != null) return error("Ujian sedang dalam proses")

        const getSemesterAktif = await Services.getSemesterAktif()

        let payload = {
            semester: getSemesterAktif.data[0].kode_semester,
            nim: user.nim,
            nama: user.nama,
            kodeProdi: user.kodeProdi,
            status: 0,
            judul: request.body["judul"],
            createdAt: now(),
            updatedAt: now()
        }

        for (let x of Object.keys(request.body)) {
            if (x != "judul") {
                const file = request.body[x]
                payload = Object.assign(payload, {
                    [x]: await FileManager.createFile(file.content, "ujian-tesis", file.ext)
                })
            }
        }
        const tesisId = (await knex("ujian_tesis").insert(payload))[0]

        const dospem = await knex("pembimbing")
            .where("nim", user.nim)

        for (let x of dospem) await knex("ujian_tesis_pembimbing_status")
            .insert({
                tesisId: tesisId,
                nidn: x.nidn,
                nama: x.nama,
                status: 0
            })

        return success()
    }

    static async show({request}: RouteConfig): Promise<any> {
        const tesis = await knex("ujian_tesis")
            .where("id", request.params['id'])
            .first()
        if (tesis == null) return error("Ujian tidak ditemukan")
        const penguji = await knex("ujian_tesis_penguji")
            .where("tesisId", tesis.id)
        return success({
            tesis: tesis,
            penguji: penguji
        })
    }

    static async lihatNilaiPenguji({request}: RouteConfig): Promise<any> {
        const tesis = await knex("ujian_tesis")
            .where("id", request.params['id'])
            .first()
        if (tesis == null) return error("Ujian tidak ditemukan")
        const penguji = await knex("ujian_tesis_penguji")
            .where("tesisId", tesis.id)
            .where("nidn", request.params['nidn'])
        return success({
            tesis: tesis,
            penguji: penguji
        })
    }

    static async acc({request, user, mode}: RouteConfig): Promise<any> {
        const ujian = await knex("ujian_tesis")
            .where("id", request.params['id'])
            .first()
        if (ujian == null) return error("Ujian tidak ditemukan")

        switch (mode) {
            case Constants.dosen:
                await createLog(user.nidn, "Menyetujui Ujian Tesis")
                if (ujian.status == Constants.ujianTesis.diajukan) {
                    await knex("ujian_tesis_pembimbing_status")
                        .where("tesisId", ujian.id)
                        .where("nidn", user.nidn)
                        .update({status: 1})
                    const total = (await knex("ujian_tesis_pembimbing_status")
                        .where("tesisId", ujian.id)
                        .where("status", 1)).length
                    if (total == 2) await knex("ujian_tesis")
                        .where("id", ujian.id)
                        .update({
                            status: Constants.ujianTesis.disetujuiPembimbing,
                            updatedAt: now()
                        })
                } else {
                    await knex("ujian_tesis")
                        .where("id", ujian.id)
                        .update({
                            status: Constants.ujianTesis.selesai,
                            updatedAt: now()
                        })
                    await knex("progress")
                        .where("nim", ujian.nim)
                        .update({progress: Constants.progress.s2.ujian})
                }
                break;
            case Constants.prodi:
                await createLog(user.kodeProdi, "Menyetujui Ujian Tesis")
                await knex("ujian_tesis")
                    .where("id", ujian.id)
                    .update({
                        status: Constants.ujianTesis.diSetujuiProdi,
                        waktu: request.body['waktu'],
                        tempat: request.body['tempat'],
                        updatedAt: now()
                    })
                const penguji = request.body['penguji']
                    .map((x: any) => Object.assign(x, {
                        status: 0,
                        nilai: 0,
                        tesisId: ujian.id
                    }))
                await knex("ujian_tesis_penguji").insert(penguji)
                break;
        }
        return success()
    }

    static async reject({request, user, mode}: RouteConfig): Promise<any> {
        if (mode == Constants.prodi) await createLog(user.kodeProdi, "Menolak Ujian Tesis")
        if (mode == Constants.dosen) await createLog(user.nidn, "Menolak Ujian Tesis")

        const ujian = await knex("ujian_tesis")
            .where("id", request.params['id'])
            .first()
        if (ujian == null) return error("Ujian tidak ditemukan")
        if (mode == Constants.prodi) {
            await knex("ujian_tesis")
                .where("id", request.params['id'])
                .update({
                    status: Constants.ujianTesis.ditolak,
                    pesan: request.body['pesan'],
                    updatedAt: now()
                })
        }
        if (mode == Constants.dosen) {
            await knex("ujian_tesis")
                .where("id", request.params['id'])
                .update({
                    status: Constants.ujianTesis.dalamPerbaikan,
                    updatedAt: now()
                })
        }
        return success()
    }

    static async scoring({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nidn, "Menilai Ujian Tesis")
        const ujian = await knex("ujian_tesis")
            .where("id", request.params['id'])
            .first()
        if (ujian == null) return error("Ujian tidak ditemukan")
        await knex("ujian_tesis_penguji")
            .where("tesisId", ujian.id)
            .where("nidn", user.nidn)
            .update({
                status: 1,
                skorUnsur1: request.body['skorUnsur1'],
                skorUnsur2: request.body['skorUnsur2'],
                skorUnsur3: request.body['skorUnsur3'],
                skorUnsur4: request.body['skorUnsur4'],
                skorUnsur5: request.body['skorUnsur5'],
                skorUnsur6: request.body['skorUnsur6'],
                skorUnsur7: request.body['skorUnsur7'],
                nilai: request.body['nilai'],
                lulus: request.body['lulus']
            })
        const dataPenguji = await knex("ujian_tesis_penguji")
            .where("tesisId", ujian.id)
            .where("status", 1)

        if (dataPenguji.length == 6) {
            let lulus = 0
            let nilai = 0;
            for (let x of dataPenguji) {
                if (x.lulus == 1) lulus += 1
                nilai += x.nilai;
            }
            if (lulus > 3) {
                await knex("ujian_tesis")
                    .where("id", request.params['id'])
                    .update({
                        status: Constants.ujianTesis.selesai,
                        nilai: nilai / 6,
                        updatedAt: now()
                    });
            } else {
                await knex("ujian_tesis")
                    .where("id", request.params['id'])
                    .update({
                        status: Constants.ujianTesis.ditolak,
                        nilai: nilai / 6,
                        updatedAt: now(),
                        pesan: "Tidak Lulus"
                    });
            }
        }
        return success()
    }

    static async update({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nim, "Memperbarui Ujian Tesis")
        const ujian = await knex("ujian_tesis")
            .where("id", request.params['id'])
            .where("nim", user.nim)
            .first()
        if (ujian == null) return error("Ujian tidak ditemukan")
        const tesis = request.body['tesis']
        await knex("ujian_tesis")
            .where("id", request.params['id'])
            .update({
                updatedAt: now(),
                file: await FileManager.createFile(tesis.content, "tesis", tesis.ext),
                status: Constants.ujianTesis.telahDiperbaiki
            })
        return success()
    }
}