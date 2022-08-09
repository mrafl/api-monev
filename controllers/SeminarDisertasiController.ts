import {RouteConfig} from "../utilities/router";
import {knex} from "../utilities/knex";
import Constants from "../utilities/constants";
import {createLog, error, now, success} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Services from "../utilities/Services";

export default class SeminarDisertasiController {

    static async index({user, mode}: RouteConfig): Promise<any> {
        let semdis = null
        switch (mode) {
            case Constants.mhs:
                semdis = await knex("seminar_disertasi")
                    .where("nim", user.nim)
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.dosen:
                const bimbingan = await knex("seminar_disertasi")
                    .whereIn("id",
                        knex("seminar_disertasi_pembimbing_status")
                            .where("nidn", user.nidn)
                            .select("seminarId")
                    ).orderBy("createdAt", "desc");
                const pengujian = await knex("seminar_disertasi")
                    .where("status", Constants.semdis.diSetujuiProdi)
                    .whereIn("id",
                        knex("seminar_disertasi_penguji")
                            .where("nidn", user.nidn)
                            .select("seminarId")
                    ).orderBy("createdAt", "desc");
                semdis = {
                    bimbingan: bimbingan,
                    pengujian: pengujian
                }
                break;
            case Constants.prodi:
                semdis = await knex("seminar_disertasi")
                    .where("kodeProdi", user.kodeProdi)
                    .whereNotIn("status", [Constants.semdis.diajukan])
                    .orderBy("updatedAt", "desc");
                break;
        }
        return success(semdis)
    }

    static async cekSetujuPembimbing({request, user}: RouteConfig): Promise<any> {
        let cek = null;
        cek = await knex("seminar_disertasi_pembimbing_status")
            .where("seminarId", request.params['id'])
            .where("nidn", user.nidn)

        return success(cek)
    }

    static async cekSetujuPenguji({request, user}: RouteConfig): Promise<any> {
        let cek = null;
        cek = await knex("seminar_disertasi_penguji")
            .where("seminarId", request.params['id'])
            .where("nidn", user.nidn)

        return success(cek)
    }

    static async show({request}: RouteConfig): Promise<any> {
        const semdis = await knex("seminar_disertasi")
            .where("id", request.params['id'])
            .first()
        if (semdis == null) return error("Seminar Disertasi tidak ditemukan")
        const penguji = await knex("seminar_disertasi_penguji")
            .where("seminarId", semdis.id)
        return success({
            semdis: semdis,
            penguji: penguji
        })
    }

    static async lihatNilaiPenguji({request}: RouteConfig): Promise<any> {
        const semdis = await knex("seminar_disertasi")
            .where("id", request.params['id'])
            .first()
        if (semdis == null) return error("Seminar Disertasi tidak ditemukan")
        const penguji = await knex("seminar_disertasi_penguji")
            .where("seminarId", semdis.id)
            .where("nidn", request.params['nidn'])
        return success({
            semdis: semdis,
            penguji: penguji
        })
    }

    static async store({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nim, "Mengajukan Seminar Disertasi")

        const sempro = await knex("seminar_proposal")
            .where("nim", user.nim)
            .orderBy("updatedAt", "desc")
            .first()
        if (sempro == null) return error("Anda belum mengajukan Seminar Proposal")

        const d1 = new Date()
        const d2 = new Date(sempro.updatedAt)
        const diff = d1.getTime() - d2.getTime() / (1000 * 3600 * 24)
        if (diff < 90) return error("Seminar Kelayakan Disertasi dapat diajukan minimal 6 bulan setelah Seminar Proposal")

        const bimbingan = await knex("bimbingan")
            .where("nim", user.nim)
            .where("tujuanBimbingan", "seminarKelayakanDisertasi")
            .where("status", Constants.bimbingan.selesai)
        if (bimbingan.length < 10) return error("Ujian Tesis dapat diajukan setelah minimal 5 kali bimbingan dengan masing - masing pembimbing")

        let semdis = await knex("seminar_disertasi")
            .where("nim", user.nim)
            .whereNotIn("status", [Constants.semdis.selesai, Constants.semdis.ditolak])
            .first()

        if (semdis != null) {
            if (
                semdis.status != Constants.semdis.selesai
                && semdis.status != Constants.semdis.ditolak
                && semdis.status != Constants.semdis.tidakLulus
            ) return error("Penelitian sedang diajukan")
        }

        const getSemesterAktif = await Services.getSemesterAktif()

        let seminarPayload = {
            nim: user.nim,
            semester: getSemesterAktif.data[0].kode_semester,
            nama: user.nama,
            kodeProdi: user.kodeProdi,
            judul: request.body["judul"],
            status: Constants.semdis.diajukan,
            createdAt: now(),
            updatedAt: now()
        }

        for (let x of Object.keys(request.body)) {
            if (x != "judul") {
                const file = request.body[x]
                seminarPayload = Object.assign(seminarPayload, {
                    [x]: await FileManager.createFile(file.content, "seminar-disertasi", file.ext)
                })
            }
        }

        const seminarId = (await knex("seminar_disertasi").insert(seminarPayload))[0]

        const dospem = await knex("pembimbing")
            .where("nim", user.nim)

        for (let x of dospem) await knex("seminar_disertasi_pembimbing_status")
            .insert({
                seminarId: seminarId,
                nidn: x.nidn,
                nama: x.nama,
                status: 0
            })

        return success()
    }

    static async reject({request, user, mode}: RouteConfig): Promise<any> {
        if (mode == Constants.dosen) await createLog(user.nidn, "Menolak Seminar Disertasi")
        if (mode == Constants.prodi) await createLog(user.kodeProdi, "Menolak Seminar Disertasi")

        const semdis = await knex("seminar_disertasi")
            .where("id", request.params['id'])
            .first()
        if (semdis == null) return error("Seminar Disertasi tidak ditemukan")
        await knex("seminar_disertasi")
            .where("id", request.params['id'])
            .update({
                status: Constants.semdis.ditolak,
                pesan: request.body['pesan'],
                updatedAt: now()
            })
        return success()
    }

    static async scoring({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nidn, "Menilai Seminar Disertasi")
        const semdis = await knex("seminar_disertasi")
            .where("id", request.params['id'])
            .first()
        if (semdis == null) return error("Seminar Disertasi tidak ditemukan")
        await knex("seminar_disertasi_penguji")
            .where("seminarId", semdis.id)
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
                skorUnsur8: request.body['skorUnsur8'],
                nilai: request.body['nilai'],
                lulus: request.body['lulus']
            })
        const dataPenguji = await knex("seminar_disertasi_penguji")
            .where("seminarId", semdis.id)
            .where("status", 1)

        if (dataPenguji.length == 6) {
            let lulus = 0
            let status;
            let nilai = 0;
            for (let x of dataPenguji) {
                if (x.lulus == 1) lulus += 1
                nilai += x.nilai;
            }
            if (lulus > 3) status = Constants.semdis.selesai;
            else status = Constants.semdis.tidakLulus;

            await knex("seminar_disertasi")
                .where("id", request.params['id'])
                .update({
                    status: status,
                    nilai: nilai / 6,
                    updatedAt: now()
                });

            if (status == Constants.semdis.selesai) {
                await knex("progress")
                    .where("nim", semdis.nim)
                    .update({progress: Constants.progress.s3.semdis})
            }
        }
        return success()
    }

    static async acc({request, user, mode}: RouteConfig): Promise<any> {
        const sempro = await knex("seminar_disertasi")
            .where("id", request.params['id'])
            .first()
        if (sempro == null) return error("Seminar Disertasi tidak ditemukan")

        switch (mode) {
            case Constants.dosen:
                await createLog(user.nidn, "Menyetujui Seminar Disertasi")
                await knex("seminar_disertasi_pembimbing_status")
                    .where("seminarId", sempro.id)
                    .where("nidn", user.nidn)
                    .update({status: 1})
                const total = (await knex("seminar_disertasi_pembimbing_status")
                    .where("seminarId", sempro.id)
                    .where("status", 1)).length
                if (total == 2) await knex("seminar_disertasi")
                    .where("id", sempro.id)
                    .update({
                        pesan: request.body['pesan'],
                        status: Constants.semdis.diSetujuiDospem,
                        updatedAt: now()
                    })
                break;
            case Constants.prodi:
                console.log(request.body)
                await createLog(user.kodeProdi, "Menyetujui Seminar Disertasi")
                await knex("seminar_disertasi")
                    .where("id", sempro.id)
                    .update({
                        status: Constants.semdis.diSetujuiProdi,
                        waktu: request.body['waktu'],
                        tempat: request.body['tempat'],
                        updatedAt: now()
                    })
                const penguji = request.body['penguji']
                    .map((x: any) => Object.assign(x, {
                        status: 0,
                        nilai: 0,
                        seminarId: sempro.id
                    }))
                await knex("seminar_disertasi_penguji").insert(penguji)
                break;
        }
        return success()
    }
}