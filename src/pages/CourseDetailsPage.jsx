import { useState } from "react";
import {
	BookOpen, Check, Clock3, Globe2, GraduationCap, Play, ShieldCheck, Star, UsersRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageIntro from "../components/PageIntro.jsx";
import { courses, curriculum } from "../data/courses.js";
import { formatPrice } from "../utils/format.js";

export default function CourseDetailsPage() {
	const { courseId } = useParams();
	const [openChapter, setOpenChapter] = useState(0);
	const course = courses.find((item) => item.id === courseId);

	if (!course) {
		return (
			<main>
				<PageIntro eyebrow="دورات الكلية" title="الدورة غير متاحة" description="لم نتمكن من العثور على هذه الدورة. تصفّح مكتبتنا لاكتشاف المزيد." />
				<section className="section"><div className="container"><Link className="button button-primary" to="/courses">استكشف الدورات</Link></div></section>
			</main>
		);
	}

	return (
		<main>
			<PageIntro eyebrow={`${course.category} / ${course.level}`} title={course.title} description={course.description} compact />
			<section className="section details-section">
				<div className="container details-layout">
					<div className="details-main">
						<div className="details-cover">
							<img src={course.image} alt={course.imageAlt} />
							<span className="details-play"><Play size={23} fill="currentColor" /></span>
						</div>
						<div className="details-rating-line">
							<span className="course-rating"><Star size={16} fill="currentColor" /> {course.rating}</span>
							<span>تقييم المتعلمين</span><span className="details-dot">•</span><span>{formatPrice(course.students)} متعلّم</span>
						</div>
						<section className="details-content-block">
							<span className="eyebrow">رحلتك التعليمية</span>
							<h2>ماذا ستتعلّم؟</h2>
							<p>انطلق في تجربة تعليمية عملية تساعدك على بناء فهم متين ومهارات يمكنك الاستفادة منها في دراستك وعملك.</p>
							<div className="outcomes-grid">
								{[
									"فهم المفاهيم الأساسية وتطبيقها بثقة",
									"التعرّف على الأدوات التي تحتاجها",
									"إنجاز مشروع عملي يعكس مهاراتك",
									"تجنّب الأخطاء الشائعة بخطوات واضحة",
								].map((item) => <div key={item}><Check size={17} />{item}</div>)}
							</div>
						</section>
						<section className="details-content-block curriculum-block">
							<span className="eyebrow">محتوى الدورة</span>
							<h2>خطوة بخطوة نحو هدفك</h2>
							<p>{curriculum.length} وحدات تعليمية · دروس مسجّلة · تعلّم بإيقاعك</p>
							<div className="curriculum-list">
								{curriculum.map((chapter, index) => (
									<div className={`curriculum-item${openChapter === index ? " expanded" : ""}`} key={chapter.title}>
										<button type="button" aria-expanded={openChapter === index} onClick={() => setOpenChapter(openChapter === index ? -1 : index)}>
											<span className="curriculum-index">٠{index + 1}</span><b>{chapter.title}</b><span>{chapter.lessons.length} دروس</span>
										</button>
										{openChapter === index && <ul>{chapter.lessons.map((lesson) => <li key={lesson}><Play size={13} />{lesson}<span>متاح بعد الالتحاق</span></li>)}</ul>}
									</div>
								))}
							</div>
						</section>
						<section className="details-content-block instructor-bio">
							<span className="eyebrow">مدرّب الدورة</span>
							<h2>{course.instructor}</h2>
							<div className="instructor-bio-row">
								<img src={`https://images.unsplash.com/${course.category === "تصميم" ? "photo-1534528741775-53994a69daeb" : "photo-1500648767791-00dcc994a43e"}?auto=format&fit=crop&w=140&q=80`} alt={course.instructor} />
								<p>متخصص شغوف بمشاركة المعرفة والخبرة العملية، يقدّم محتوى واضحًا يساعد المتعلمين على تطوير مهاراتهم وتحقيق أهدافهم.</p>
							</div>
						</section>
						<section className="details-content-block review-block">
							<span className="eyebrow">آراء المتعلمين</span>
							<h2>تجربة تستحق المشاركة</h2>
							<article className="review-card"><div className="quote-stars"><Star /><Star /><Star /><Star /><Star /></div><p>«المحتوى مرتب وواضح، والأمثلة العملية ساعدتني على فهم كل خطوة وتطبيقها بنفسي.»</p><b>هند العبدالله</b><span>متعلّمة في الكلية</span></article>
						</section>
					</div>
					<aside className="enroll-card">
						<div className="enroll-image"><img src={course.image} alt="" /><span><Play size={17} fill="currentColor" /> معاينة الدورة</span></div>
						<div className="enroll-content">
							<div className="enroll-price"><strong>{formatPrice(course.price)} ر.س</strong>{course.oldPrice && <del>{formatPrice(course.oldPrice)} ر.س</del>}</div>
							<p className="enroll-note">سعر الدورة للالتحاق الكامل</p>
							<Link className="button button-primary button-wide" to={`/contact?course=${encodeURIComponent(course.title)}`}>اطلب الانضمام للدورة</Link>
							<p className="enroll-disclaimer">الالتحاق والدفع غير متاحين بعد؛ أرسل استفسارك وسيتواصل معك فريقنا.</p>
							<div className="enroll-includes">
								<h3>ماذا تتضمن الدورة؟</h3>
								<span><Play size={16} /> {course.duration} من المحتوى</span>
								<span><BookOpen size={16} /> وصول مرن إلى الدروس</span>
								<span><Globe2 size={16} /> تعلّم باللغة العربية</span>
								<span><GraduationCap size={16} /> محتوى بمستوى {course.level}</span>
								<span><ShieldCheck size={16} /> شهادة إتمام عند تفعيل المنصة</span>
								<span><Clock3 size={16} /> تعلّم في الوقت الذي يناسبك</span>
								<span><UsersRound size={16} /> مجتمع من المتعلمين</span>
							</div>
							<Link className="enroll-help" to="/contact">لديك سؤال عن الدورة؟ تواصل معنا</Link>
						</div>
					</aside>
				</div>
			</section>
		</main>
	);
}
