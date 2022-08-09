import {RouteConfig} from "../utilities/router";
import Constants from "../utilities/constants";
import {knex} from "../utilities/knex";
import {createLog, error, now, success} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Services from "../utilities/Services";

export default class KomprehensifController {

    static async index({user, mode}: RouteConfig): Promise<any> {
        let komprehensif = null;
        switch (mode) {
            case Constants.mhs:
                komprehensif = await knex("komprehensif")
                    .where("nim", user.nim)
                    .orderBy("status", "desc")
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.prodi:
                komprehensif = await knex("komprehensif")
                    .where("kodeProdi", user.kodeProdi)
                    .orderBy("createdAt", "desc")
                break;
            case Constants.dosen:
                komprehensif = await knex("komprehensif")
                    .where("nidnPenguji", user.nidn)
                    .whereNotIn("status", [Constants.komprehensif.diajukan])
                    .orderBy("waktuUjian", "desc")
                break;
        }
        return success(komprehensif)
    }

    static async show({request}: RouteConfig): Promise<any> {
        const komprehensif = await knex("komprehensif")
            .where("id", request.params["id"])
            .first()
        if (komprehensif == null) return error("Ujian Komprehensif tidak ditemukan")
        return success(komprehensif)
    }

    static async store({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nim, "Mengajukan Bimbingan Komprehensif")
        let komprehensif = await knex("komprehensif")
            .where("nim", user.nim)
            .whereNotIn("status", [Constants.komprehensif.selesai, Constants.komprehensif.ditolak])
            .orderBy("updatedAt", "desc")
            .first()

        if (komprehensif != null) {
            if (komprehensif.status == Constants.komprehensif.diajukan) return error("Penelitian sedang diajukan")
            if (komprehensif.status == Constants.komprehensif.diAccProdi) return error("Penelitian telah di setujui oleh program studi")
            if (komprehensif.status == Constants.komprehensif.selesai) return error("Penelitian telah selesai")
            if (komprehensif.status == Constants.komprehensif.diNilaiDosen && komprehensif.lulus == true) return error("Penelitian sedang berlangsung")
        }

        const getSemesterAktif = await Services.getSemesterAktif()

        await knex("komprehensif").insert({
            nim: user.nim,
            semester: getSemesterAktif.data[0].kode_semester,
            nama: user.nama,
            kodeProdi: user.kodeProdi,
            jenjang: user.jenjangProdi,
            status: 0,
            sks: request.body["sks"],
            ipk: request.body["ipk"],
            createdAt: now(),
            updatedAt: now()
        })

        return success()
    }

    static async reject({request, user}: RouteConfig): Promise<any> {
        await createLog(user.kodeProdi, "Menolak Bimbingan Komprehensif")
        const komprehensif = await knex("komprehensif")
            .where("id", request.params['id'])
            .where("status", Constants.komprehensif.diajukan)
            .first()
        if (komprehensif == null) return error("Komprehensif tidak ditemukan")
        await knex("komprehensif")
            .where("id", request.params['id'])
            .update({
                status: Constants.komprehensif.ditolak,
                lulus: 0,
                pesan: request.body['pesan'],
                updatedAt: now()
            })
        return success()
    }

    static async acc({request, user}: RouteConfig): Promise<any> {
        await createLog(user.kodeProdi, "Menyetujui Bimbingan Komprehensif")
        const komprehensif = await knex("komprehensif")
            .where("id", request.params['id'])
            .where("status", Constants.komprehensif.diajukan)
            .where("kodeProdi", user.kodeProdi)
            .first()
        if (komprehensif == null) return error("Komprehensif tidak ditemukan")
        await knex("komprehensif")
            .where("id", request.params['id'])
            .update({
                status: Constants.komprehensif.diAccProdi,
                nidnPenguji: request.body['nidnPenguji'],
                namaPenguji: request.body['namaPenguji'],
                waktuUjian: request.body['waktuUjian'],
                tempatUjian: request.body['tempatUjian'],
                updatedAt: now()
            })
        return success()
    }

    static async scoring({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nidn, "Menilai Bimbingan Komprehensif")
        const komprehensif = await knex("komprehensif")
            .where("id", request.params['id'])
            .where("nidnPenguji", user.nidn)
            .where("status", Constants.komprehensif.diAccProdi)
            .first()
        if (komprehensif == null) return error("Komprehensif tidak ditemukan")
        await knex("komprehensif")
            .where("id", request.params['id'])
            .update({
                status: Constants.komprehensif.diNilaiDosen,
                lulus: request.body['lulus'],
                updatedAt: now()
            })
        return success()
    }

    static async finishing({request, user}: RouteConfig): Promise<any> {
        await createLog(user.kodeProdi, "Menyelesaikan Bimbingan Komprehensif")
        const komprehensif = await knex("komprehensif")
            .where("id", request.params['id'])
            .where("status", Constants.komprehensif.diNilaiDosen)
            .where("lulus", true)
            .where("kodeProdi", user.kodeProdi)
            .first()
        if (komprehensif == null) return error("Komprehensif tidak ditemukan")
        const file = request.body['file']
        await knex("komprehensif")
            .where("id", request.params['id'])
            .update({
                status: Constants.komprehensif.selesai,
                sk: await FileManager.createFile(file.content, "komprehensif", file.ext),
                updatedAt: now()
            })
        await knex("progress")
            .where("nim", komprehensif.nim)
            .update({progress: Constants.progress.komprehensif})
        return success()
    }
}