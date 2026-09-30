const { createRequire } = require("node:module");
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TANDAN = "[dummy]";

const MODEL = {
  liputan: "permohonanLiputan",
  media_partner: "permohonanMediaPartner",
  kerjasama: "permohonanKerjasama",
  peminjaman_podcast: "permohonanPeminjamanPodcast"
};

async function main() {
  let totalDummy = 0;
  let totalAsli = 0;

  for (const [jenis, model] of Object.entries(MODEL)) {
    const del = prisma[model];
    const semua = await del.count();
    const dummy = await del.count({ where: { catatanInternal: { contains: TANDAN } } });
    const asli = semua - dummy;
    totalDummy += dummy;
    totalAsli += asli;
    console.log(`${jenis.padEnd(20)} total ${String(semua).padStart(3)}  dummy ${String(dummy).padStart(3)}  non-dummy ${String(asli).padStart(3)}`);
  }

  console.log(`\nTOTAL dummy ${totalDummy}, non-dummy ${totalAsli}`);

  if (totalAsli > 0) {
    console.log("\nAda data NON-dummy. Contoh (tidak akan dihapus):");
    for (const [jenis, model] of Object.entries(MODEL)) {
      const rows = await prisma[model].findMany({
        where: { OR: [{ catatanInternal: null }, { catatanInternal: { not: { contains: TANDAN } } }] },
        take: 5,
        select: { nomorRujukan: true, namaAcara: true, catatanInternal: true, createdAt: true }
      });
      for (const row of rows) {
        console.log(`  ${jenis.padEnd(20)} ${row.nomorRujukan} ${String(row.namaAcara).slice(0, 26).padEnd(26)} catatan=${JSON.stringify(row.catatanInternal)} dibuat=${row.createdAt.toISOString().slice(0, 10)}`);
      }
    }
  }

  const liputan = await prisma.permohonanLiputan.count({ where: { waktuAcara: { not: null } } });
  console.log(`\nliputan dengan waktu_acara terisi: ${liputan} / ${await prisma.permohonanLiputan.count()}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
