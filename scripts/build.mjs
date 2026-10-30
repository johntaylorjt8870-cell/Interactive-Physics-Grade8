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
await cp(resolve(projectDirectory, 'physics-in-life.html'), resolve(outputDirectory, 'physics-in-life.html'));
await cp(resolve(projectDirectory, 'physics-in-life-lesson-1.html'), resolve(outputDirectory, 'physics-in-life-lesson-1.html'));
await cp(resolve(projectDirectory, 'physics-in-life-teacher.html'), resolve(outputDirectory, 'physics-in-life-teacher.html'));
await cp(resolve(projectDirectory, 'lesson-1-appendix.html'), resolve(outputDirectory, 'lesson-1-appendix.html'));
await cp(resolve(projectDirectory, 'lesson-2-appendix.html'), resolve(outputDirectory, 'lesson-2-appendix.html'));
await cp(resolve(projectDirectory, 'teacher.html'), resolve(outputDirectory, 'teacher.html'));
await cp(resolve(projectDirectory, 'lesson-test.html'), resolve(outputDirectory, 'lesson-test.html'));
await cp(resolve(projectDirectory, 'lesson-2.html'), resolve(outputDirectory, 'lesson-2.html'));
await cp(resolve(projectDirectory, 'lesson-2-teacher.html'), resolve(outputDirectory, 'lesson-2-teacher.html'));
await cp(resolve(projectDirectory, 'lesson-2-test.html'), resolve(outputDirectory, 'lesson-2-test.html'));
await cp(resolve(projectDirectory, 'unit-1-test.html'), resolve(outputDirectory, 'unit-1-test.html'));
await cp(resolve(projectDirectory, 'unit-questions.html'), resolve(outputDirectory, 'unit-questions.html'));
await cp(resolve(projectDirectory, 'unit-questions-teacher.html'), resolve(outputDirectory, 'unit-questions-teacher.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-1.html'), resolve(outputDirectory, 'unit2-lesson-1.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-1-appendix.html'), resolve(outputDirectory, 'unit2-lesson-1-appendix.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-1-teacher.html'), resolve(outputDirectory, 'unit2-lesson-1-teacher.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-1-test.html'), resolve(outputDirectory, 'unit2-lesson-1-test.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-2.html'), resolve(outputDirectory, 'unit2-lesson-2.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-2-appendix.html'), resolve(outputDirectory, 'unit2-lesson-2-appendix.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-2-teacher.html'), resolve(outputDirectory, 'unit2-lesson-2-teacher.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-2-test.html'), resolve(outputDirectory, 'unit2-lesson-2-test.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-3.html'), resolve(outputDirectory, 'unit2-lesson-3.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-3-appendix.html'), resolve(outputDirectory, 'unit2-lesson-3-appendix.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-3-teacher.html'), resolve(outputDirectory, 'unit2-lesson-3-teacher.html'));
await cp(resolve(projectDirectory, 'unit2-lesson-3-test.html'), resolve(outputDirectory, 'unit2-lesson-3-test.html'));
for (const entry of ['unit2-lesson-4.html', 'unit2-lesson-4-teacher.html', 'unit-2-test.html', 'unit2-exercises.html', 'unit2-exercises-teacher.html']) {
  await cp(resolve(projectDirectory, entry), resolve(outputDirectory, entry));
}
// Keep authored plaintext teacher solutions out of the static deployment. The
// deployed pages decrypt their authenticated ciphertext payload after the gate.
const PLAINTEXT_TEACHER_CONTENT = Object.freeze([
  'unit2-exercises-teacher-content.js',
  'physics-in-life-teacher-content.js',
]);
await cp(resolve(projectDirectory, 'src'), resolve(outputDirectory, 'src'), {
  recursive: true,
  filter: (source) => !PLAINTEXT_TEACHER_CONTENT.some((name) => source.endsWith(name)),
});
await cp(resolve(projectDirectory, 'vendor'), resolve(outputDirectory, 'vendor'), { recursive: true });

console.log('Production static build written to dist/.');
