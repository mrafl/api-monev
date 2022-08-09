import {RouteConfig} from "../utilities/router";
import {knex} from "../utilities/knex";
import {createLog, error, now, success} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Constants from "../utilities/constants";
import Services from "../utilities/Services";

export default class MahasiswaController {

    static async index({user}: RouteConfig): Promise<any> {
        const mahasiswa = await knex("penelitian")
            .where("kodeProdi", user.kodeProdi)
            .where("status", Constants.penelitian.selesai)
            .orderBy("status", "asc")

        return success(mahasiswa)
    }

    static async update({request, user}: RouteConfig): Promise<any> {
        let penelitian: any = null;

        penelitian = await knex("penelitian")
            .where("kodeProdi", user.kodeProdi)
            .where("status", Constants.penelitian.selesai)
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

        await createLog(user.kodeProdi, "Mengubah Dosen Pembimbing")

        return success()
    }

}