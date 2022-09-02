import {RouteConfig} from "../utilities/router";
import Constants from "../utilities/constants";
import {knex} from "../utilities/knex";
import {error, now, success, tanggalExpired} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Services from "../utilities/Services";

export default class RekapMonevController {
    static async index(): Promise<any> {

    }

    static async show({request}: RouteConfig): Promise<any> {
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
}