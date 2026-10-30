/* Section registry for «الفيزياء في حياتنا».
 *
 * Every future lesson adds one entry here plus its own page and its own
 * content module; the landing page renders the cards from this list, so no
 * lesson's content ever lives inside the section page itself.
 */

export const SECTION_META = Object.freeze({
  id: 'physics-in-life',
  title: 'الفيزياء في حياتنا',
  subtitle: 'من الحياة إلى المفهوم: مشاهد، تجارب، وتحديات',
  description: 'قسم مستقل يربط مفاهيم الفيزياء بمواقف من الحياة اليومية: مختبر افتراضي، أمثلة تفاعلية، وتوقّع قبل أن تجرّب.',
  href: './physics-in-life.html',
});

export const LESSON_STATUS = Object.freeze({
  available: 'متاح الآن',
  preparing: 'قيد الإعداد',
});

export const PHYSICS_IN_LIFE_LESSONS = Object.freeze([
  Object.freeze({
    id: 'lesson-1',
    order: 1,
    title: 'القوى المتلاقية وتحليل القوة',
    kicker: 'الوحدة الأولى · القوى',
    curiosity: 'ماذا يحدث عندما تسحب قوتان جسماً في اتجاهين مختلفين؟',
    description: 'سفينة تجرّها قاطرتان، وعربة تُسحب بقوتين متعامدتين، ومتزلج على منحنى: ثلاث محطات تكشف كيف نجمع القوى ونفكّكها.',
    meta: '3 محطات · 10 أمثلة من الحياة · تحدي رسم',
    href: './physics-in-life-lesson-1.html',
    status: 'available',
    scene: 'tugboats',
    experiences: 15,
  }),
]);

export function availableLessons() {
  return PHYSICS_IN_LIFE_LESSONS.filter((lesson) => lesson.status === 'available');
}
