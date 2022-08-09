import {RouteConfig} from "../utilities/router";
import {knex} from "../utilities/knex";
import {createLog, error, now, success} from "../utilities/Utils";
import FileManager from "../utilities/FileManager";
import Constants from "../utilities/constants";

export default class DirekturPascaController {

    static async rekapitulasi({user, mode}: RouteConfig): Promise<any> {
        const penelitian = await knex("penelitian")
            .orderBy("updatedAt", "desc")

        const penelitianDiajukan = await knex("penelitian")
            .where("status", Constants.penelitian.diajukan)
            .orderBy("updatedAt", "desc")

        const penelitianDisetujuiProdi = await knex("penelitian")
            .where("status", Constants.penelitian.diAccProdi)
            .orderBy("updatedAt", "desc")

        const penelitianDisetujuiPascasarjana = await knex("penelitian")
            .where("status", Constants.penelitian.selesai)
            .orderBy("updatedAt", "desc")

        const penelitianDitolak = await knex("penelitian")
            .where("status", Constants.penelitian.ditolak)
            .orderBy("updatedAt", "desc")

        const komprehensif = await knex("komprehensif")
            .orderBy("createdAt", "desc")

        const komprehensifDiajukan = await knex("komprehensif")
            .where("status", Constants.komprehensif.diajukan)
            .orderBy("createdAt", "desc")

        const komprehensifDisetujuiProdi = await knex("komprehensif")
            .where("status", Constants.komprehensif.diAccProdi)
            .orderBy("createdAt", "desc")

        const komprehensifDinilaiDosen = await knex("komprehensif")
            .where("status", Constants.komprehensif.diNilaiDosen)
            .orderBy("createdAt", "desc")

        const komprehensifDitolak = await knex("komprehensif")
            .where("status", Constants.komprehensif.ditolak)
            .orderBy("createdAt", "desc")

        const komprehensifSelesai = await knex("komprehensif")
            .where("status", Constants.komprehensif.selesai)
            .orderBy("createdAt", "desc")

        const seminarProposal = await knex("seminar_proposal")
            .orderBy("updatedAt", "desc")

        const seminarProposalDiajukan = await knex("seminar_proposal")
            .where("status", Constants.sempro.diajukan)
            .orderBy("updatedAt", "desc")

        const seminarProposalDisetujuiDospem = await knex("seminar_proposal")
            .where("status", Constants.sempro.diSetujuiDospem)
            .orderBy("updatedAt", "desc")

        const seminarProposalDisetujuiProdi = await knex("seminar_proposal")
            .where("status", Constants.sempro.diSetujuiProdi)
            .orderBy("updatedAt", "desc")

        const seminarProposalSedangDinilai = await knex("seminar_proposal")
            .where("status", Constants.sempro.sedangDinilai)
            .orderBy("updatedAt", "desc")

        const seminarProposalDitolak = await knex("seminar_proposal")
            .where("status", Constants.sempro.ditolak)
            .orderBy("updatedAt", "desc")

        const seminarProposalSelesai = await knex("seminar_proposal")
            .where("status", Constants.sempro.selesai)
            .orderBy("updatedAt", "desc")

        const seminarProposalTidakLulus = await knex("seminar_proposal")
            .where("status", Constants.sempro.tidakLulus)
            .orderBy("updatedAt", "desc")

        const ujianTesis = await knex("ujian_tesis")
            .orderBy("updatedAt", "desc")

        const ujianTesisDiajukan = await knex("ujian_tesis")
            .where("status", Constants.ujianTesis.diajukan)
            .orderBy("updatedAt", "desc")

        const ujianTesisDisetujuiDospem = await knex("ujian_tesis")
            .where("status", Constants.ujianTesis.disetujuiPembimbing)
            .orderBy("updatedAt", "desc")

        const ujianTesisDisetujuiProdi = await knex("ujian_tesis")
            .where("status", Constants.ujianTesis.diSetujuiProdi)
            .orderBy("updatedAt", "desc")

        const ujianTesisDalamProses = await knex("ujian_tesis")
            .where("status", Constants.ujianTesis.dalamProses)
            .orderBy("updatedAt", "desc")

        const ujianTesisDalamPerbaikan = await knex("ujian_tesis")
            .where("status", Constants.ujianTesis.dalamPerbaikan)
            .orderBy("updatedAt", "desc")

        const ujianTesisTelahDiperbaiki = await knex("ujian_tesis")
            .where("status", Constants.ujianTesis.telahDiperbaiki)
            .orderBy("updatedAt", "desc")

        const ujianTesisDitolak = await knex("ujian_tesis")
            .where("status", Constants.ujianTesis.ditolak)
            .orderBy("updatedAt", "desc")

        const ujianTesisSelesai = await knex("ujian_tesis")
            .where("status", Constants.ujianTesis.selesai)
            .orderBy("updatedAt", "desc")

        const telaahDisertasi = await knex("telaah_disertasi")
            .orderBy("updatedAt", "desc")

        const telaahDisertasiDiajukan = await knex("telaah_disertasi")
            .where("status", Constants.telaah.diajukan)
            .orderBy("updatedAt", "desc")

        const telaahDisertasiDisetujuiProdi = await knex("telaah_disertasi")
            .where("status", Constants.telaah.diAccProdi)
            .orderBy("updatedAt", "desc")

        const telaahDisertasiDisetujuiPascasarjana = await knex("telaah_disertasi")
            .where("status", Constants.telaah.diAccPPs)
            .orderBy("updatedAt", "desc")

        const telaahDisertasiDisetujuiPenelaah = await knex("telaah_disertasi")
            .where("status", Constants.telaah.diAccPenelaah)
            .orderBy("updatedAt", "desc")

        const telaahDisertasiDiperbaiki = await knex("telaah_disertasi")
            .where("status", Constants.telaah.diperbaiki)
            .orderBy("updatedAt", "desc")

        const telaahDisertasiDitolak = await knex("telaah_disertasi")
            .where("status", Constants.ujianTesis.selesai)
            .orderBy("updatedAt", "desc")

        const telaahDisertasiSelesai = await knex("telaah_disertasi")
            .where("status", Constants.telaah.selesai)
            .orderBy("updatedAt", "desc")

        const semdis = await knex("seminar_disertasi")
            .orderBy("updatedAt", "desc")

        const semdisDiajukan = await knex("seminar_disertasi")
            .where("status", Constants.semdis.diajukan)
            .orderBy("updatedAt", "desc")

        const semdisDisetujuiDospem = await knex("seminar_disertasi")
            .where("status", Constants.semdis.diSetujuiDospem)
            .orderBy("updatedAt", "desc")

        const semdisDisetujuiProdi = await knex("seminar_disertasi")
            .where("status", Constants.semdis.diSetujuiProdi)
            .orderBy("updatedAt", "desc")

        const semdisSedangDinilai = await knex("seminar_disertasi")
            .where("status", Constants.semdis.sedangDinilai)
            .orderBy("updatedAt", "desc")

        const semdisDitolak = await knex("seminar_disertasi")
            .where("status", Constants.semdis.ditolak)
            .orderBy("updatedAt", "desc")

        const semdisTidakLulus = await knex("seminar_disertasi")
            .where("status", Constants.semdis.tidakLulus)
            .orderBy("updatedAt", "desc")

        const semdisSelesai = await knex("seminar_disertasi")
            .where("status", Constants.semdis.selesai)
            .orderBy("updatedAt", "desc")

        const ujianTertutup = await knex("ujian_tertutup")
            .orderBy("updatedAt", "desc")

        const ujianTertutupDiajukan = await knex("ujian_tertutup")
            .where("status", Constants.ujian.diajukan)
            .orderBy("updatedAt", "desc")

        const ujianTertutupDisetujuiDospem = await knex("ujian_tertutup")
            .where("status", Constants.ujian.diSetujuiDospem)
            .orderBy("updatedAt", "desc")

        const ujianTertutupDisetujuiProdi = await knex("ujian_tertutup")
            .where("status", Constants.ujian.diSetujuiProdi)
            .orderBy("updatedAt", "desc")

        const ujianTertutupSedangDinilai = await knex("ujian_tertutup")
            .where("status", Constants.ujian.sedangDinilai)
            .orderBy("updatedAt", "desc")

        const ujianTertutupSelesai = await knex("ujian_tertutup")
            .where("status", Constants.ujian.selesai)
            .orderBy("updatedAt", "desc")

        const ujianTertutupSkDiterbitkan = await knex("ujian_tertutup")
            .where("status", Constants.ujian.skDiterbitkan)
            .orderBy("updatedAt", "desc")

        const ujianTertutupTidakLulus = await knex("ujian_tertutup")
            .where("status", Constants.ujian.tidakLulus)
            .orderBy("updatedAt", "desc")

        const ujianTertutupDitolak = await knex("ujian_tertutup")
            .where("status", Constants.ujian.ditolak)
            .orderBy("updatedAt", "desc")

        const ujianTerbuka = await knex("ujian_terbuka")
            .orderBy("updatedAt", "desc")

        const ujianTerbukaDiajukan = await knex("ujian_terbuka")
            .where("status", Constants.ujian.diajukan)
            .orderBy("updatedAt", "desc")

        const ujianTerbukaDisetujuiDospem = await knex("ujian_terbuka")
            .where("status", Constants.ujian.diSetujuiDospem)
            .orderBy("updatedAt", "desc")

        const ujianTerbukaDisetujuiProdi = await knex("ujian_terbuka")
            .where("status", Constants.ujian.diSetujuiProdi)
            .orderBy("updatedAt", "desc")

        const ujianTerbukaSedangDinilai = await knex("ujian_terbuka")
            .where("status", Constants.ujian.sedangDinilai)
            .orderBy("updatedAt", "desc")

        const ujianTerbukaSelesai = await knex("ujian_terbuka")
            .where("status", Constants.ujian.selesai)
            .orderBy("updatedAt", "desc")

        const ujianTerbukaSkDiterbitkan = await knex("ujian_terbuka")
            .where("status", Constants.ujian.skDiterbitkan)
            .orderBy("updatedAt", "desc")

        const ujianTerbukaTidakLulus = await knex("ujian_terbuka")
            .where("status", Constants.ujian.tidakLulus)
            .orderBy("updatedAt", "desc")

        const ujianTerbukaDitolak = await knex("ujian_terbuka")
            .where("status", Constants.ujian.ditolak)
            .orderBy("updatedAt", "desc")


        return success({
            penelitian: {
                title: 'Topik Penelitian',
                link: 'penelitian',
                all: penelitian,
                mengajukan: penelitianDiajukan,
                disetujuiProdi: penelitianDisetujuiProdi,
                disetujuiPascasarjana: penelitianDisetujuiPascasarjana,
                ditolak: penelitianDitolak
            },
            ujianKomprehensif: {
                title: 'Ujian Komprehensif',
                link: 'ujianKomprehensif',
                all: komprehensif,
                mengajukan: komprehensifDiajukan,
                disetujuiProdi: komprehensifDisetujuiProdi,
                dinilaiDosen: komprehensifDinilaiDosen,
                ditolak: komprehensifDitolak,
                selesai: komprehensifSelesai
            },
            seminarProposal: {
                title: 'Seminar Proposal',
                link: 'seminarProposal',
                all: seminarProposal,
                mengajukan: seminarProposalDiajukan,
                disetujuiDospem: seminarProposalDisetujuiDospem,
                disetujuiProdi: seminarProposalDisetujuiProdi,
                sedangDinilai: seminarProposalSedangDinilai,
                ditolak: seminarProposalDitolak,
                selesai: seminarProposalSelesai,
                tidakLulus: seminarProposalTidakLulus
            },
            ujianTesis: {
                title: 'Ujian Tesis',
                link: 'ujianTesis',
                all: ujianTesis,
                mengajukan: ujianTesisDiajukan,
                disetujuiDospem: ujianTesisDisetujuiDospem,
                disetujuiProdi: ujianTesisDisetujuiProdi,
                dalamProses: ujianTesisDalamProses,
                dalamPerbaikan: ujianTesisDalamPerbaikan,
                telahDiperbaiki: ujianTesisTelahDiperbaiki,
                ditolak: ujianTesisDitolak,
                selesai: ujianTesisSelesai
            },
            yudisium: {
                title: 'Yudisium',
                link: 'yudisium',
            },
            telaahDisertasi: {
                title: 'Telaah Disertasi',
                link: 'telaahDisertasi',
                all: telaahDisertasi,
                mengajukan: telaahDisertasiDiajukan,
                disetujuiProdi: telaahDisertasiDisetujuiProdi,
                disetujuiPascasarjana: telaahDisertasiDisetujuiPascasarjana,
                disetujuiPenelaah: telaahDisertasiDisetujuiPenelaah,
                diperbaiki: telaahDisertasiDiperbaiki,
                ditolak: telaahDisertasiDitolak,
                selesai: telaahDisertasiSelesai,
            },
            seminarKelayakanDisertasi: {
                title: 'Seminar Kelayakan Disertasi',
                link: 'seminarKelayakanDisertasi',
                all: semdis,
                mengajukan: semdisDiajukan,
                disetujuiDospem: semdisDisetujuiDospem,
                disetujuiProdi: semdisDisetujuiProdi,
                sedangDinilai: semdisSedangDinilai,
                ditolak: semdisDitolak,
                tidakLulus: semdisTidakLulus,
                selesai: semdisSelesai
            },
            ujianTertutup: {
                title: 'Ujian Tertutup',
                link: 'ujianTertutup',
                all: ujianTertutup,
                mengajukan: ujianTertutupDiajukan,
                disetujuiDospem: ujianTertutupDisetujuiDospem,
                disetujuiProdi: ujianTertutupDisetujuiProdi,
                sedangDinilai: ujianTertutupSedangDinilai,
                selesai: ujianTertutupSelesai,
                skDiterbitkan: ujianTertutupSkDiterbitkan,
                tidakLulus: ujianTertutupTidakLulus,
                ditolak: ujianTertutupDitolak,
            },
            ujianTerbuka: {
                title: 'Ujian Terbuka',
                link: 'ujianTerbuka',
                all: ujianTerbuka,
                mengajukan: ujianTerbukaDiajukan,
                disetujuiDospem: ujianTerbukaDisetujuiDospem,
                disetujuiProdi: ujianTerbukaDisetujuiProdi,
                sedangDinilai: ujianTerbukaSedangDinilai,
                selesai: ujianTerbukaSelesai,
                skDiterbitkan: ujianTerbukaSkDiterbitkan,
                tidakLulus: ujianTerbukaTidakLulus,
                ditolak: ujianTerbukaDitolak,
            }

        })
    }
}