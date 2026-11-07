import { useState } from "react";
import {
	ArrowLeft, ArrowUpLeft, Award, BriefcaseBusiness, Check, ChevronLeft, Code2,
	GraduationCap, Languages, Lightbulb, PenTool, Play, Quote, Search, Sparkles,
	Star, UsersRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CourseCard from "../components/CourseCard.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { categories, courses } from "../data/courses.js";

const categoryIcons = {
	code: Code2,
	briefcase: BriefcaseBusiness,
	pen: PenTool,
	languages: Languages,
	sparkles: Sparkles,
};

const instructors = [
	{ name: "م. سارة العتيبي", role: "تطوير البرمجيات", image: "photo-1580489944761-15a19d654956" },
	{ name: "أ. نورة الشمري", role: "التسويق الرقمي", image: "photo-1551836022-d5d88e9218df" },
	{ name: "أ. لينا الحربي", role: "التصميم الإبداعي", image: "photo-1534528741775-53994a69daeb" },
];

export default function HomePage() {
	const [query, setQuery] = useState("");
	const navigate = useNavigate();

	function searchCourses(event) {
		event.preventDefault();
		navigate(`/courses?q=${encodeURIComponent(query)}`);
	}

	return (
		<main>
			<section className="hero-section">
				<div className="hero-glow hero-glow-one" />
				<div className="hero-glow hero-glow-two" />
				<div className="container hero-grid">
					<div className="hero-copy">
						<span className="hero-kicker"><span /> تعلّم يصنع لك أفقًا أوسع</span>
						<h1>كل خطوة تعلّم،<br /><span>تقربك من غدك.</span></h1>
						<p>معرفة مرنة، وخبراء يشاركونك خبرتهم، ومساحة تساعدك على بناء مستقبل يليق بطموحك.</p>
						<div className="hero-actions">
							<Link className="button button-gold" to="/courses">اكتشف الدورات <ArrowLeft size={18} /></Link>
							<Link className="hero-watch" to="/about"><span><Play size={14} fill="currentColor" /></span> تعرّف على الكلية</Link>
						</div>
						<div className="hero-proof">
							<div className="avatar-stack" aria-hidden="true">
								{["photo-1534528741775-53994a69daeb", "photo-1500648767791-00dcc994a43e", "photo-1531123897727-8f129e1688ce", "photo-1506794778202-cad84cf45f1d"].map((image) => (
									<img key={image} src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=80&q=75`} alt="" />
								))}
							</div>
							<div><strong>+١٢ ألف متعلّم</strong><span>بدأوا رحلتهم معنا</span></div>
							<div className="proof-rating"><Star size={15} fill="currentColor" /><b>٤٫٩</b><span>تقييم المتعلمين</span></div>
						</div>
					</div>
					<div className="hero-visual">
						<div className="hero-image-frame">
							<img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=88" alt="مجموعة من المتعلمين يتشاركون الأفكار" />
							<div className="image-caption">
								<span className="caption-icon"><GraduationCap size={19} /></span>
								<span><b>مساحة تعلّم تشبهك</b><small>خطوتك القادمة تبدأ هنا</small></span>
								<ArrowUpLeft className="caption-arrow" size={18} />
							</div>
						</div>
						<div className="floating-note"><span className="floating-star"><Star size={16} fill="currentColor" /></span><span><b>تعلّم بخطواتك</b><small>في أي وقت ومن أي مكان</small></span></div>
						<div className="hero-orbit"><span>ك</span><i /></div>
					</div>
				</div>
				<div className="container hero-search-wrap">
					<form className="hero-search" onSubmit={searchCourses}>
						<Search size={21} />
						<input aria-label="ابحث عن دورة" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ما المهارة التي ترغب في تعلّمها؟" />
						<button className="button button-primary" type="submit">ابحث عن دورة <ArrowLeft size={17} /></button>
					</form>
					<p>الأكثر بحثًا: <Link to="/courses?q=التصميم">التصميم</Link><Link to="/courses?q=البرمجة">البرمجة</Link><Link to="/courses?q=التسويق">التسويق الرقمي</Link></p>
				</div>
			</section>

			<section className="section section-light">
				<div className="container">
					<div className="section-topline">
						<SectionHeading eyebrow="اختيارات الكلية" title="دورات تفتح لك أبوابًا جديدة" description="محتوى عملي منتقى بعناية، لتتعلّم ما تحتاجه وتطبّقه بثقة." />
						<Link className="text-link" to="/courses">تصفّح جميع الدورات <ArrowLeft size={17} /></Link>
					</div>
					<div className="course-grid course-grid-featured">
						{courses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} />)}
					</div>
				</div>
			</section>

			<section className="section categories-section">
				<div className="container">
					<SectionHeading eyebrow="تعلّم ما يلهمك" title="أين تريد أن تبدأ؟" description="مسارات متنوعة تساعدك على تطوير مهاراتك، في المجال الذي يهمك." centered />
					<div className="category-grid">
						{categories.map((category) => {
							const Icon = categoryIcons[category.icon];
							return (
								<Link className="category-card" to={`/courses?category=${encodeURIComponent(category.name)}`} key={category.name}>
									<span className="category-icon"><Icon size={22} /></span>
									<span><b>{category.name}</b><small>{category.count}</small></span>
									<ChevronLeft className="category-chevron" size={18} />
								</Link>
							);
						})}
					</div>
				</div>
			</section>

			<section className="section why-section">
				<div className="container why-grid">
					<div className="why-visual">
						<div className="why-photo"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85" alt="متعلّم يطوّر مهاراته عبر الحاسوب" /></div>
						<div className="why-stat"><span className="why-stat-icon"><Award size={20} /></span><strong>تعلم له أثر</strong><small>مهارات تطبّقها في واقعك</small></div>
						<span className="why-decor" aria-hidden="true">أ</span>
					</div>
					<div>
						<SectionHeading eyebrow="لماذا كلية كمبيرج؟" title="مساحة تعلمّك كيف تتقدّم، لا ماذا تحفظ." description="نؤمن أن التعلم الحقيقي يبدأ حين ترتبط المعرفة بهدفك. لذلك صممنا تجربة تساعدك على اكتشاف قدراتك وتحويلها إلى خطوات ملموسة." />
						<div className="benefit-list">
							<div><span><Check size={17} /></span><p><b>خبراء من واقع المهنة</b><small>تعلّم من تجارب عملية ورؤى قريبة من سوق العمل.</small></p></div>
							<div><span><Check size={17} /></span><p><b>تعلّم يناسب إيقاعك</b><small>ارجع إلى دروسك وقتما شئت، وتقدّم بالسرعة التي تناسبك.</small></p></div>
							<div><span><Check size={17} /></span><p><b>معرفة قابلة للتطبيق</b><small>محتوى واضح وتمارين تساعدك على تحويل الفكرة إلى مهارة.</small></p></div>
						</div>
						<Link className="button button-outline" to="/about">قصتنا ورؤيتنا <ArrowLeft size={17} /></Link>
					</div>
				</div>
			</section>

			<section className="section instructors-section">
				<div className="container">
					<div className="section-topline">
						<SectionHeading eyebrow="تعرّف على خبرائنا" title="خبرة تشاركك الطريق" description="مدرّبون شغوفون يقرّبون لك المعرفة من واقع الحياة والعمل." />
						<Link className="text-link" to="/instructor">انضم إلى مجتمع المدرّبين <ArrowLeft size={17} /></Link>
					</div>
					<div className="instructor-grid">
						{instructors.map((instructor) => (
							<article className="instructor-card" key={instructor.name}>
								<img src={`https://images.unsplash.com/${instructor.image}?auto=format&fit=crop&w=560&q=85`} alt={instructor.name} loading="lazy" />
								<div><span>{instructor.role}</span><h3>{instructor.name}</h3><Link to="/instructor" aria-label={`اعرف المزيد عن ${instructor.name}`}><ArrowUpLeft size={19} /></Link></div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="steps-section section">
				<div className="container">
					<SectionHeading eyebrow="ببساطة، ابدأ" title="ثلاث خطوات نحو أفق جديد" description="رحلتك التعليمية أقرب مما تتخيّل." centered />
					<div className="steps-grid">
						<div className="step-card"><span className="step-number">٠١</span><span className="step-icon"><Search size={22} /></span><h3>اختر ما يهمك</h3><p>اكتشف دورة أو مجالًا يتوافق مع أهدافك وطموحك.</p></div>
						<div className="step-card"><span className="step-number">٠٢</span><span className="step-icon"><Play size={20} /></span><h3>تعلّم بطريقتك</h3><p>شاهد الدروس وتقدّم بإيقاعك، أينما كنت.</p></div>
						<div className="step-card"><span className="step-number">٠٣</span><span className="step-icon"><Lightbulb size={22} /></span><h3>طبّق وتقدّم</h3><p>حوّل ما تعلّمته إلى إنجازات وفرص جديدة.</p></div>
					</div>
				</div>
			</section>

			<section className="testimonials-section section">
				<div className="container testimonial-grid">
					<div className="testimonial-intro">
						<SectionHeading eyebrow="حكايات متعلمي الكلية" title="رحلتهم بدأت بخطوة" description="نعتز بكل شخص اختار أن يمنح نفسه فرصة تعلّم جديدة." />
						<div className="testimonial-rating"><span><Star size={17} fill="currentColor" /> ٤٫٩ / ٥</span><small>بناءً على آراء المتعلمين</small></div>
					</div>
					<article className="quote-card">
						<Quote className="quote-mark" size={30} fill="currentColor" />
						<div className="quote-stars" aria-label="خمسة من خمسة"><Star /><Star /><Star /><Star /><Star /></div>
						<blockquote>«كانت التجربة أكثر من مجرد دورة. وجدت شرحًا واضحًا وخطوات عملية ساعدتني على الانتقال من الفكرة إلى أول مشروع لي.»</blockquote>
						<div className="quote-author"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=90&q=75" alt="" /><span><b>ريم السالم</b><small>متعلّمة في مسار التصميم</small></span></div>
					</article>
					<article className="quote-card quote-card-alt">
						<Quote className="quote-mark" size={30} fill="currentColor" />
						<div className="quote-stars" aria-label="خمسة من خمسة"><Star /><Star /><Star /><Star /><Star /></div>
						<blockquote>«أحببت أنني استطعت التعلم في الوقت المناسب لي. المحتوى مرتب والمدرّبون يشرحون من واقع خبرتهم.»</blockquote>
						<div className="quote-author"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=90&q=75" alt="" /><span><b>فيصل الحربي</b><small>متعلّم في مسار الأعمال</small></span></div>
					</article>
				</div>
			</section>

			<section className="stats-section">
				<div className="container stats-grid">
					<div><UsersRound /><strong>١٢,٠٠٠+</strong><span>متعلّم طموح</span></div>
					<div><GraduationCap /><strong>٨٠+</strong><span>خبير ومدرّب</span></div>
					<div><BriefcaseBusiness /><strong>١٢٠+</strong><span>دورة ومسار تعليمي</span></div>
					<div><Star /><strong>٤٫٩ / ٥</strong><span>متوسط تقييم المتعلمين</span></div>
				</div>
			</section>

			<section className="cta-section">
				<div className="container cta-inner">
					<div><span className="eyebrow eyebrow-gold">مستقبلك يبدأ بخطوة</span><h2>ما المهارة التي ستغيّر<br />خطوتك القادمة؟</h2><p>ابدأ اليوم، وافتح لنفسك أفقًا جديدًا.</p></div>
					<Link className="button button-gold" to="/courses">اكتشف دورتك القادمة <ArrowLeft size={18} /></Link>
					<span className="cta-decoration" aria-hidden="true"><Sparkles size={80} /></span>
				</div>
			</section>
		</main>
	);
}
