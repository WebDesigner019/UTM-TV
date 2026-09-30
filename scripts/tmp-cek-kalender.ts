import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");

loadEnvConfig(process.cwd());

async function main() {
  const { getKalenderPermohonan } = await import("@/lib/kalender");
  const { rentangGrid } = await import("@/lib/kalender-grid");

  const now = new Date();
  const events = await getKalenderPermohonan(rentangGrid(now));

  console.log(`event kalender bulan ${now.getMonth() + 1}/${now.getFullYear()}: ${events.length}\n`);

  const perJenis = new Map<string, { n: number; waktu: Set<string> }>();
  for (const event of events) {
    if (!perJenis.has(event.jenis)) perJenis.set(event.jenis, { n: 0, waktu: new Set() });
    const baris = perJenis.get(event.jenis)!;
    baris.n += 1;
    baris.waktu.add(JSON.stringify(event.waktu));
  }
  for (const [jenis, baris] of perJenis) {
    console.log(`${jenis.padEnd(20)} ${baris.n} event  waktu -> ${[...baris.waktu].sort().join(", ")}`);
  }

  console.log("\nsemua event:");
  for (const event of events) {
    console.log(
      `  ${event.jenis.padEnd(20)} ${event.tanggal}  waktu=${String(JSON.stringify(event.waktu)).padEnd(18)} ${event.namaAcara.slice(0, 28)}`
    );
  }
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
