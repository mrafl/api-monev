import {Express, Request} from "express"
import {error} from "./Utils";
import {knex} from "./knex";
import AuthController from "../controllers/AuthController";
import Services from "./Services";
import PenelitianController from "../controllers/PenelitianController";
import Constants from "./constants";
import KomprehensifController from "../controllers/KomprehensifController";
import SeminarProposalController from "../controllers/SeminarProposalController";
import BimbinganController from "../controllers/BimbinganController";
import YudisiumController from "../controllers/YudisiumController";
import UjianTesisController from "../controllers/UjianTesisController";
import AkunController from "../controllers/AkunController";
import TelaahDisertasiController from "../controllers/TelaahDisertasiController";
import SeminarDisertasiController from "../controllers/SeminarDisertasiController";
import UjianTertutupController from "../controllers/UjianTertutupController";
import UjianTerbukaController from "../controllers/UjianTerbukaController";
import DirekturPascaController from "../controllers/DirekturPascaController";
import MahasiswaController from "../controllers/MahasiswaController";
import NotifikasiController from "../controllers/NotifikasiController";

export interface RouteConfig {
    request: Request,
    user?: any,
    token?: string | null,
    mode?: number | null
}

export default class Router {
    private app: Express;

    private constructor(app: Express) {
        this.app = app;
    }

    static akunRouter(router: Router) {
        router.get("/akun", AkunController.index, [Constants.superadmin])
        router.post("/akun", AkunController.store, [Constants.superadmin])
        router.post("/akun/:id/edit", AkunController.update, [Constants.superadmin])
        router.post("/akun/:id/hapus", AkunController.destroy, [Constants.superadmin])
    }

    static mahasiswaRouter(router: Router) {
        router.get("/mahasiswa", MahasiswaController.index, [Constants.prodi])
        router.post("/mahasiswa/:id/edit", MahasiswaController.update, [Constants.prodi])
    }

    static notifikasiRouter(router: Router) {
        router.get("/notifikasi/penelitian/:status", NotifikasiController.penelitian, [Constants.mhs, Constants.prodi, Constants.dosen, Constants.pps])
        router.get("/notifikasi/komprehensif/:status", NotifikasiController.komprehensif, [Constants.mhs, Constants.prodi, Constants.dosen])
        router.get("/notifikasi/bimbingan/:status", NotifikasiController.bimbingan, [Constants.mhs, Constants.dosen])
        router.get("/notifikasi/sempro/:status", NotifikasiController.sempro, [Constants.mhs, Constants.prodi, Constants.pps])
        router.get("/notifikasi/sempro/pembimbing", NotifikasiController.semproPembimbing, [Constants.dosen])
        router.get("/notifikasi/sempro/penguji", NotifikasiController.semproPenguji, [Constants.dosen])
        router.get("/notifikasi/ujian/tesis/:status", NotifikasiController.ujianTesis, [Constants.mhs, Constants.dosen, Constants.prodi, Constants.pps])
        router.get("/notifikasi/ujian/tesis/pembimbing", NotifikasiController.ujianTesisPembimbing, [Constants.mhs, Constants.dosen, Constants.prodi, Constants.pps])
        router.get("/notifikasi/ujian/tesis/penguji", NotifikasiController.ujianTesisPenguji, [Constants.mhs, Constants.dosen, Constants.prodi, Constants.pps])
        router.get("/notifikasi/yudisium/:status", NotifikasiController.yudisium, [Constants.prodi, Constants.mhs, Constants.pps])
        router.get("/notifikasi/telaah/:status", NotifikasiController.telaah, [Constants.prodi, Constants.dosen, Constants.mhs, Constants.pps, Constants.penelaah])
        router.get("/notifikasi/semdis/:status", NotifikasiController.semdis, [Constants.mhs, Constants.prodi, Constants.pps])
        router.get("/notifikasi/semdis/pembimbing", NotifikasiController.semdisPembimbing, [Constants.dosen])
        router.get("/notifikasi/semdis/penguji", NotifikasiController.semdisPenguji, [Constants.dosen])
        router.get("/notifikasi/ujian/tertutup/:status", NotifikasiController.ujianTertutup, [Constants.mhs, Constants.prodi, Constants.pps])
        router.get("/notifikasi/ujian/tertutup/pembimbing", NotifikasiController.ujianTertutupPembimbing, [Constants.dosen])
        router.get("/notifikasi/ujian/tertutup/penguji", NotifikasiController.ujianTertutupPenguji, [Constants.dosen])
        router.get("/notifikasi/ujian/terbuka/:status", NotifikasiController.ujianTerbuka, [Constants.mhs, Constants.prodi, Constants.pps])
        router.get("/notifikasi/ujian/terbuka/pembimbing", NotifikasiController.ujianTerbukaPembimbing, [Constants.dosen])
        router.get("/notifikasi/ujian/terbuka/penguji", NotifikasiController.ujianTerbukaPenguji, [Constants.dosen])

    }

    static direkturPascasarjana(router: Router) {
        router.get("/direktur/rekapitulasi", DirekturPascaController.rekapitulasi, [Constants.pps])
    }

    static penelitianRouter(router: Router) {
        router.get("/penelitian/:id", PenelitianController.show, [Constants.mhs, Constants.prodi, Constants.dosen, Constants.pps])
        router.post("/penelitian/:id/edit", PenelitianController.update, [Constants.prodi])
        router.get("/penelitian/mahasiswa/:nim", PenelitianController.getDetailbyNIM, [Constants.mhs, Constants.prodi, Constants.dosen, Constants.pps])
        router.get("/penelitian", PenelitianController.index, [Constants.mhs, Constants.prodi, Constants.pps])
        router.post("/penelitian", PenelitianController.store, Constants.mhs)
        router.post("/penelitian/:id/setuju", PenelitianController.acc, [Constants.prodi, Constants.pps])
        router.post("/penelitian/:id/tolak", PenelitianController.reject, [Constants.prodi, Constants.pps])
    }

    static komprehensifRouter(router: Router) {
        router.get("/komprehensif", KomprehensifController.index, [Constants.mhs, Constants.prodi, Constants.dosen, Constants.pps])
        router.get("/komprehensif/:id", KomprehensifController.show, [Constants.mhs, Constants.prodi, Constants.dosen, Constants.pps])
        router.post("/komprehensif", KomprehensifController.store, Constants.mhs)
        router.post("/komprehensif/:id/setuju", KomprehensifController.acc, Constants.prodi)
        router.post("/komprehensif/:id/tolak", KomprehensifController.reject, Constants.prodi)
        router.post("/komprehensif/:id/nilai", KomprehensifController.scoring, Constants.dosen)
        router.post("/komprehensif/:id/selesai", KomprehensifController.finishing, Constants.prodi)
    }

    static semproRouter(router: Router) {
        router.get("/sempro", SeminarProposalController.index, [Constants.mhs, Constants.prodi, Constants.dosen, Constants.pps])
        router.get("/sempro/:id", SeminarProposalController.show)
        router.get("/sempro/:id/nidnPenguji/:nidn", SeminarProposalController.lihatNilaiPenguji)
        router.post("/sempro", SeminarProposalController.store, Constants.mhs)
        router.get("/sempro/cekSetuju/:id", SeminarProposalController.cekSetujuPembimbing, Constants.dosen)
        router.get("/sempro/cekSetujuPenguji/:id", SeminarProposalController.cekSetujuPenguji, Constants.dosen)
        router.post("/sempro/:id/setuju", SeminarProposalController.acc, [Constants.prodi, Constants.dosen])
        router.post("/sempro/:id/tolak", SeminarProposalController.reject, [Constants.prodi, Constants.dosen])
        router.post("/sempro/:id/nilai", SeminarProposalController.scoring, Constants.dosen)
    }

    static bimbinganRouter(router: Router) {
        router.get("/bimbingan", BimbinganController.index, [Constants.mhs, Constants.dosen])
        router.get("/bimbingan/pembimbing/:nim", BimbinganController.cekPembimbing)
        router.get("/bimbingan/history/:nim", BimbinganController.history, Constants.dosen)
        router.get("/bimbingan/bimbinganSelesai/:nim", BimbinganController.jumlahBimbinganSelesai, [Constants.mhs])
        router.get("/bimbingan/bimbinganSelesai/:alur/:nim", BimbinganController.jumlahBimbinganSelesaiPerAlur, [Constants.mhs])
        router.get("/bimbingan/bimbinganDiajukan/:nim", BimbinganController.jumlahBimbinganDiajukan, [Constants.mhs])
        router.get("/bimbingan/bimbinganDiajukan/:alur/:nim", BimbinganController.jumlahBimbinganDiajukanPerAlur, [Constants.mhs])
        router.get("/bimbingan/bimbinganDitolak/:nim", BimbinganController.jumlahBimbinganDitolak, [Constants.mhs])
        router.get("/bimbingan/bimbinganDitolak/:alur/:nim", BimbinganController.jumlahBimbinganDitolakPerAlur, [Constants.mhs])
        router.get("/bimbingan/pembimbing/cekMahasiswa", BimbinganController.cekMahasiswa, Constants.dosen)
        router.get("/bimbingan/pembimbing/countPengajuanBimbingan", BimbinganController.countPengajuanBimbingan, Constants.dosen)
        router.get("/bimbingan/pembimbing/countBimbinganBerjalan", BimbinganController.countBimbinganBerjalan, Constants.dosen)
        router.get("/bimbingan/pembimbing/countBimbinganSelesai", BimbinganController.countBimbinganSelesai, Constants.dosen)
        router.get("/bimbingan/pembimbing/countBimbinganDiTolak", BimbinganController.countBimbinganDiTolak, Constants.dosen)
        router.post("/bimbingan", BimbinganController.store, Constants.mhs)
        router.post("/bimbingan/:id/setuju", BimbinganController.acc, Constants.dosen)
        router.post("/bimbingan/:id/edit", BimbinganController.edit, Constants.dosen)
        router.post("/bimbingan/:id/tolak", BimbinganController.reject, Constants.dosen)
        router.post("/bimbingan/:id/selesai", BimbinganController.finishing, Constants.dosen)
    }

    static ujianTesisRouter(router: Router) {
        router.get("/ujian/tesis", UjianTesisController.index, [Constants.mhs, Constants.dosen, Constants.prodi, Constants.pps])
        router.get("/ujian/tesis/:id", UjianTesisController.show)
        router.get("/ujian/tesis/:id/nidnPenguji/:nidn", UjianTesisController.lihatNilaiPenguji)
        router.get("/ujian/tesis/cekSetuju/:id", UjianTesisController.cekSetujuPembimbing, Constants.dosen)
        router.get("/ujian/tesis/cekSetujuPenguji/:id", UjianTesisController.cekSetujuPenguji, Constants.dosen)
        router.post("/ujian/tesis", UjianTesisController.store, [Constants.mhs])
        router.post("/ujian/tesis/:id/setuju", UjianTesisController.acc, [Constants.dosen, Constants.prodi])
        router.post("/ujian/tesis/:id/tolak", UjianTesisController.reject, [Constants.dosen, Constants.prodi])
        router.post("/ujian/tesis/:id/perbarui", UjianTesisController.update, [Constants.mhs])
        router.post("/ujian/tesis/:id/nilai", UjianTesisController.scoring, Constants.dosen)
    }

    static yudisiumRouter(router: Router) {
        router.get("/yudisium", YudisiumController.index, [Constants.prodi, Constants.mhs, Constants.pps])
        router.post("/yudisium", YudisiumController.store, Constants.mhs)
        router.post("/yudisium/:id/sk", YudisiumController.finishing, Constants.pps)
        router.post("/yudisium/:id/tolak", YudisiumController.reject, Constants.pps)
    }

    static telaahDisertasiRouter(router: Router) {
        router.get("/telaah", TelaahDisertasiController.index, [Constants.prodi, Constants.dosen, Constants.mhs, Constants.pps, Constants.penelaah])
        router.post("/telaah", TelaahDisertasiController.store, Constants.mhs)
        router.post("/telaah/:id/setuju", TelaahDisertasiController.acc, [Constants.prodi, Constants.pps, Constants.penelaah])
        router.post("/telaah/:id/edit", TelaahDisertasiController.update, Constants.mhs)
        router.post("/telaah/:id/selesai", TelaahDisertasiController.finishing, Constants.prodi)
    }

    static seminarKelayakanDisertasiRouter(router: Router) {
        router.get("/semdis", SeminarDisertasiController.index, [Constants.mhs, Constants.prodi, Constants.dosen, Constants.pps])
        router.get("/semdis/:id", SeminarDisertasiController.show)
        router.get("/semdis/:id/nidnPenguji/:nidn", SeminarDisertasiController.lihatNilaiPenguji)
        router.post("/semdis", SeminarDisertasiController.store, Constants.mhs)
        router.get("/semdis/cekSetuju/:id", SeminarDisertasiController.cekSetujuPembimbing, Constants.dosen)
        router.get("/semdis/cekSetujuPenguji/:id", SeminarDisertasiController.cekSetujuPenguji, Constants.dosen)
        router.post("/semdis/:id/setuju", SeminarDisertasiController.acc, [Constants.prodi, Constants.dosen])
        router.post("/semdis/:id/tolak", SeminarDisertasiController.reject, [Constants.prodi, Constants.dosen])
        router.post("/semdis/:id/nilai", SeminarDisertasiController.scoring, Constants.dosen)
    }

    static ujianTertutupRouter(router: Router) {
        router.get("/ujian/tertutup", UjianTertutupController.index, [Constants.mhs, Constants.prodi, Constants.dosen, Constants.pps])
        router.get("/ujian/tertutup/:id", UjianTertutupController.show)
        router.get("/ujian/tertutup/:id/nidnPenguji/:nidn", UjianTertutupController.lihatNilaiPenguji)
        router.post("/ujian/tertutup", UjianTertutupController.store, Constants.mhs)
        router.get("/ujian/tertutup/cekSetuju/:id", UjianTertutupController.cekSetujuPembimbing, Constants.dosen)
        router.get("/ujian/tertutup/cekSetujuPenguji/:id", UjianTertutupController.cekSetujuPenguji, Constants.dosen)
        router.post("/ujian/tertutup/:id/setuju", UjianTertutupController.acc, [Constants.prodi, Constants.dosen])
        router.post("/ujian/tertutup/:id/tolak", UjianTertutupController.reject, [Constants.prodi, Constants.dosen])
        router.post("/ujian/tertutup/:id/nilai", UjianTertutupController.scoring, Constants.dosen)
    }

    static ujianTerbukaRouter(router: Router) {
        router.get("/ujian/terbuka", UjianTerbukaController.index, [Constants.mhs, Constants.prodi, Constants.dosen, Constants.pps])
        router.get("/ujian/terbuka/:id", UjianTerbukaController.show)
        router.get("/ujian/terbuka/:id/nidnPenguji/:nidn", UjianTerbukaController.lihatNilaiPenguji)
        router.post("/ujian/terbuka", UjianTerbukaController.store, Constants.mhs)
        router.get("/ujian/terbuka/cekSetuju/:id", UjianTerbukaController.cekSetujuPembimbing, Constants.dosen)
        router.get("/ujian/terbuka/cekSetujuPenguji/:id", UjianTerbukaController.cekSetujuPenguji, Constants.dosen)
        router.post("/ujian/terbuka/:id/setuju", UjianTerbukaController.acc, [Constants.prodi, Constants.dosen])
        router.post("/ujian/terbuka/:id/tolak", UjianTerbukaController.reject, [Constants.prodi, Constants.dosen])
        router.post("/ujian/terbuka/:id/nilai", UjianTerbukaController.scoring, Constants.dosen)
        router.post("/ujian/terbuka/:id/terbitkan-sk", UjianTerbukaController.finishing, Constants.prodi)
    }

    static route(app: Express) {
        const router = new Router(app)

        router.post("/masuk", AuthController.login)
        router.get("/pembimbing", BimbinganController.pembimbing, Constants.mhs)
        router.get("/logs", AuthController.userLogs, Constants.all)

        this.akunRouter(router)
        this.mahasiswaRouter(router)
        this.notifikasiRouter(router)
        this.direkturPascasarjana(router)

        this.penelitianRouter(router)
        this.komprehensifRouter(router)
        this.semproRouter(router)
        this.bimbinganRouter(router)

        // S2
        this.ujianTesisRouter(router)
        this.yudisiumRouter(router)

        // s3
        this.telaahDisertasiRouter(router)
        this.seminarKelayakanDisertasiRouter(router)
        this.ujianTertutupRouter(router)
        this.ujianTerbukaRouter(router)
    }

    private static async run(req: Request, action: (config: RouteConfig) => Promise<any>, mode?: any): Promise<any> {
        try {
            let user = null
            let token = null
            let pMode = null

            if (mode != null) {
                console.log("Parsing Auth")
                const auth = req.header("Authorization")
                if (auth == null) return error("Illegal Access!")

                const tokens = auth.split(":")
                if (tokens.length < 3) return error("Forbidden Access!")

                const payload = {
                    mode: Number.parseInt(tokens[0]),
                    identifier: tokens[1],
                    token: tokens[2]
                }

                if (mode instanceof Number && payload.mode != mode && mode != Constants.superadmin) return error("Forbidden Access")
                if (mode instanceof Array && !mode.includes(payload.mode) && !mode.includes(Constants.superadmin)) return error("Forbidden Access")

                console.log("Getting PPs")
                user = await knex("akun_pasca")
                    .join("token_pasca", "akun_pasca.id", "=", "token_pasca.userId")
                    .select("akun_pasca.*")
                    .where("token_pasca.token", payload.token)
                    .first()

                if (user == null) {
                    console.log("Getting User Detail")
                    user = await Services.getUserDetail(payload.identifier, payload.token, payload.mode)
                }

                if (user == null) return error("Forbidden Access!")
                if (user.status != undefined) {
                    if (user.status == false) return error(user.pesan)
                    user = user.isi[0]
                }

                console.log("Middleware Success")

                token = payload.token
                pMode = payload.mode
            }

            console.log("Executing Route")

            const result = await action({
                request: req,
                user: user,
                token: token,
                mode: pMode
            })

            console.log("Returning Result")
            return result
        } catch (e) {
            return error(e)
        }
    }

    get(pattern: string, action: (config: RouteConfig) => Promise<any>, mode?: any) {
        this.app.get(pattern, async (req, res) => {
            return res.status(200).json(await Router.run(req, action, mode))
        })
    }

    post(pattern: string, action: (config: RouteConfig) => Promise<any>, mode?: any) {
        this.app.post(pattern, async (req, res) => {
            return res.status(200).json(await Router.run(req, action, mode))
        })
    }
}