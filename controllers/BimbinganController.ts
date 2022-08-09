import {RouteConfig} from "../utilities/router";
import Constants from "../utilities/constants";
import {knex} from "../utilities/knex";
import {createLog, error, now, success, tanggalExpired} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Services from "../utilities/Services";

export default class BimbinganController {

    static async index({user, mode}: RouteConfig): Promise<any> {
        let bimbingan = null;
        switch (mode) {
            case Constants.mhs:
                bimbingan = await knex("bimbingan")
                    .where("nim", user.nim)
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.dosen:
                bimbingan = await knex("bimbingan")
                    .where("nidnPembimbing", user.nidn)
                    .orderBy("updatedAt", "desc")
                break;
        }
        return success(bimbingan)
    }

    static async cekPembimbing({request}: RouteConfig): Promise<any> {
        let pembimbing = null;
        pembimbing = await knex("pembimbing")
            .where("nim", request.params['nim'])

        return success(pembimbing)
    }

    static async history({request}: RouteConfig): Promise<any> {
        let history = null;
        history = await knex("bimbingan")
            .where("nim", request.params['nim'])
        return success(history)
    }

    static async jumlahBimbinganSelesai({request}: RouteConfig): Promise<any> {
        let history = null;
        history = await knex("bimbingan")
            .where("nim", request.params['nim'])
            .where("status", Constants.bimbingan.selesai)
        return success(history)
    }

    static async jumlahBimbinganSelesaiPerAlur({request}: RouteConfig): Promise<any> {
        let history = null;
        history = await knex("bimbingan")
            .where("nim", request.params['nim'])
            .where("tujuanBimbingan", request.params['alur'])
            .where("status", Constants.bimbingan.selesai)
        return success(history)
    }

    static async jumlahBimbinganDiajukan({request}: RouteConfig): Promise<any> {
        let history = null;
        history = await knex("bimbingan")
            .where("nim", request.params['nim'])
            .where("status", Constants.bimbingan.diajukan)
        return success(history)
    }

    static async jumlahBimbinganDiajukanPerAlur({request}: RouteConfig): Promise<any> {
        let history = null;
        history = await knex("bimbingan")
            .where("nim", request.params['nim'])
            .where("tujuanBimbingan", request.params['alur'])
            .where("status", Constants.bimbingan.diajukan)
        return success(history)
    }

    static async jumlahBimbinganDitolak({request}: RouteConfig): Promise<any> {
        let history = null;
        history = await knex("bimbingan")
            .where("nim", request.params['nim'])
            .where("status", Constants.bimbingan.ditolak)
        return success(history)
    }

    static async jumlahBimbinganDitolakPerAlur({request}: RouteConfig): Promise<any> {
        let history = null;
        history = await knex("bimbingan")
            .where("nim", request.params['nim'])
            .where("tujuanBimbingan", request.params['alur'])
            .where("status", Constants.bimbingan.ditolak)
        return success(history)
    }

    static async countPengajuanBimbingan({user}: RouteConfig): Promise<any> {
        let pengajuan = null;
        pengajuan = await knex("bimbingan")
            .where("nidnPembimbing", user.nidn)
            .where("status", 0)
        return success(pengajuan)
    }

    static async countBimbinganBerjalan({user}: RouteConfig): Promise<any> {
        let pengajuan = null;
        pengajuan = await knex("bimbingan")
            .where("nidnPembimbing", user.nidn)
            .where("status", 1)
        return success(pengajuan)
    }

    static async countBimbinganSelesai({user}: RouteConfig): Promise<any> {
        let pengajuan = null;
        pengajuan = await knex("bimbingan")
            .where("nidnPembimbing", user.nidn)
            .where("status", 2)
        return success(pengajuan)
    }

    static async countBimbinganDiTolak({user}: RouteConfig): Promise<any> {
        let pengajuan = null;
        pengajuan = await knex("bimbingan")
            .where("nidnPembimbing", user.nidn)
            .where("status", -1)
        return success(pengajuan)
    }

    static async cekMahasiswa({user}: RouteConfig): Promise<any> {
        let cekMahasiswa = null;
        cekMahasiswa = await knex("pembimbing")
            .where("nidn", user.nidn)
            .where("status", Constants.pembimbing.disetujui)
        return success(cekMahasiswa)
    }

    static async pembimbing({user}: RouteConfig): Promise<any> {
        const pembimbing = await knex("pembimbing")
            .where("nim", user.nim)
        return success(pembimbing)
    }

    static async store({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nim, "Mengajukan Bimbingan")
        const bimbingan = await knex("bimbingan")
            .where("nim", user.nim)
            .where("nidnPembimbing", request.body['nidnPembimbing'])
            .whereNotIn("status", [
                Constants.bimbingan.selesai,
                Constants.bimbingan.ditolak
            ]).orderBy("updatedAt", "desc")
            .first()
        if (bimbingan != null) return error("Bimbingan sedang dalam proses")

        const pembimbing = await knex("pembimbing")
            .where("nidn", request.body['nidnPembimbing'])
            .where("nim", user.nim)
            .first()
        if (pembimbing == null) return error("Pembimbing tidak ditemukan")

        const getSemesterAktif = await Services.getSemesterAktif()

        const file = request.body['file']

        await knex("bimbingan").insert({
            nim: user.nim,
            semester: getSemesterAktif.data[0].kode_semester,
            nama: user.nama,
            nidnPembimbing: pembimbing.nidn,
            namaPembimbing: pembimbing.nama,
            bab: request.body["bab"],
            tujuanBimbingan: request.body["tujuanBimbingan"],
            file: await FileManager.createFile(file.content, "bimbingan", file.ext),
            jenjang: user.jenjangProdi,
            status: 0,
            kodeProdi: user.kodeProdi,
            createdAt: now(),
            expiredAt: tanggalExpired(),
            updatedAt: now()
        })

        return success()
    }

    static async edit({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nidn, "Mengedit Bimbingan")
        const bimbingan = await knex("bimbingan")
            .where("nidnPembimbing", user.nidn)
            .where("id", request.params['id'])
            .first()
        if (bimbingan == null) return error("Bimbingan tidak ditemukan")
        await knex("bimbingan")
            .where("id", request.params['id'])
            .update({
                waktu: request.body['waktu'],
                tempat: request.body['tempat'],
                status: Constants.bimbingan.disetujui,
                updatedAt: now()
            })
        return success()
    }

    static async acc({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nidn, "Menyetujui Bimbingan")
        const bimbingan = await knex("bimbingan")
            .where("nidnPembimbing", user.nidn)
            .where("id", request.params['id'])
            .first()
        if (bimbingan == null) return error("Bimbingan tidak ditemukan")
        await knex("bimbingan")
            .where("id", request.params['id'])
            .update({
                waktu: request.body['waktu'],
                tempat: request.body['tempat'],
                status: Constants.bimbingan.disetujui,
                updatedAt: now()
            })
        return success()
    }

    static async reject({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nidn, "Menolak Bimbingan")
        const bimbingan = await knex("bimbingan")
            .where("nidnPembimbing", user.nidn)
            .where("id", request.params['id'])
            .first()
        if (bimbingan == null) return error("Bimbingan tidak ditemukan")
        await knex("bimbingan")
            .where("id", request.params['id'])
            .update({
                pesan: request.body['pesan'],
                status: Constants.bimbingan.ditolak,
                updatedAt: now()
            })
        return success()
    }

    static async finishing({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nidn, "Menyelesaikan Bimbingan")
        const bimbingan = await knex("bimbingan")
            .where("nidnPembimbing", user.nidn)
            .where("id", request.params['id'])
            .first()
        if (bimbingan == null) return error("Bimbingan tidak ditemukan")
        await knex("bimbingan")
            .where("id", request.params['id'])
            .update({
                catatan: request.body['catatan'],
                status: Constants.bimbingan.selesai,
                updatedAt: now()
            })
        await knex("progress")
            .where("nim", bimbingan.nim)
            .update({progress: Constants.progress.bimbingan})
        return success()
    }
}