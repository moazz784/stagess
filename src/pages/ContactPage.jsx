import { useState } from "react";
import { Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import PageIntro from "../components/PageIntro.jsx";

export default function ContactPage() {
	const [searchParams] = useSearchParams();
	const course = searchParams.get("course") || "";
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState(course ? `أرغب في الاستفسار عن دورة: ${course}` : "");
	const [notice, setNotice] = useState("");

	function submitInquiry(event) {
		event.preventDefault();
		const subject = encodeURIComponent(course ? `استفسار عن دورة: ${course}` : "رسالة من منصة كلية كمبيرج الدولية للدراسات المهنية");
		const body = encodeURIComponent(`الاسم: ${name}\nالبريد الإلكتروني: ${email}\n\n${message}`);
		window.location.href = `mailto:hello@ofoq.example?subject=${subject}&body=${body}`;
		setNotice("فتحنا تطبيق البريد لديك لإرسال رسالتك. لم تُرسل أي بيانات إلى خادم الموقع.");
	}

	return (
		<main>
			<PageIntro eyebrow="نحن هنا لمساعدتك" title="يسعدنا أن نسمع منك" description="لديك سؤال أو فكرة؟ اكتب لنا، وسنكون سعداء بالتواصل معك." />
			<section className="section contact-section">
				<div className="container contact-layout">
					<div className="contact-form-card">
						<span className="eyebrow">أرسل لنا رسالة</span><h2>كيف يمكننا مساعدتك؟</h2>
						<form className="form-stack" onSubmit={submitInquiry}>
							<label>الاسم الكامل<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="اكتب اسمك هنا" /></label>
							<label>البريد الإلكتروني<input required type="email" dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label>
							<label>رسالتك<textarea required rows="5" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="اكتب استفسارك أو رسالتك..." /></label>
							<button className="button button-primary button-wide" type="submit">إرسال عبر البريد الإلكتروني <Send size={17} /></button>
							{notice && <p className="form-notice" role="status">{notice}</p>}
						</form>
					</div>
					<aside className="contact-aside">
						<span className="eyebrow eyebrow-gold">تواصل مباشرة</span><h2>خطوتك تبدأ بحوار.</h2><p>فريق كلية كمبيرج الدولية هنا للإجابة عن استفساراتك ومساعدتك على اختيار المسار الأنسب.</p>
						<div className="contact-detail"><span><Mail size={18} /></span><div><small>البريد الإلكتروني</small><a href="mailto:hello@ofoq.example">hello@ofoq.example</a></div></div>
						<div className="contact-detail"><span><Phone size={18} /></span><div><small>الهاتف</small><a href="tel:+966500000000" dir="ltr">+966 50 000 0000</a></div></div>
						<div className="contact-detail"><span><Clock3 size={18} /></span><div><small>ساعات العمل</small><b>الأحد – الخميس، ٩ ص – ٥ م</b></div></div>
						<div className="contact-detail"><span><MapPin size={18} /></span><div><small>الموقع</small><b>الرياض، المملكة العربية السعودية</b></div></div>
						<div className="contact-aside-note">تبحث عن دورة؟ <Link to="/courses">تصفّح دورات الكلية ←</Link></div>
					</aside>
				</div>
			</section>
		</main>
	);
}
