import {RouteConfig} from "../utilities/router";
import {createLog, error, now, success, tanggalExpired} from "../utilities/Utils";
import {knex} from "../utilities/knex";
import Constants from "../utilities/constants";
import FileManager from "../utilities/FileManager";
import Services from "../utilities/Services";

export default class TelaahDisertasiController {

    static async index({user, mode}: RouteConfig): Promise<any> {
        let telaah = null;
        switch (mode) {
            case Constants.mhs:
                telaah = await knex("telaah_disertasi")
                    .where("nim", user.nim)
                    .orderBy("status", "desc")
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.dosen:
                const pembimbing = await knex("pembimbing")
                    .where("nidn", user.nidn)
                    .where("jenjang", "S3")
                    .first()
                if (pembimbing == null) return error("Mahasiswa Bimbingan Tidak Ditemukan")
                telaah = await knex("telaah_disertasi")
                    .where("nim", pembimbing.nim)
                break;
            case Constants.prodi:
                telaah = await knex("telaah_disertasi")
                    .where("kodeProdi", user.kodeProdi)
                    .orderBy("status", "desc")
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.pps:
                telaah = await knex("telaah_disertasi")
                    .where("status", Constants.telaah.diAccProdi)
                    .orWhere("status", Constants.telaah.diAccPPs)
                    .orderBy("status", "desc")
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.penelaah:
                telaah = await knex("telaah_disertasi")
                    .where("idPenelaah", user.id)
                    .where("status", Constants.telaah.diAccPPs)
                    .orWhere("status", Constants.telaah.diAccPenelaah)
                    .orderBy("status", "desc")
                    .orderBy("updatedAt", "desc")
                break;

        }
        return success(telaah)
    }

    static async store({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nim, "Mengajukan Telaah Disertasi")
        let telaah = await knex("telaah_disertasi")
            .where("nim", user.nim)
            .whereNotIn("status", [Constants.komprehensif.selesai, Constants.telaah.ditolak])
            .first()
        if (telaah != null) return error("Telaah disertasi sedang berlangsung")

        const file = request.body['fileDrafDisertasi']

        const getSemesterAktif = await Services.getSemesterAktif()

        await knex("telaah_disertasi").insert({
            nim: user.nim,
            semester: getSemesterAktif.data[0].kode_semester,
            nama: user.nama,
            kodeProdi: user.kodeProdi,
            fileDrafDisertasi: await FileManager.createFile(file.content, "telaah-disertasi", file.ext),
            status: Constants.telaah.diajukan,
            createdAt: now(),
            updatedAt: now()
        })

        return success()
    }

    static async acc({request, user, mode}: RouteConfig): Promise<any> {
        let telaah = await knex("telaah_disertasi")
            .where("id", request.params['id'])
            .first();
        if (telaah == null) return error("Telaah disertasi tidak ditemukan")

        switch (mode) {
            case Constants.prodi:
                const penelaah = await knex("akun_pasca")
                    .where("id", request.body.idPenelaah)
                    .where("mode", Constants.penelaah)
                    .first()
                if (penelaah == null) return error("Penelaah tidak ditemukan")

                await knex("telaah_disertasi")
                    .where("id", request.params['id'])
                    .update({
                        idPenelaah: request.body['idPenelaah'],
                        namaPenelaah: penelaah.name,
                        institusi: penelaah.instansi,
                        status: Constants.telaah.diAccProdi,
                        expiredAt: tanggalExpired(),
                        updatedAt: now()
                    })
                await createLog(user.kodeProdi, "Menetapkan Penelaah Telaah Disertasi")
                break;
            case Constants.pps:
                const sp = request.body.suratPengantar
                await knex("telaah_disertasi")
                    .where("id", request.params['id'])
                    .update({
                        suratPengantar: await FileManager.createFile(sp.content, "telaah-disertasi", sp.ext),
                        status: Constants.telaah.diAccPPs,
                        updatedAt: now()
                    })
                await createLog(user.username, "Membuat Surat Pengantar Telaah Disertasi")
                break;
            case Constants.penelaah:
                await knex("telaah_disertasi")
                    .where("id", request.params['id'])
                    .update({
                        catatan: request.body.catatan,
                        kesimpulan: request.body.kesimpulan,
                        status: Constants.telaah.diAccPenelaah,
                        updatedAt: now()
                    })
                await createLog(user.kodeProdi, "Menetapkan Penelaah Telaah Disertasi")
                break;
        }

        return success()
    }

    static async update({request, user}: RouteConfig): Promise<any> {
        const file = request.body.fileDrafDisertasi
        await knex("telaah_disertasi")
            .where("id", request.params['id'])
            .update({
                fileDrafDisertasi: await FileManager.createFile(file.content, "telaah-disertasi", file.ext),
                status: Constants.telaah.diperbaiki,
                updatedAt: now()
            })
        await createLog(user.nim, "Memperbaiki File Draf Disertasi")
        return success()
    }

    static async finishing({request, user}: RouteConfig): Promise<any> {
        const sk = request.body.sk
        await knex("telaah_disertasi")
            .where("id", request.params['id'])
            .update({
                sk: await FileManager.createFile(sk.content, "telaah-disertasi", sk.ext),
                status: Constants.telaah.selesai,
                updatedAt: now()
            })
        await knex("progress")
            .whereIn("nim", knex("telaah_disertasi")
                .where("id", request.params['id'])
                .select("nim")
            ).update({progress: Constants.progress.s2.yudisium})
        await createLog(user.kodeProdi, "Menerbitkan SK Bukti Telaah Disertasi")
        return success()
    }
}