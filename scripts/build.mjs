import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
const outputDirectory = resolve(projectDirectory, 'dist');

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(resolve(outputDirectory, 'src'), { recursive: true });

await cp(resolve(projectDirectory, 'index.html'), resolve(outputDirectory, 'index.html'));
await cp(resolve(projectDirectory, 'lesson-1.html'), resolve(outputDirectory, 'lesson-1.html'));
await cp(resolve(projectDirectory, 'appendices.html'), resolve(outputDirectory, 'appendices.html'));
await cp(resolve(projectDirectory, 'lesson-1-appendix.html'), resolve(outputDirectory, 'lesson-1-appendix.html'));
await cp(resolve(projectDirectory, 'teacher.html'), resolve(outputDirectory, 'teacher.html'));
await cp(resolve(projectDirectory, 'lesson-test.html'), resolve(outputDirectory, 'lesson-test.html'));
await cp(resolve(projectDirectory, 'src'), resolve(outputDirectory, 'src'), { recursive: true });
await cp(resolve(projectDirectory, 'vendor'), resolve(outputDirectory, 'vendor'), { recursive: true });

console.log('Production static build written to dist/.');
