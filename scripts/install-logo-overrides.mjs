import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = process.cwd();

const jobs = [
  {
    source: join(root, 'logo-import', 'nfl'),
    target: join(root, 'public', 'logos', 'nfl-official'),
    label: 'NFL'
  },
  {
    source: join(root, 'logo-import', 'college'),
    target: join(root, 'public', 'logos', 'college-official'),
    label: 'College'
  },
  {
    source: join(root, 'logo-import', 'school'),
    target: join(root, 'public', 'logos', 'school-official'),
    label: 'School'
  }
];

function install({ source, target, label }) {
  mkdirSync(target, { recursive: true });

  if (!existsSync(source)) {
    console.log(`${label}: source folder does not exist: ${source}`);
    return;
  }

  const files = readdirSync(source).filter((file) => extname(file).toLowerCase() === '.png');

  files.forEach((file) => {
    copyFileSync(join(source, file), join(target, file));
  });

  console.log(`${label}: copied ${files.length} PNG files`);
}

jobs.forEach(install);
