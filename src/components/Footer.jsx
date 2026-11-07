import { ArrowUpLeft } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo.jsx";

const currentYear = new Date().getFullYear();

export default function Footer() {
	return (
		<footer className="site-footer">
			<div className="container footer-main">
				<div className="footer-brand">
					<BrandLogo className="brand-light" />
					<p>نفتح لك آفاقًا جديدة من المعرفة، ونرافقك في كل خطوة نحو مستقبل تصنعه بنفسك.</p>
					<div className="social-links" aria-label="روابط التواصل الاجتماعي">
						<a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="لينكدإن">in</a>
						<a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="إنستغرام">◎</a>
						<a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="فيسبوك">f</a>
					</div>
				</div>
				<div className="footer-links">
					<h3>استكشف</h3>
					<Link to="/courses">جميع الدورات</Link>
					<Link to="/courses?category=تقنية">التقنية والبرمجة</Link>
					<Link to="/courses?category=أعمال">الأعمال والإدارة</Link>
					<Link to="/instructor">كن مدرّبًا</Link>
				</div>
				<div className="footer-links">
					<h3>عن الكلية</h3>
					<Link to="/about">قصتنا</Link>
					<Link to="/contact">تواصل معنا</Link>
					<Link to="/login">حساب المتعلّم</Link>
					<a href="mailto:hello@ofoq.example">hello@ofoq.example</a>
				</div>
				<div className="footer-note">
					<span className="eyebrow eyebrow-gold">تعلّم على مهل، وتقدّم بثبات</span>
					<h3>معرفة اليوم،<br />فرص الغد.</h3>
					<Link className="footer-explore" to="/courses">اكتشف الدورات <ArrowUpLeft size={17} /></Link>
				</div>
			</div>
			<div className="container footer-bottom">
				<p>© {currentYear} كلية كمبيرج الدولية للدراسات المهنية. جميع الحقوق محفوظة.</p>
				<p>صُمّم لكل طموح يتطلّع إلى أبعد.</p>
			</div>
		</footer>
	);
}
