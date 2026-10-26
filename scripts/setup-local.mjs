import { readFile, writeFile } from 'node:fs/promises';

try {
  await writeFile(new URL('../.env', import.meta.url), await readFile(new URL('../.env.example', import.meta.url)), { flag: 'wx', mode: 0o600 });
  console.log('.env statis dibuat. Konten dibaca dari JSON lokal; tidak ada kredensial yang diperlukan.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('.env sudah ada; tidak diubah.');
}
