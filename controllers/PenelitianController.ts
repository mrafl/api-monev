import {RouteConfig} from "../utilities/router";
import {knex} from "../utilities/knex";
import {createLog, error, now, success} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Constants from "../utilities/constants";
import Services from "../utilities/Services";

export default class PenelitianController {

    static async index({user, mode}: RouteConfig): Promise<any> {
        let penelitian = null;
        switch (mode) {
            case Constants.mhs:
                penelitian = await knex("penelitian")
                    .where("nim", user.nim)
                    .orderBy("status", "desc")
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.prodi:
                penelitian = await knex("penelitian")
                    .where("kodeProdi", user.kodeProdi)
                    .orderBy("status", "asc")
                    .orderBy("createdAt", "desc")
                break;
            case Constants.pps:
                penelitian = await knex("penelitian")
                    .where("status", Constants.penelitian.diAccProdi)
                    .orWhere("status", Constants.penelitian.selesai)
                    .orWhere("status", Constants.penelitian.ditolak)
                    .orderBy("status", "asc")
                    .orderBy("updatedAt", "desc")
        }
        return success(penelitian)
    }

    static async show({request}: RouteConfig): Promise<any> {
        const penelitian = await knex("penelitian")
            .where("id", request.params["id"])
            .first()
        if (penelitian == null) return error("Penelitian tidak ditemukan")
        const pembimbing = await knex("pembimbing")
            .where("nim", penelitian.nim)

        return success({
            penelitian: penelitian,
            pembimbing: pembimbing
        })
    }

    static async update({request}: RouteConfig): Promise<any> {
        const penelitian = await knex("penelitian")
            .where("id", request.params["id"])
            .first()
        if (penelitian == null) return error("Penelitian tidak ditemukan")

        for (let x of request.body['pembimbing']) {
            const totalMaxS2 = await knex("pembimbing")
                .where("nidn", x.nidn)
                .where("jenjang", "S2")
                .where("status", Constants.pembimbing.disetujui)
            const totalMaxS3 = await knex("pembimbing")
                .where("nidn", x.nidn)
                .where("jenjang", "S3")
                .where("status", Constants.pembimbing.disetujui)
            if (totalMaxS2.length >= 10 && totalMaxS3.length >= 10) return error(x.nama + " telah membimbing 10 mahasiswa. Silakan pilih dosen lain.")
        }

        const pembimbing = request.body['pembimbing']
            .map((x: any) => Object.assign(x, {
                semester: penelitian.semester,
                nim: penelitian.nim,
                jenjang: penelitian.jenjang,
                status: Constants.pembimbing.diajukan
            }))

        await knex("pembimbing")
            .where("nim", penelitian.nim)
            .delete()

        await knex("pembimbing").insert(pembimbing)
    }

    static async getDetailbyNIM({request}: RouteConfig): Promise<any> {
        const penelitian = await knex("penelitian")
            .where("nim", request.params["nim"])
            .whereNotIn("status", [Constants.penelitian.ditolak])
            .first()
        if (penelitian == null) return error("Penelitian tidak ditemukan")
        const pembimbing = await knex("pembimbing")
            .where("nim", penelitian.nim)

        return success({
            penelitian: penelitian,
            pembimbing: pembimbing
        })
    }

    static async store({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nim, "Mengajukan Topik Penelitian")
        let penelitian = await knex("penelitian")
            .where("nim", user.nim)
            .whereNotIn("status", [Constants.penelitian.selesai, Constants.penelitian.ditolak])
            .orderBy("updatedAt", "desc")
            .first()

        if (penelitian != null) {
            if (penelitian.status == Constants.penelitian.diajukan) return error("Penelitian sedang diajukan")
            if (penelitian.status == Constants.penelitian.diAccProdi) return error("Penelitian sedang diajukan")
            if (penelitian.status == Constants.penelitian.selesai) return error("Penelitian telah disetujui")
        }

        for (let x of request.body['pembimbing']) {
            const totalMaxS2 = await knex("pembimbing")
                .where("nidn", x.nidn)
                .where("jenjang", "S2")
                .where("status", Constants.pembimbing.disetujui)
            const totalMaxS3 = await knex("pembimbing")
                .where("nidn", x.nidn)
                .where("jenjang", "S3")
                .where("status", Constants.pembimbing.disetujui)
            if (totalMaxS2.length >= 10 && totalMaxS3.length >= 10) return error(x.nama + " telah membimbing 10 mahasiswa. Silakan pilih dosen lain.")
        }

        const file = request.body['file']

        const getSemesterAktif = await Services.getSemesterAktif()

        await knex("penelitian").insert({
            nim: user.nim,
            semester: getSemesterAktif.data[0].kode_semester,
            nama: user.nama,
            judul: request.body["judul"],
            file: await FileManager.createFile(file.content, "penelitian", file.ext),
            jenjang: user.jenjangProdi,
            status: 0,
            kodeProdi: user.kodeProdi,
            createdAt: now(),
            updatedAt: now()
        })

        const pembimbing = request.body['pembimbing']
            .map((x: any) => Object.assign(x, {
                nim: user.nim,
                semester: getSemesterAktif.data[0].kode_semester,
                jenjang: user.jenjangProdi,
                status: Constants.pembimbing.diajukan
            }))

        await knex("pembimbing").insert(pembimbing)

        return success()
    }

    static async reject({request, user}: RouteConfig): Promise<any> {
        await createLog(user.username, "Menolak Topik Penelitian")
        const penelitian = await knex('penelitian')
            .where('id', request.params['id'])
            .whereNotIn('status', [Constants.penelitian.selesai, Constants.penelitian.ditolak])
            .first()
        if (penelitian == null) return error("Penelitian tidak ditemukan")
        await knex("pembimbing")
            .where("nim", penelitian.nim)
            .delete()
        await knex("penelitian")
            .where("id", request.params['id'])
            .update({
                status: Constants.penelitian.ditolak,
                pesan: request.body['pesan']
            })
        return success()
    }

    static async acc({request, user, mode}: RouteConfig): Promise<any> {
        let penelitian: any = null;
        switch (mode) {
            case Constants.prodi:
                await createLog(user.kodeProdi, "Menyetujui Topik Penelitian")
                penelitian = await knex("penelitian")
                    .where("kodeProdi", user.kodeProdi)
                    .where("status", Constants.penelitian.diajukan)
                    .where("id", request.params['id'])
                    .first()
                if (penelitian == null) return error("Penelitian tidak ditemukan")

                await knex("penelitian")
                    .where("id", request.params['id'])
                    .update({
                        status: Constants.penelitian.diAccProdi,
                        updatedAt: now()
                    })

                for (let x of request.body['pembimbing']) {
                    const totalMaxS2 = await knex("pembimbing")
                        .where("nidn", x.nidn)
                        .where("jenjang", "S2")
                        .where("status", Constants.pembimbing.disetujui)
                    const totalMaxS3 = await knex("pembimbing")
                        .where("nidn", x.nidn)
                        .where("jenjang", "S3")
                        .where("status", Constants.pembimbing.disetujui)
                    if (totalMaxS2.length >= 10 && totalMaxS3.length >= 10) return error(x.nama + " telah membimbing 10 mahasiswa. Silakan pilih dosen lain.")

                }

                const pembimbing = request.body['pembimbing']
                    .map((x: any) => Object.assign(x, {
                        semester: penelitian.semester,
                        nim: penelitian.nim,
                        jenjang: penelitian.jenjang,
                        status: Constants.pembimbing.disetujui
                    }))

                await knex("pembimbing")
                    .where("nim", penelitian.nim)
                    .delete()

                await knex("pembimbing").insert(pembimbing)
                break;
            case Constants.pps:
                await createLog(user.username, "Menyetujui Topik Penelitian")
                penelitian = await knex("penelitian")
                    .where("status", Constants.penelitian.diAccProdi)
                    .where("id", request.params['id'])
                    .first()
                if (penelitian == null) return error("Penelitian tidak ditemukan")

                const file = request.body['file']
                await knex("penelitian")
                    .where("id", request.params['id'])
                    .update({
                        sk: await FileManager.createFile(file.content, "penelitian", file.ext),
                        status: Constants.penelitian.selesai,
                        updatedAt: now()
                    })

                await knex("progress")
                    .where("nim", penelitian.nim)
                    .update({progress: Constants.progress.mengajukanTopik})
        }

        return success()
    }
}