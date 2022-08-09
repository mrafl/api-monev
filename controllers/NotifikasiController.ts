import {RouteConfig} from "../utilities/router";
import {knex} from "../utilities/knex";
import {createLog, error, now, success} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Constants from "../utilities/constants";
import Services from "../utilities/Services";

export default class NotifikasiController {

    static async penelitian({request, user, mode}: RouteConfig): Promise<any> {
        let penelitian = null;
        switch (mode) {
            case Constants.mhs:
                penelitian = await knex("penelitian")
                    .where("nim", user.nim)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.prodi:
                penelitian = await knex("penelitian")
                    .where("kodeProdi", user.kodeProdi)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.pps:
                penelitian = await knex("penelitian")
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
        }
        if (penelitian != null) {
            return success(penelitian.length)
        } else {
            return success(penelitian)
        }
    }

    static async komprehensif({request, user, mode}: RouteConfig): Promise<any> {
        let komprehensif = null;
        switch (mode) {
            case Constants.mhs:
                komprehensif = await knex("komprehensif")
                    .where("nim", user.nim)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.prodi:
                komprehensif = await knex("komprehensif")
                    .where("kodeProdi", user.kodeProdi)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.dosen:
                komprehensif = await knex("komprehensif")
                    .where("nidnPenguji", user.nidn)
                    .where("status", request.params["status"])
                    .orderBy("waktuUjian", "desc")
                break;
        }
        if (komprehensif != null) {
            return success(komprehensif.length)
        } else {
            return success(komprehensif)
        }

    }

    static async sempro({request, user, mode}: RouteConfig): Promise<any> {
        let sempro = null
        switch (mode) {
            case Constants.mhs:
                sempro = await knex("seminar_proposal")
                    .where("nim", user.nim)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.prodi:
                sempro = await knex("seminar_proposal")
                    .where("kodeProdi", user.kodeProdi)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc");
                break;
        }

        if (sempro != null) {
            return success(sempro.length)
        } else {
            return success(sempro)
        }
    }

    static async semproPenguji({user}: RouteConfig): Promise<any> {
        let sempro = null
        sempro = await knex("seminar_proposal")
            .where("status", Constants.sempro.diSetujuiProdi)
            .whereIn("id",
                knex("seminar_proposal_penguji")
                    .where("nidn", user.nidn)
                    .select("semproId")
            ).orderBy("updatedAt", "desc");

        if (sempro != null) {
            return success(sempro.length)
        } else {
            return success(sempro)
        }
    }

    static async semproPembimbing({user}: RouteConfig): Promise<any> {
        let sempro = null
        sempro = await knex("seminar_proposal")
            .where("status", Constants.sempro.diajukan)
            .whereIn("id",
                knex("seminar_proposal_pembimbing_status")
                    .where("nidn", user.nidn)
                    .select("semproId")
            ).orderBy("updatedAt", "desc")

        if (sempro != null) {
            return success(sempro.length)
        } else {
            return success(sempro)
        }
    }

    static async bimbingan({request, user, mode}: RouteConfig): Promise<any> {
        let bimbingan = null;
        switch (mode) {
            case Constants.mhs:
                bimbingan = await knex("bimbingan")
                    .where("nim", user.nim)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.dosen:
                bimbingan = await knex("bimbingan")
                    .where("nidnPembimbing", user.nidn)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
        }
        if (bimbingan != null) {
            return success(bimbingan.length)
        } else {
            return success(bimbingan)
        }
    }

    static async ujianTesis({request, user, mode}: RouteConfig): Promise<any> {
        let ujian = null
        switch (mode) {
            case Constants.mhs:
                ujian = await knex("ujian_tesis")
                    .where("nim", user.nim)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.prodi:
                ujian = await knex("ujian_tesis")
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc");
                break;
        }
        if (ujian != null) {
            return success(ujian.length)
        } else {
            return success(ujian)
        }
    }

    static async ujianTesisPembimbing({user}: RouteConfig): Promise<any> {
        let ujian = null
        ujian = await knex("ujian_tesis")
            .where("status", Constants.ujianTesis.diajukan)
            .whereIn("id",
                knex("ujian_tesis_pembimbing_status")
                    .where("nidn", user.nidn)
                    .select("tesisId")
            ).orderBy("createdAt", "desc");
        if (ujian != null) {
            return success(ujian.length)
        } else {
            return success(ujian)
        }
    }

    static async ujianTesisPenguji({user}: RouteConfig): Promise<any> {
        let ujian = null
        ujian = await knex("ujian_tesis")
            .where("status", Constants.ujianTesis.diSetujuiProdi)
            .whereIn("id",
                knex("ujian_tesis_penguji")
                    .where("nidn", user.nidn)
                    .select("tesisId")
            ).orderBy("createdAt", "desc");
        if (ujian != null) {
            return success(ujian.length)
        } else {
            return success(ujian)
        }
    }

    static async yudisium({request, user, mode}: RouteConfig): Promise<any> {
        let yudisium = null
        switch (mode) {
            case Constants.mhs:
                yudisium = await knex("yudisium")
                    .where("nim", user.nim)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.pps:
                yudisium = await knex("yudisium")
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.prodi:
                yudisium = await knex("yudisium")
                    .where("kodeProdi", user.kodeProdi)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;

        }
        if (yudisium != null) {
            return success(yudisium.length)
        } else {
            return success(yudisium)
        }
    }

    static async telaah({request, user, mode}: RouteConfig): Promise<any> {
        let telaah = null;
        switch (mode) {
            case Constants.mhs:
                telaah = await knex("telaah_disertasi")
                    .where("nim", user.nim)
                    .where("status", request.params["status"])
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
                    .where("status", request.params["status"])
                break;
            case Constants.prodi:
                telaah = await knex("telaah_disertasi")
                    .where("kodeProdi", user.kodeProdi)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.pps:
                telaah = await knex("telaah_disertasi")
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.penelaah:
                telaah = await knex("telaah_disertasi")
                    .where("idPenelaah", user.id)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;

        }
        if (telaah != null) {
            return success(telaah.length)
        } else {
            return success(telaah)
        }
    }

    static async semdis({request, user, mode}: RouteConfig): Promise<any> {
        let semdis = null
        switch (mode) {
            case Constants.mhs:
                semdis = await knex("seminar_disertasi")
                    .where("nim", user.nim)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.prodi:
                semdis = await knex("seminar_disertasi")
                    .where("kodeProdi", user.kodeProdi)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc");
                break;
        }
        if (semdis != null) {
            return success(semdis.length)
        } else {
            return success(semdis)
        }
    }

    static async semdisPembimbing({request, user}: RouteConfig): Promise<any> {
        let semdis = null
        semdis = await knex("seminar_disertasi")
            .where("status", Constants.semdis.diajukan)
            .whereIn("id",
                knex("seminar_disertasi_pembimbing_status")
                    .where("nidn", user.nidn)
                    .select("seminarId")
            ).orderBy("createdAt", "desc");
        if (semdis != null) {
            return success(semdis.length)
        } else {
            return success(semdis)
        }
    }

    static async semdisPenguji({request, user}: RouteConfig): Promise<any> {
        let semdis = null
        semdis = await knex("seminar_disertasi")
            .where("status", Constants.semdis.diSetujuiProdi)
            .whereIn("id",
                knex("seminar_disertasi_penguji")
                    .where("nidn", user.nidn)
                    .select("seminarId")
            ).orderBy("createdAt", "desc");
        if (semdis != null) {
            return success(semdis.length)
        } else {
            return success(semdis)
        }
    }

    static async ujianTertutup({request, user, mode}: RouteConfig): Promise<any> {
        let ujian = null
        switch (mode) {
            case Constants.mhs:
                ujian = await knex("ujian_tertutup")
                    .where("nim", user.nim)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.prodi:
                ujian = await knex("ujian_tertutup")
                    .where("kodeProdi", user.kodeProdi)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc");
                break;
        }
        if (ujian != null) {
            return success(ujian.length)
        } else {
            return success(ujian)
        }
    }

    static async ujianTertutupPembimbing({user}: RouteConfig): Promise<any> {
        let ujian = null
        ujian = await knex("ujian_tertutup")
            .where("status", Constants.ujian.diajukan)
            .whereIn("id",
                knex("ujian_tertutup_pembimbing_status")
                    .where("nidn", user.nidn)
                    .select("ujianId")
            ).orderBy("createdAt", "desc");
        if (ujian != null) {
            return success(ujian.length)
        } else {
            return success(ujian)
        }
    }

    static async ujianTertutupPenguji({user}: RouteConfig): Promise<any> {
        let ujian = null
        ujian = await knex("ujian_tertutup")
            .where("status", Constants.ujian.diSetujuiProdi)
            .orWhere("status", Constants.ujian.selesai)
            .whereIn("id",
                knex("ujian_tertutup_penguji")
                    .where("nidn", user.nidn)
                    .select("ujianId")
            ).orderBy("createdAt", "desc");
        if (ujian != null) {
            return success(ujian.length)
        } else {
            return success(ujian)
        }
    }

    static async ujianTerbuka({request, user, mode}: RouteConfig): Promise<any> {
        let ujian = null
        switch (mode) {
            case Constants.mhs:
                ujian = await knex("ujian_terbuka")
                    .where("nim", user.nim)
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.dosen:
                const bimbingan = await knex("ujian_terbuka")
                    .where("status", request.params["status"])
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
                    .where("status", request.params["status"])
                    .orderBy("updatedAt", "desc");
                break;
        }
        if (ujian != null) {
            return success(ujian.length)
        } else {
            return success(ujian)
        }
    }

    static async ujianTerbukaPembimbing({user}: RouteConfig): Promise<any> {
        let ujian = null
        ujian = await knex("ujian_terbuka")
            .where("status", Constants.ujian.diajukan)
            .whereIn("id",
                knex("ujian_terbuka_pembimbing_status")
                    .where("nidn", user.nidn)
                    .select("ujianId")
            ).orderBy("createdAt", "desc");
        if (ujian != null) {
            return success(ujian.length)
        } else {
            return success(ujian)
        }
    }

    static async ujianTerbukaPenguji({user}: RouteConfig): Promise<any> {
        let ujian = null
        ujian = await knex("ujian_terbuka")
            .where("status", Constants.ujian.diSetujuiProdi)
            .whereIn("id",
                knex("ujian_terbuka_penguji")
                    .where("nidn", user.nidn)
                    .select("ujianId")
            ).orderBy("createdAt", "desc");
        if (ujian != null) {
            return success(ujian.length)
        } else {
            return success(ujian)
        }
    }

}