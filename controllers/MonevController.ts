import {RouteConfig} from "../utilities/router";
import {knex} from "../utilities/knex";
import {error, now, success} from "../utilities/Utils";
import Services from "../utilities/Services";

export default class MonevController {
    static async index(): Promise<any> {
        let monev = null;
        monev = await knex("monev")
        return success(monev)
    }

    static async store({request}: RouteConfig): Promise<any> {
        await knex("monev").insert({
            semester: request.body["semester"],
            waktu: request.body["waktu"],
            nim_pj: request.body["nim_pj"],
            nama_pj: request.body["nama_pj"],
            hp_pj: request.body["hp_pj"],
            prodi_pj: request.body["prodi_pj"],
            kodeProdi: request.body["kodeProdi"],
            kodeSeksiMK: request.body["kodeSeksiMK"],
            kodeMK: request.body["kodeMK"],
            namaMK: request.body["namaMK"],
            jumlahSKS: request.body["jumlahSKS"],
            jumlahMahasiswa: request.body["jumlahMahasiswa"],
            namaDosen: request.body["namaDosen"],
            rps: request.body["rps"],
            pertemuanKe: request.body["pertemuanKe"],
            tanggalPertemuan: request.body["tanggalPertemuan"],
            platform: request.body["platform"],
            linkPlatform: request.body["linkPlatform"],
            pokokBahasan: request.body["pokokBahasan"],
            keterangan: request.body["keterangan"],
            createdAt: now(),
            updatedAt: now()
        })

        return success()
    }

    static async getMonevProdi({request}: RouteConfig): Promise<any> {
        const monev = await knex("monev")
            .where("kodeProdi", request.params["kodeProdi"])
        if (monev == null) return error("Monev Tidak Ditemukan")
        return success(monev)
    }

    static async getMonevProdiPerSemester({request}: RouteConfig): Promise<any> {
        const monev = await knex("monev")
            .where("kodeProdi", request.params["kodeProdi"])
            .where("semester", request.params["semester"])
        if (monev == null) return error("Monev Tidak Ditemukan")
        return success(monev)
    }

    static async getMonevProdiPerSemesterPerWaktu({request}: RouteConfig): Promise<any> {
        const monev = await knex("monev")
            .where("kodeProdi", request.params["kodeProdi"])
            .where("semester", request.params["semester"])
            .where("waktu", request.params["waktu"])
        if (monev == null) return error("Monev Tidak Ditemukan")
        return success(monev)
    }

    static async showMonevMahasiswa({request}: RouteConfig): Promise<any> {
        const monev = await knex("monev")
            .where("nim_pj", request.params["nim"])
        if (monev == null) return error("Monev Tidak Ditemukan")
        return success(monev)
    }

    static async showMonevMataKuliah({request}: RouteConfig): Promise<any> {
        const monev = await knex("monev")
            .where("kodeSeksiMK", request.params["kodeSeksi"])
            .where("semester", request.params["semester"])
        if (monev == null) return error("Monev Tidak Ditemukan")
        return success(monev)
    }

    static async getMataKuliah({request}: RouteConfig): Promise<any> {
        return Services.getMataKuliah(request.params["kodeSeksi"], request.params["semester"])
    }

    static async getDataMahasiswa({request}: RouteConfig): Promise<any> {
        return Services.getDataMahasiswa(request.params["nim"])
    }
}