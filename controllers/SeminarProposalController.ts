import {RouteConfig} from "../utilities/router";
import {knex} from "../utilities/knex";
import Constants from "../utilities/constants";
import {createLog, error, now, success} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Services from "../utilities/Services";

export default class SeminarProposalController {

    static async index({user, mode}: RouteConfig): Promise<any> {
        let sempro = null
        switch (mode) {
            case Constants.mhs:
                sempro = await knex("seminar_proposal")
                    .where("nim", user.nim)
                    .orderBy("updatedAt", "desc")
                break;
            case Constants.dosen:
                const bimbingan = await knex("seminar_proposal")
                    // .where("status", Constants.sempro.diajukan)
                    .whereIn("id",
                        knex("seminar_proposal_pembimbing_status")
                            .where("nidn", user.nidn)
                            .select("semproId")
                    ).orderBy("updatedAt", "desc");
                const pengujian = await knex("seminar_proposal")
                    .whereIn("id",
                        knex("seminar_proposal_penguji")
                            .where("nidn", user.nidn)
                            .select("semproId")
                    ).orderBy("updatedAt", "desc")
                    .whereNotIn("status", [Constants.sempro.diajukan, Constants.sempro.diSetujuiDospem])
                sempro = {
                    bimbingan: bimbingan,
                    pengujian: pengujian
                }
                break;
            case Constants.prodi:
                sempro = await knex("seminar_proposal")
                    .where("kodeProdi", user.kodeProdi)
                    .whereNotIn("status", [Constants.sempro.diajukan])
                    .orderBy("updatedAt", "desc");
                break;
        }
        return success(sempro)
    }

    static async cekSetujuPembimbing({request, user}: RouteConfig): Promise<any> {
        let cek = null;
        cek = await knex("seminar_proposal_pembimbing_status")
                .where("semproId", request.params['id'])
                .where("nidn", user.nidn)

        return success(cek)
    }

    static async cekSetujuPenguji({request, user}: RouteConfig): Promise<any> {
        let cek = null;
        cek = await knex("seminar_proposal_penguji")
            .where("semproId", request.params['id'])
            .where("nidn", user.nidn)

        return success(cek)
    }

    static async show({request}: RouteConfig): Promise<any> {
        const sempro = await knex("seminar_proposal")
            .where("id", request.params['id'])
            .first()
        if (sempro == null) return error("Seminar Proposal tidak ditemukan")
        const penguji = await knex("seminar_proposal_penguji")
            .where("semproId", sempro.id)
        const pembimbing = await knex("seminar_proposal_pembimbing_status")
            .where("semproId", sempro.id)
        return success({
            sempro: sempro,
            penguji: penguji,
            pembimbing: pembimbing
        })
    }

    static async lihatNilaiPenguji({request}: RouteConfig): Promise<any> {
        const sempro = await knex("seminar_proposal")
            .where("id", request.params['id'])
            .first()
        if (sempro == null) return error("Seminar Proposal tidak ditemukan")
        const penguji = await knex("seminar_proposal_penguji")
            .where("semproId", sempro.id)
            .where("nidn", request.params['nidn'])
        return success({
            sempro: sempro,
            penguji: penguji
        })
    }

    static async store({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nim, "Mengajukan Seminar Proposal")
        let sempro = await knex("seminar_proposal")
            .where("nim", user.nim)
            .whereNotIn("status", [Constants.sempro.selesai, Constants.sempro.ditolak])
            .first()

        if (sempro != null) {
            if (
                sempro.status != Constants.sempro.selesai
                && sempro.status != Constants.sempro.ditolak
                && sempro.status != Constants.sempro.tidakLulus
            ) return error("Penelitian sedang diajukan")
        }

        const bimbingan = await knex("bimbingan")
            .where("nim", user.nim)
            .where("tujuanBimbingan", "seminarProposal")
            .where("status", Constants.bimbingan.selesai)
        if (bimbingan.length < 6) return error("Seminar Proposal dapat diajukan setelah minimal 3 kali bimbingan dengan masing - masing pembimbing / promotor")

        const file = request.body['file']

        const getSemesterAktif = await Services.getSemesterAktif()

        const semproId = (await knex("seminar_proposal").insert({
            nim: user.nim,
            semester: getSemesterAktif.data[0].kode_semester,
            nama: user.nama,
            kodeProdi: user.kodeProdi,
            judul: request.body["judul"],
            file: await FileManager.createFile(file.content, "sempro", file.ext),
            status: Constants.sempro.diajukan,
            nilai: 0,
            jenjang: user.jenjangProdi,
            createdAt: now(),
            updatedAt: now()
        }))[0]

        const dospem = await knex("pembimbing")
            .where("nim", user.nim)

        for (let x of dospem) await knex("seminar_proposal_pembimbing_status")
            .insert({
                semproId: semproId,
                nidn: x.nidn,
                nama: x.nama,
                status: 0
            })

        return success()
    }

    static async reject({request, user, mode}: RouteConfig): Promise<any> {
        if (mode == Constants.dosen) await createLog(user.nidn, "Menolak Seminar Proposal")
        if (mode == Constants.prodi) await createLog(user.kodeProdi, "Menolak Seminar Proposal")

        const sempro = await knex("seminar_proposal")
            .where("id", request.params['id'])
            .first()
        if (sempro == null) return error("Seminar proposal tidak ditemukan")
        await knex("seminar_proposal")
            .where("id", request.params['id'])
            .update({
                status: Constants.sempro.ditolak,
                pesan: request.body['pesan'],
                updatedAt: now()
            })
        return success()
    }

    static async scoring({request, user}: RouteConfig): Promise<any> {
        await createLog(user.nidn, "Menilai Seminar Proposal")
        const sempro = await knex("seminar_proposal")
            .where("id", request.params['id'])
            .first()
        if (sempro == null) return error("Seminar proposal tidak ditemukan")
        await knex("seminar_proposal_penguji")
            .where("semproId", sempro.id)
            .where("nidn", user.nidn)
            .update({
                status: 1,
                skorUnsur1: request.body['skorUnsur1'],
                skorUnsur2: request.body['skorUnsur2'],
                skorUnsur3: request.body['skorUnsur3'],
                skorUnsur4: request.body['skorUnsur4'],
                skorUnsur5: request.body['skorUnsur5'],
                skorUnsur6: request.body['skorUnsur6'],
                skorUnsur7: request.body['skorUnsur7'],
                nilai: request.body['nilai'],
                lulus: request.body['lulus']
            })
        const dataPenguji = await knex("seminar_proposal_penguji")
            .where("semproId", sempro.id)
            .where("status", 1)

        if (dataPenguji.length == 5) {
            let lulus = 0
            let status;
            let nilai = 0;
            for (let x of dataPenguji) {
                if (x.lulus == 1) lulus += 1
                nilai += x.nilai;
            }
            if (lulus >= 3) status = Constants.sempro.selesai;
            else status = Constants.sempro.tidakLulus;

            await knex("seminar_proposal")
                .where("id", request.params['id'])
                .update({
                    status: status,
                    nilai: nilai / 5,
                    updatedAt: now()
                });

            if (status == Constants.sempro.selesai) {
                await knex("progress")
                    .where("nim", sempro.nim)
                    .update({progress: Constants.progress.sempro})
            }
        }
        return success()
    }

    static async acc({request, user, mode}: RouteConfig): Promise<any> {
        const sempro = await knex("seminar_proposal")
            .where("id", request.params['id'])
            .first()
        if (sempro == null) return error("Seminar proposal tidak ditemukan")

        switch (mode) {
            case Constants.dosen:
                await createLog(user.nidn, "Menyetujui Seminar Proposal")
                await knex("seminar_proposal_pembimbing_status")
                    .where("semproId", sempro.id)
                    .where("nidn", user.nidn)
                    .update({status: 1})
                const total = (await knex("seminar_proposal_pembimbing_status")
                    .where("semproId", sempro.id)
                    .where("status", 1)).length
                if (total == 2) await knex("seminar_proposal")
                    .where("id", sempro.id)
                    .update({
                        pesan: request.body['pesan'],
                        status: Constants.sempro.diSetujuiDospem,
                        updatedAt: now()
                    })
                break;
            case Constants.prodi:
                console.log(request.body)
                await createLog(user.kodeProdi, "Menyetujui Seminar Proposal")
                await knex("seminar_proposal")
                    .where("id", sempro.id)
                    .update({
                        status: Constants.sempro.diSetujuiProdi,
                        waktuUjian: request.body['waktuUjian'],
                        tempatUjian: request.body['tempatUjian'],
                        updatedAt: now()
                    })
                const penguji = request.body['penguji']
                    .map((x: any) => Object.assign(x, {
                        status: 0,
                        nilai: 0,
                        semproId: sempro.id
                    }))
                await knex("seminar_proposal_penguji").insert(penguji)
                break;
        }
        return success()
    }
}