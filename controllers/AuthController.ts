import {RouteConfig} from "../utilities/router";
import Services from "../utilities/Services";
import {createLog, encrypt, error, success} from "../utilities/Utils";
import {knex} from "../utilities/knex";
import Constants from "../utilities/constants";

export default class AuthController {

    static async userLogs({user, mode}: RouteConfig): Promise<any> {
        let identifier = ""
        switch (mode) {
            case Constants.mhs:
                identifier = user.nim;
                break;
            case Constants.dosen:
                identifier = user.nidn;
                break;
            case Constants.prodi:
                identifier = user.kodeProdi;
                break;
            case Constants.pps:
                identifier = user.username;
                break;
            case Constants.fakultas:
                identifier = user.kodeFakultas;
                break;
        }

        const logs = await knex("user_logs")
            .where("identifier", user.nim)
            .orderBy("createdAt", "desc")

        return success(logs)
    }

    static async login({request}: RouteConfig): Promise<any> {
        const {username, password} = request.body;
        let response;

        const user = await knex("akun_pasca")
            .where("username", username)
            .first()

        if (user == null) {
            const user = await Services.login(username, password)
            if (user.status == 400) return error(user.msg)
            delete user.msg

            response = Object.assign(user, {
                userPayload: await Services.getUserDetail(username, user.Authorization, Number.parseInt(user.mode)),
                semesterSaatIni: await Services.getSemesterAktif()
            })
        } else {
            if (encrypt(password) != user.password) return error("Password salah")
            const token = encrypt(user.id.toString())
            await knex("token_pasca").insert({userId: user.id, token: token})
            response = {
                username: username,
                mode: user.mode,
                nama: user.name,
                kelamin: "0",
                unit: "     ",
                Authorization: token,
                msg: "",
                userPayload: user,
                semesterSaatIni: await Services.getSemesterAktif()
            }
        }

        await createLog(username, "Login Aplikasi")
        return success(response)
    }
}