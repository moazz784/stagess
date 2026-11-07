import { ArrowLeft, ArrowUpLeft, BadgeCheck, BookOpenCheck, ChartNoAxesCombined, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro.jsx";

const benefits = [
	{ icon: UsersRound, title: "مجتمع متعلمين طموح", text: "شارك خبرتك مع أشخاص يبحثون عن معرفة عملية تفتح لهم فرصًا جديدة." },
	{ icon: BookOpenCheck, title: "مساحة لخبرتك", text: "قدّم خبرتك بأسلوبك، وساهم في بناء محتوى عربي مفيد وموثوق." },
	{ icon: ChartNoAxesCombined, title: "نمو مهني مستمر", text: "وسّع حضورك المهني واصنع أثرًا يتجاوز حدود قاعة التدريب." },
];

export default function InstructorPage() {
	return (
		<main>
			<PageIntro eyebrow="للمدرّبين والخبراء" title="خبرتك قد تفتح أفقًا لغيرك" description="نؤمن أن الخبرة التي تُشارك تصنع فرقًا. انضم إلى مجتمع يضع المعرفة العملية في متناول الجميع." />
			<section className="section instructor-page-section">
				<div className="container instructor-page-grid">
					<div><span className="eyebrow">شارك ما تعرفه</span><h2>كن جزءًا من رحلة تعلّم ملهمة.</h2><p>إذا كنت خبيرًا في مجالك وتحب تبسيط المعرفة، توفر لك كلية كمبيرج الدولية مساحة لمشاركة خبرتك مع متعلمين يسعون للتطور. نعمل معًا على تقديم تجربة تعليمية عالية الجودة باللغة العربية.</p><Link className="button button-primary" to="/contact?course=الانضمام%20كمدرّب">تواصل للانضمام <ArrowLeft size={17} /></Link><p className="form-helper">أرسل لنا نبذة عن خبرتك عبر نموذج التواصل. لا يوجد تسجيل آلي للمدرّبين في هذه المرحلة.</p></div>
					<div className="instructor-feature-image"><img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85" alt="مدرّبة تشارك خبرتها مع فريق من المتعلمين" /><div><BadgeCheck size={19} /><span><b>خبرة تترك أثرًا</b><small>المعرفة تكبر حين نتشاركها</small></span></div></div>
				</div>
			</section>
			<section className="section instructor-benefits-section"><div className="container"><div className="section-topline"><div><span className="eyebrow">لماذا كلية كمبيرج؟</span><h2>ننجح معًا حين نتعلّم معًا</h2></div><Link className="text-link" to="/contact">لنتحدث عن فرص التعاون <ArrowUpLeft size={17} /></Link></div><div className="values-grid">{benefits.map(({ icon: Icon, title, text }) => <article className="value-card" key={title}><span><Icon size={23} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
			<section className="mission-section"><div className="container mission-inner"><span className="mission-icon"><BookOpenCheck size={25} /></span><span className="eyebrow eyebrow-gold">لنبدأ حوارًا</span><h2>لديك خبرة تستحق أن تُروى؟</h2><p>نرحب بالتعرّف عليك وعلى المجال الذي ترغب في مشاركته.</p><Link className="button button-gold" to="/contact">تواصل مع فريق الكلية <ArrowLeft size={17} /></Link></div></section>
		</main>
	);
}
