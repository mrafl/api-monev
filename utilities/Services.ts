import axios from "axios";
import FormData from 'form-data';
import Constants from "./constants";
import {knex} from "./knex";

export default class Services {

    static parseurl(endpoint: string) {
        return process.env.SIAKAD_API + "/" + endpoint
    }

    static async login(username: string, password: string) {
        return this.post("siakad_api/api/as400/signin", {
            username: username,
            password: password
        })
    }

    static async getUserDetail(identifier: string, token: string, mode: number) {
        switch (mode) {
            case Constants.mhs:
                const userPayload = await this.get(`siakad_api/api/as400/dataMahasiswa/${identifier}/${token}`)
                return Object.assign(userPayload)
            case Constants.dosen:
                return this.get(`siakad_api/api/as400/dataDosen/${identifier}/${token}`)
            case Constants.prodi:
                return this.get(`siakad_api/api/as400/programStudi/${identifier}/${token}`)
            case Constants.fakultas:
                return this.get(`siakad_api/api/as400/fakultas/${identifier}/${token}`)
            default:
                return null
        }
    }

    static async getSemesterAktif(){
        return this.get(`siakad_api/api/as400/semesterAktif/13`)
    }

    static async getMataKuliah(kodeSeksi: string, semester: string){
        return this.get(`siakad_api/api/as400/kelasKuliah/${kodeSeksi}/${semester}/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Ijk5MDM4MTkwMzYiLCJuYW1hX3VzZXIiOiJJcnVsIFRyaXNoaW1hIEF0aWFzIiwia2VsYW1pbiI6IjAiLCJtb2RlX3VzZXIiOiI5IiwidW5pdF91c2VyIjoiICAgICAiLCJzdGF0dXNfdXNlciI6IjEifQ.rY7FmUd8qsVJBoJnRIzv2iMsEpBvdwYYJUCetgBeiS4`)
    }

    static async getDataMahasiswa(nim: string){
        return this.get(`siakad_api/api/as400/dataMahasiswa/${nim}/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Ijk5MDM4MTkwMzYiLCJuYW1hX3VzZXIiOiJJcnVsIFRyaXNoaW1hIEF0aWFzIiwia2VsYW1pbiI6IjAiLCJtb2RlX3VzZXIiOiI5IiwidW5pdF91c2VyIjoiICAgICAiLCJzdGF0dXNfdXNlciI6IjEifQ.rY7FmUd8qsVJBoJnRIzv2iMsEpBvdwYYJUCetgBeiS4`)
    }

    private static async post(endpoint: string, data: any) {
        const url = this.parseurl(endpoint)
        const form = new FormData()
        for (let x of Object.keys(data)) form.append(x, data[x])
        return (await axios.post(url, form, {headers: form.getHeaders()})).data
    }

    private static async get(endpoint: string, data = {}) {
        const url = this.parseurl(endpoint)
        return (await axios.get(url, data)).data
    }
}