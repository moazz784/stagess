# أفق | منصة التعلّم

منصة تعلّم عربية بواجهة React/Vite وخلفية ASP.NET Core Web API. يتضمن المشروع المرحلة الأولى العامة والمرحلة الثانية للمستخدمين والمصادقة والصلاحيات.

## المتطلبات

- Node.js وnpm.
- .NET 10 SDK.
- SQL Server أو SQL Server LocalDB. إعداد التطوير الافتراضي يستخدم `(localdb)\SteelConnections2026`.

## تشغيل قاعدة البيانات والخلفية محليًا

تُخزّن الأسرار محليًا باستخدام .NET User Secrets، ولا تُحفظ مفاتيح JWT أو كلمات مرور الحسابات في ملفات المشروع:

```powershell
dotnet user-secrets set "Jwt:SigningKey" "<random-secret-at-least-32-bytes>" --project backend\Lucde.Api\Lucde.Api.csproj
dotnet user-secrets set "BootstrapAdmin:Email" "admin@example.test" --project backend\Lucde.Api\Lucde.Api.csproj
dotnet user-secrets set "BootstrapAdmin:Password" "<strong-unique-password>" --project backend\Lucde.Api\Lucde.Api.csproj
dotnet ef database update --project backend\Lucde.Api\Lucde.Api.csproj
dotnet run --project backend\Lucde.Api\Lucde.Api.csproj --launch-profile http
```

أنشئ مفتاح JWT عشوائيًا بدل النص الإرشادي. مثال PowerShell:

```powershell
$bytes = New-Object 'Byte[]' 64
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$key = [Convert]::ToBase64String($bytes)
dotnet user-secrets set "Jwt:SigningKey" $key --project backend\Lucde.Api\Lucde.Api.csproj
```

تعمل الواجهة الخلفية على `http://localhost:5195`. تتوفر وثيقة OpenAPI أثناء التطوير على `http://localhost:5195/openapi/v1.json`، وفحص الصحة على `/health`. يهيّئ التشغيل أدوار `Student` و`Instructor` و`Admin`. إذا ضُبط بريدا المسؤول وكلمة مروره في User Secrets، ينشأ حساب المسؤول الأول أو يُمنح الدور للمستخدم المحدد.

في بيئة التطوير، تُسجّل رسائل تأكيد البريد واستعادة كلمة المرور مع روابطها في سجل الخادم المحلي فقط لتسهيل الاختبار. لا تستخدم هذا السلوك في الإنتاج. خارج التطوير يجب ضبط SMTP وعنوان الواجهة، ويجب تعيين اتصال SQL Server ومفتاح JWT وOrigins الواجهة عبر متغيرات البيئة أو Secret Manager:

- `ConnectionStrings__Default`
- `Jwt__SigningKey`, `Jwt__Issuer`, `Jwt__Audience`
- `Jwt__AccessTokenMinutes` (1-60; default 15)
- `Cors__AllowedOrigins__0` (وأضف عناصر أخرى عند الحاجة)
- `Frontend__BaseUrl`
- `Email__SenderAddress`
- `Email__Smtp__Host`, `Email__Smtp__Port`, `Email__Smtp__UseSsl`
- `Email__Smtp__Username`, `Email__Smtp__Password`

يتطلب التشغيل خارج Development إعداد SMTP وواجهة أمامية وOrigins صريحة، ويُفعّل HTTPS/HSTS. لا تضع أسرار الإنتاج في `appsettings.json`.

## تشغيل الواجهة

في نافذة طرفية ثانية:

```powershell
npm install
npm run dev
```

تستخدم الواجهة افتراضيًا `http://localhost:5195/api`. يمكن تغيير ذلك عبر `VITE_API_BASE_URL` في `.env.local`، مع إضافة عنوان الواجهة إلى `Cors:AllowedOrigins` في إعدادات API.

## التحقق والبناء

```powershell
dotnet build backend\Lucde.Api\Lucde.Api.csproj
dotnet ef database update --project backend\Lucde.Api\Lucde.Api.csproj
npm run build
npm run lint
```

توجد أمثلة HTTP للمسارات في [backend/Lucde.Api/Lucde.Api.http](./backend/Lucde.Api/Lucde.Api.http).

## المصادقة والصلاحيات

- ينشئ التسجيل حساب طالب غير مفعّل؛ يلزم تأكيد البريد قبل تسجيل الدخول.
- يستخدم ASP.NET Core Identity لتجزئة كلمات المرور والتحقق منها، مع سياسة كلمة مرور وقفل مؤقت بعد المحاولات الفاشلة.
- عمر JWT الافتراضي 15 دقيقة، ويُحفظ في ذاكرة الواجهة فقط. يُخزّن refresh token مجزّأ في SQL Server، ويرسل للمتصفح داخل Cookie من نوع `HttpOnly`, `SameSite=Strict` مع تدوير عند التجديد.
- يُتحقق من تفعيل الحساب والأدوار الحالية في قاعدة البيانات عند قبول كل JWT، فتسري تغييرات الأدوار أو تعطيل الحساب مباشرة.
- يتيح `/api/auth/forgot-password` و`/api/auth/reset-password` استعادة كلمة المرور، مع رسالة عامة لا تكشف وجود الحساب.
- تُقيّد نقاط التسجيل والدخول وتجديد الجلسة والتحقق واستعادة كلمة المرور بعشرة طلبات لكل عنوان IP في الدقيقة.
- الأدوار الوحيدة: `Student`, `Instructor`, `Admin`. التسجيل العام لا يسمح باختيار الدور؛ يعيّن المسؤول الأدوار من واجهة الإدارة.
- جميع نقاط API للحساب والملفات الشخصية ولوحات التحكم محمية على الخادم، وليس اعتمادًا على حماية المسارات في React.

## المسارات الرئيسية

- عام: `/`, `/courses`, `/courses/:courseId`, `/about`, `/contact`
- حساب: `/login`, `/register`, `/forgot-password`, `/verify-email`, `/reset-password`
- مساحات محمية: `/student/dashboard`, `/instructor/dashboard`, `/admin/dashboard`

## بنية المرحلة الثانية

- `backend/Lucde.Api/Models/`: مستخدم Identity وملفات الطالب والمدرّب ورموز التجديد والإشعارات وسجل التدقيق.
- `backend/Lucde.Api/Data/`: سياق EF Core، تهيئة الأدوار، ومصنع التصميم.
- `backend/Lucde.Api/Data/Migrations/`: ترحيلات SQL Server.
- `backend/Lucde.Api/Endpoints/`: مجموعات مسارات المصادقة والحساب والإدارة.
- `backend/Lucde.Api/Services/`: خدمات المصادقة والبريد والحساب والإدارة وواجهاتها.
- `src/auth/`: حالة المصادقة وحماية المسارات في React.
- `src/services/api.js`: Axios مع إرسال Cookie وتجديد access token عند انتهاء صلاحيته.
- `src/data/courses.js`: بيانات دورات تجريبية منفصلة عن واجهة API.

لا تتضمن المرحلة الثانية الدفع أو تسجيل التحاق بالدورات.
