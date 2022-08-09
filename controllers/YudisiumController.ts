import {RouteConfig} from "../utilities/router";
import {knex} from "../utilities/knex";
import Constants from "../utilities/constants";
import {createLog, error, now, success} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Services from "../utilities/Services";

export default class YudisiumController {

    static async index({user, mode}: RouteConfig): Promise<any> {
        let yudisium = null
        switch (mode) {
            case Constants.mhs:
                yudisium = await knex("yudisium")
                    .where("nim", user.nim)
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.pps:
                yudisium = await knex("yudisium")
                    .orderBy("status", "asc")
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.prodi:
                yudisium = await knex("yudisium")
                    .where("kodeProdi", user.kodeProdi)
                    .orderBy("status", "asc")
                    .orderBy("updatedAt", "desc")
                break;

        }
        return success(yudisium)
    }

    static async store({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nim, "Mengajukan Yudisium")
        const ujianTesis = await knex("ujian_tesis")
            .where("nim", user.nim)
            .where("status", Constants.ujianTesis.selesai)
            .first()

        if (ujianTesis == null) return error("Ujian Tesis Belum Selesai")

        const yudisium = await knex("yudisium")
            .where("nim", user.nim)
            .first()

        if (yudisium != null) return error("Yudisium telah diajukan")

        const getSemesterAktif = await Services.getSemesterAktif()

        let payload = {
            nim: user.nim,
            semester: getSemesterAktif.data[0].kode_semester,
            nama: user.nama,
            kodeProdi: user.kodeProdi,
            status: Constants.yudisium.diajukan,
            createdAt: now(),
            updatedAt: now(),
            skbp: ujianTesis.skbp,
            artikel: ujianTesis.artikel,
            tesis: ujianTesis.tesis
        }

        for (let x of Object.keys(request.body)) {
            const file = request.body[x]
            payload = Object.assign(payload, {
                [x]: await FileManager.createFile(file.content, "yudisium", file.ext)
            })
        }

        await knex("yudisium").insert(payload)
        return success()
    }

    static async reject({request, user, mode}: RouteConfig): Promise<any> {
        await createLog(user.username, "Menolak Yudisium")
        const yudisium = await knex("yudisium")
            .where("id", request.params['id'])
            .first()
        if (yudisium == null) return error("Yudisium tidak ditemukan")
        await knex("yudisium")
            .where("id", request.params['id'])
            .update({
                status: Constants.yudisium.ditolak,
                pesan: request.body['pesan'],
                updatedAt: now()
            })
        return success()
    }

    static async finishing({request, user}: RouteConfig): Promise<any> {
        await createLog(user.username, "Menyetujui Yudisium")
        const yudisium = await knex("yudisium")
            .where("id", request.params['id'])
            .first()
        if (yudisium == null) return error("Yudisium tidak ditemukan")
        const sk = await request.body['sk']
        await knex("yudisium")
            .where("id", request.params['id'])
            .update({
                updatedAt: now(),
                status: Constants.yudisium.disetujui,
                nomorSk: request.body['nomorSk'],
                sk: await FileManager.createFile(sk.content, "yudisium", sk.ext)
            })
        await knex("progress")
            .where("nim", yudisium.nim)
            .update({progress: Constants.progress.s2.yudisium})
        return success()
    }
}