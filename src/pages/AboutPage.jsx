import { ArrowLeft, Compass, Heart, Lightbulb, Target } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro.jsx";
import SectionHeading from "../components/SectionHeading.jsx";

const values = [
	{ icon: Lightbulb, title: "معرفة لها معنى", text: "نقرّب المعلومة من الحياة، ونؤمن بالتعلّم الذي يترك أثرًا واضحًا." },
	{ icon: Heart, title: "إنسان أولًا", text: "نصمم تجربة تراعي اختلاف الطموحات والظروف والطرق التي نتعلّم بها." },
	{ icon: Compass, title: "طموح بلا حدود", text: "نرافق كل شخص في اكتشاف إمكاناته ورسم طريقه الخاص نحو المستقبل." },
];

export default function AboutPage() {
	return (
		<main>
			<PageIntro eyebrow="من نحن" title="التعلّم يفتح آفاقًا جديدة" description="منصة كلية كمبيرج الدولية للدراسات المهنية تفتح آفاقًا للتعلّم والتطوير المهني." />
			<section className="section story-section">
				<div className="container story-grid">
					<div className="story-image"><img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85" alt="طلاب يتعلمون ويتعاونون معًا" /><span>معًا نحو فرص أوسع</span></div>
					<div><SectionHeading eyebrow="كلية كمبيرج الدولية" title="التعلّم المهني يبدأ بخطوة." description="تقدم منصة كلية كمبيرج الدولية للدراسات المهنية تجربة تعلم تجمع الخبرة والمعرفة العملية لمساعدة المتعلمين على تطوير مهاراتهم وتحقيق أهدافهم." /><p className="story-copy">نصمم مسارات تعلم واضحة، ونختار مدرّبين يشاركون خبراتهم بصدق، لنمنح كل متعلم مساحة يكتشف فيها قدراته ويبني مهاراته بثقة.</p><Link className="button button-outline" to="/courses">ابدأ رحلتك <ArrowLeft size={17} /></Link></div>
				</div>
			</section>
			<section className="section values-section">
				<div className="container"><SectionHeading eyebrow="ما نؤمن به" title="قيم ترشد كل خطوة" description="تضع كلية كمبيرج الدولية المتعلم في قلب التجربة." centered /><div className="values-grid">{values.map(({ icon: Icon, title, text }) => <article className="value-card" key={title}><span><Icon size={23} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></div>
			</section>
			<section className="mission-section"><div className="container mission-inner"><span className="mission-icon"><Target size={25} /></span><span className="eyebrow eyebrow-gold">رؤيتنا ورسالتنا</span><h2>أن يصبح التعلّم بداية كل فرصة.</h2><p>نطمح إلى بناء مجتمع عربي يكتسب المعرفة باستمرار، ويحوّلها إلى أثر ينعكس على أفراده ومجتمعه.</p><Link className="button button-gold" to="/contact">تواصل مع الكلية <ArrowLeft size={17} /></Link></div></section>
		</main>
	);
}
