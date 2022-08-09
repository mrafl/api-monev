const Constants = {
    mhs: 9,
    dosen: 8,
    prodi: 2,
    fakultas: 3,
    pps: 25,
    penelaah: 26,
    superadmin: 27,
    all: [9, 8, 2, 3, 25],
    progress: {
        none: 0,
        mengajukanTopik: 1,
        komprehensif: 2,
        sempro: 3,
        bimbingan: 4,
        s2: {
            ujian: 5,
            yudisium: 6
        },
        s3: {
            telaah: 5,
            semdis: 6,
            ujianTertutup: 7,
            ujianTerbuka: 8
        }
    },
    penelitian: {
        ditolak: -1,
        diajukan: 0,
        diAccProdi: 1,
        selesai: 2
    },
    komprehensif: {
        ditolak: -1,
        diajukan: 0,
        diAccProdi: 1,
        diNilaiDosen: 2,
        selesai: 3
    },
    sempro: {
        tidakLulus: -2,
        ditolak: -1,
        diajukan: 0,
        diSetujuiDospem: 1,
        diSetujuiProdi: 2,
        sedangDinilai: 3,
        selesai: 4
    },
    semdis: {
        tidakLulus: -2,
        ditolak: -1,
        diajukan: 0,
        diSetujuiDospem: 1,
        diSetujuiProdi: 2,
        sedangDinilai: 3,
        selesai: 4
    },
    bimbingan: {
        ditolak: -1,
        diajukan: 0,
        disetujui: 1,
        selesai: 2
    },
    pembimbing: {
        diajukan: 0,
        disetujui: 1,
        selesai: 2
    },
    yudisium: {
        ditolak: -1,
        diajukan: 0,
        disetujui: 1
    },
    ujianTesis: {
        ditolak: -1,
        diajukan: 0,
        disetujuiPembimbing: 1,
        diSetujuiProdi: 2,
        dalamProses: 3,
        dalamPerbaikan: 4,
        telahDiperbaiki: 5,
        selesai: 6
    },
    telaah: {
        ditolak: -1,
        diajukan: 0,
        diAccProdi: 1,
        diAccPPs: 2,
        diAccPenelaah: 3,
        diperbaiki: 4,
        selesai: 5
    },
    ujian: {
        tidakLulus: -2,
        ditolak: -1,
        diajukan: 0,
        diSetujuiDospem: 1,
        diSetujuiProdi: 2,
        sedangDinilai: 3,
        selesai: 4,
        skDiterbitkan: 5
    }
}

export default Constants