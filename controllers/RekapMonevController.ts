import {RouteConfig} from "../utilities/router";
import Constants from "../utilities/constants";
import {knex} from "../utilities/knex";
import {error, now, success, tanggalExpired} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Services from "../utilities/Services";
import {promises} from "dns";

export default class RekapMonevController {
    static async index(): Promise<any>
    {

    }

    static async show({request}: RouteConfig): Promise<any>
    {
        const monev = await knex("monev")
            .where("kodeProdi", request.params["kodeProdi"])
            .where("semester", request.params["semester"])
            .select(
                'namaDosen',
                'kodeProdi',
                'kodeSeksiMK',
                'namaMK',
                'pertemuanKe',
                'rps'
            )
            .count('pertemuanKe', {as: 'totalKehadiran'})
            .groupBy("kodeSeksiMK")
        if (monev == null) return error("Monev Tidak Ditemukan")
        return success(monev)
    }

    static async cekPertemuan({request}: RouteConfig): Promise<any>
    {
        const cekPertemuan = await knex("monev")
            .where("pertemuanKe", request.params["pertemuanKe"])
            .where("semester", request.params["semester"])
            .where("kodeSeksiMK", request.params["kodeSeksi"])
            .first()

        let hasilCek = null
        if (cekPertemuan == null){
            hasilCek = 0
        } else {
            hasilCek = 1
        }
        return success(hasilCek)
    }

    static async cekMataKuliahPerDosen({request}: RouteConfig): Promise<any>{
        const cekMKDosen = await knex("monev")
            .where("semester", request.params["semester"])
            .where("namaDosen", request.params["namaDosen"])
            .groupBy("kodeSeksiMK")
            .select(
                'kodeSeksiMK',
                'namaMK',
                'rps'
            )

        const namaDosen = request.params["namaDosen"]
        let data = null

        data = {
            namaDosen: namaDosen,
            mataKuliahDosen: cekMKDosen
        }
        return success(data)
    }

    static async getMataKuliahPerProdi({request}: RouteConfig): Promise<any>{
        const cekMataKuliah = await knex("monev")
            .where("semester", request.params["semester"])
            .where("kodeProdi", request.params["kodeProdi"])
            .groupBy("kodeSeksiMK")
            .count('pertemuanKe', {as: 'totalKehadiran'})
            .select(
                'kodeSeksiMK',
                'kodeMK',
                'jumlahSKS',
                'namaMK',
                'namaDosen',
                'rps',
            )
            .orderBy("namaDosen", "asc")

        return success(cekMataKuliah)

    }
}