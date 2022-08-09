import {RouteConfig} from "../utilities/router";
import {knex} from "../utilities/knex";
import {encrypt, error, now, success} from "../utilities/Utils";
import Constants from "../utilities/constants";

export default class AkunController {

    static async index({request}: RouteConfig): Promise<any> {
        const userType = (request.query.type ?? "").toString()
        const users = await knex("akun_pasca")
            .where("mode", userType)
            .where("mode", "<>", Constants.superadmin)
            .orderBy("name", "asc")
        return success(users)
    }

    static async store({request, user, mode}: RouteConfig): Promise<any> {
        const payload = request.body;
        const checkUser = await knex("akun_pasca")
            .where("username", payload.username)
            .first()
        if (checkUser != null) return error("Username telah terdaftar")
        payload.password = encrypt(payload.password)
        payload.createdAt = now()

        switch (mode) {
            case Constants.pps:
                payload.dibuatOleh = user.name;
                break;
            case Constants.prodi:
                payload.dibuatOleh = user.namaProdi;
                break;
        }

        await knex("akun_pasca").insert(payload)
        return success()
    }

    static async update({request}: RouteConfig): Promise<any> {
        const user = await knex("akun_pasca")
            .where("id", request.params['id'])
            .first()
        if (user == null) return error("Akun tidak ditemukan")
        let payload = {}
        if (request.body.name != undefined) payload = Object.assign(payload, {name: request.body.name})
        if (request.body.instansi != undefined) payload = Object.assign(payload, {instansi: request.body.instansi})
        if (request.body.email != undefined) payload = Object.assign(payload, {email: request.body.email})
        if (request.body.passNoEnc != undefined) payload = Object.assign(payload, {passNoEnc: request.body.passNoEnc})
        if (request.body.password != undefined) {
            payload = Object.assign(payload, {
                password: encrypt(request.body.password)
            })
        }
        await knex("akun_pasca")
            .where("id", request.params['id'])
            .update(payload)
        return success()
    }

    static async destroy({request}: RouteConfig): Promise<any> {
        await knex("akun_pasca")
            .where("id", request.params['id'])
            .delete();
        return success()
    }
}