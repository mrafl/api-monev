import {RouteConfig} from "../utilities/router";
import {knex} from "../utilities/knex";
import Constants from "../utilities/constants";
import {createLog, error, now, success} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Services from "../utilities/Services";

export default class UjianTerbukaController {

    static async index({user, mode}: RouteConfig): Promise<any> {
        let ujian = null
        switch (mode) {
            case Constants.mhs:
                ujian = await knex("ujian_terbuka")
                    .where("nim", user.nim)
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.dosen:
                const bimbingan = await knex("ujian_terbuka")
                    .whereIn("id",
                        knex("ujian_terbuka_pembimbing_status")
                            .where("nidn", user.nidn)
                            .select("ujianId")
                    ).orderBy("createdAt", "desc");
                const pengujian = await knex("ujian_terbuka")
                    .where("status", Constants.ujian.diSetujuiProdi)
                    .orWhere("status", Constants.ujian.sedangDinilai)
                    .orWhere("status", Constants.ujian.selesai)
                    .orWhere("status", Constants.ujian.skDiterbitkan)
                    .whereIn("id",
                        knex("ujian_terbuka_penguji")
                            .where("nidn", user.nidn)
                            .select("ujianId")
                    ).orderBy("createdAt", "desc");
                ujian = {
                    bimbingan: bimbingan,
                    pengujian: pengujian
                }
                break;
            case Constants.prodi:
                ujian = await knex("ujian_terbuka")
                    .where("kodeProdi", user.kodeProdi)
                    .whereNotIn("status", [Constants.ujian.diajukan])
                    .orderBy("updatedAt", "desc");
                break;
        }
        return success(ujian)
    }

    static async cekSetujuPembimbing({request, user}: RouteConfig): Promise<any> {
        let cek = null;
        cek = await knex("ujian_terbuka_pembimbing_status")
            .where("ujianId", request.params['id'])
            .where("nidn", user.nidn)

        return success(cek)
    }

    static async cekSetujuPenguji({request, user}: RouteConfig): Promise<any> {
        let cek = null;
        cek = await knex("ujian_terbuka_penguji")
            .where("ujianId", request.params['id'])
            .where("nidn", user.nidn)

        return success(cek)
    }

    static async show({request}: RouteConfig): Promise<any> {
        const ujian = await knex("ujian_terbuka")
            .where("id", request.params['id'])
            .first()
        if (ujian == null) return error("Ujian tidak ditemukan")
        const penguji = await knex("ujian_terbuka_penguji")
            .where("ujianId", ujian.id)
        return success({
            ujian: ujian,
            penguji: penguji
        })
    }

    static async lihatNilaiPenguji({request}: RouteConfig): Promise<any> {
        const ujian = await knex("ujian_terbuka")
            .where("id", request.params['id'])
            .first()
        if (ujian == null) return error("Ujian tidak ditemukan")
        const penguji = await knex("ujian_terbuka_penguji")
            .where("ujianId", ujian.id)
            .where("nidn", request.params['nidn'])
        return success({
            ujian: ujian,
            penguji: penguji
        })
    }

    static async store({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nim, "Mengajukan Seminar Disertasi")

        const bimbingan = await knex("bimbingan")
            .where("nim", user.nim)
            .where("tujuanBimbingan", "ujianTerbuka")
            .where("status", Constants.bimbingan.selesai)
        if (bimbingan.length < 4) return error("Ujian Terbuka dapat diajukan setelah minimal 2 kali bimbingan dengan masing - masing pembimbing")

        let ujian = await knex("ujian_terbuka")
            .where("nim", user.nim)
            .whereNotIn("status", [Constants.ujian.selesai, Constants.ujian.ditolak])
            .first()

        if (ujian != null) {
            if (
                ujian.status != Constants.ujian.selesai
                && ujian.status != Constants.ujian.ditolak
                && ujian.status != Constants.ujian.tidakLulus
            ) return error("Ujian sedang diajukan")
        }

        let ujianTertutup = await knex("ujian_tertutup")
            .where("nim", user.nim)
            .where("status", Constants.ujian.selesai)
            .first()
        if (ujianTertutup == null) return error("Ujian Tertutup belum selesai")

        const getSemesterAktif = await Services.getSemesterAktif()

        let ujianPayload = {
            nim: user.nim,
            semester: getSemesterAktif.data[0].kode_semester,
            nama: user.nama,
            kodeProdi: user.kodeProdi,
            judul: request.body["judul"],
            status: Constants.ujian.diajukan,
            createdAt: now(),
            updatedAt: now()
        }

        for (let x of Object.keys(request.body)) {
            if (x != "judul") {
                const file = request.body[x]
                ujianPayload = Object.assign(ujianPayload, {
                    [x]: await FileManager.createFile(file.content, "ujian-terbuka", file.ext)
                })
            }
        }

        const ujianId = (await knex("ujian_terbuka").insert(ujianPayload))[0]

        const dospem = await knex("pembimbing")
            .where("nim", user.nim)

        for (let x of dospem) await knex("ujian_terbuka_pembimbing_status")
            .insert({
                ujianId: ujianId,
                nidn: x.nidn,
                nama: x.nama,
                status: 0
            })

        return success()
    }

    static async reject({request, user, mode}: RouteConfig): Promise<any> {
        if (mode == Constants.dosen) await createLog(user.nidn, "Menolak Ujian Terbuka")
        if (mode == Constants.prodi) await createLog(user.kodeProdi, "Menolak Ujian Terbuka")

        const ujian = await knex("ujian_terbuka")
            .where("id", request.params['id'])
            .first()
        if (ujian == null) return error("Ujian Terbuka tidak ditemukan")
        await knex("ujian_terbuka")
            .where("id", request.params['id'])
            .update({
                status: Constants.ujian.ditolak,
                pesan: request.body['pesan'],
                updatedAt: now()
            })
        return success()
    }

    static async finishing({request, user}: RouteConfig): Promise<any> {
        await createLog(user.kodeProdi, "Menerbitkan SK Ujian Terbuka")
        const ujian = await knex("ujian_terbuka")
            .where("id", request.params['id'])
            .first()
        if (ujian == null) return error("Ujian Terbuka tidak ditemukan")
        const sk = request.body['sk']
        await knex("ujian_terbuka")
            .where("id", request.params['id'])
            .update({
                noSk: request.body['noSk'],
                sk: await FileManager.createFile(sk.content, "ujian-terbuka", sk.ext),
                status: Constants.ujian.skDiterbitkan,
                pesan: request.body['pesan'],
                updatedAt: now()
            })
        return success()
    }

    static async scoring({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nidn, "Menilai Ujian Terbuka")
        const ujian = await knex("ujian_terbuka")
            .where("id", request.params['id'])
            .first()
        if (ujian == null) return error("Ujian Terbuka tidak ditemukan")
        await knex("ujian_terbuka_penguji")
            .where("ujianId", ujian.id)
            .where("nidn", user.nidn)
            .update({
                status: 1,
                skorUnsur1: request.body['skorUnsur1'],
                skorUnsur2: request.body['skorUnsur2'],
                skorUnsur3: request.body['skorUnsur3'],
                skorUnsur4: request.body['skorUnsur4'],
                nilai: request.body['nilai'],
                lulus: request.body['lulus']
            })
        const dataPenguji = await knex("ujian_terbuka_penguji")
            .where("ujianId", ujian.id)
            .where("status", 1)

        if (dataPenguji.length == 7) {
            let lulus = 0
            let status;
            let nilai = 0;
            for (let x of dataPenguji) {
                if (x.lulus == 1) lulus += 1
                nilai += x.nilai;
            }
            if (lulus >= 7) status = Constants.ujian.selesai;
            else status = Constants.ujian.tidakLulus;

            await knex("ujian_terbuka")
                .where("id", request.params['id'])
                .update({
                    status: status,
                    nilai: nilai / 7,
                    updatedAt: now()
                });

            if (status == Constants.ujian.selesai) {
                await knex("progress")
                    .where("nim", ujian.nim)
                    .update({progress: Constants.progress.s3.ujianTerbuka})
            }
        }
        return success()
    }

    static async acc({request, user, mode}: RouteConfig): Promise<any> {
        const sempro = await knex("ujian_terbuka")
            .where("id", request.params['id'])
            .first()
        if (sempro == null) return error("Ujian Terbuka tidak ditemukan")

        switch (mode) {
            case Constants.dosen:
                await createLog(user.nidn, "Menyetujui Ujian Terbuka")
                await knex("ujian_terbuka_pembimbing_status")
                    .where("ujianId", sempro.id)
                    .where("nidn", user.nidn)
                    .update({status: 1})
                const total = (await knex("ujian_terbuka_pembimbing_status")
                    .where("ujianId", sempro.id)
                    .where("status", 1)).length
                if (total == 2) await knex("ujian_terbuka")
                    .where("id", sempro.id)
                    .update({
                        pesan: request.body['pesan'],
                        status: Constants.ujian.diSetujuiDospem,
                        updatedAt: now()
                    })
                break;
            case Constants.prodi:
                console.log(request.body)
                await createLog(user.kodeProdi, "Menyetujui Ujian Terbuka")
                await knex("ujian_terbuka")
                    .where("id", sempro.id)
                    .update({
                        status: Constants.ujian.diSetujuiProdi,
                        waktu: request.body['waktu'],
                        tempat: request.body['tempat'],
                        updatedAt: now()
                    })
                const penguji = request.body['penguji']
                    .map((x: any) => Object.assign(x, {
                        status: 0,
                        nilai: 0,
                        ujianId: sempro.id
                    }))
                await knex("ujian_terbuka_penguji").insert(penguji)
                break;
        }
        return success()
    }
}