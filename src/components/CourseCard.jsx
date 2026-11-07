import { ArrowUpLeft, Clock3, Star, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format.js";

export default function CourseCard({ course }) {
	return (
		<article className="course-card">
			<Link className="course-image-wrap" to={`/courses/${course.id}`} aria-label={`تفاصيل دورة ${course.title}`}>
				<img className="course-image" src={course.image} alt={course.imageAlt} loading="lazy" />
				<span className="course-category">{course.category}</span>
			</Link>
			<div className="course-card-body">
				<div className="course-meta">
					<span className="course-rating"><Star size={15} fill="currentColor" /> {course.rating}</span>
					<span>{course.level}</span>
				</div>
				<h3><Link to={`/courses/${course.id}`}>{course.title}</Link></h3>
				<p className="course-instructor">{course.instructor}</p>
				<div className="course-facts">
					<span><Clock3 size={15} /> {course.duration}</span>
					<span><UsersRound size={15} /> {formatPrice(course.students)}</span>
				</div>
				<div className="course-card-bottom">
					<div className="course-price">
						<strong>{formatPrice(course.price)} ر.س</strong>
						{course.oldPrice && <del>{formatPrice(course.oldPrice)} ر.س</del>}
					</div>
					<Link className="course-arrow" to={`/courses/${course.id}`} aria-label={`عرض ${course.title}`}><ArrowUpLeft size={18} /></Link>
				</div>
			</div>
		</article>
	);
}
