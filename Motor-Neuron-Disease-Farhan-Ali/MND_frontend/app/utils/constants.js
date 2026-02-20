import { Smile, AlertTriangle } from "lucide-react";

export const KARACHI_HOSPITALS = [
  { name: "Aga Khan University Hospital", doctor: "Dr. Sarwar Jamil", contact: "021-34861000", address: "Stadium Road, Karachi" },
  { name: "Liaquat National Hospital", doctor: "Dr. Arif Herekar", contact: "021-34412000", address: "Gulshan-e-Iqbal, Karachi" },
  { name: "South City Hospital", doctor: "Dr. Mughis Sheerani", contact: "021-35862301", address: "Clifton, Karachi" },
  { name: "Dow University Hospital", doctor: "Dr. Naila Shahbaz", contact: "021-99232660", address: "Ojha Campus, Karachi" },
];

export const TRANSLATIONS = {
  en: {
    title: "MND Care Portal",
    patient: "Patient", doctor: "Doctor", admin: "Administrator",
    uploadSuccess: "Report Uploaded Successfully!",
    riskLow: "Low Risk", riskMod: "Moderate Risk", riskHigh: "High Risk",
    consultTitle: "Medical Consultation Recommended",
    consultMsg: "Your symptoms indicate potential concerns. Please consult a specialist.",
    consultAction: "Top Neurologists in Karachi",
    goodNews: "Good News! You seem healthy.",
    enjoyLife: "No significant motor neuron symptoms detected.",
    login: "Login", register: "Register", welcome: "Welcome", upload: "Upload Medical Report"
  },
  ur: {
      title: "MND کیئر پورٹل",
      patient: "مریض", doctor: "ڈاکٹر", admin: "ایڈمن",
      uploadSuccess: "رپورٹ کامیابی سے اپ لوڈ ہو گئی!",
      riskLow: "کم خطرہ", riskMod: "اوسط خطرہ", riskHigh: "زیادہ خطرہ",
      consultTitle: "ڈاکٹر سے مشورہ تجویز کیا جاتا ہے",
      consultMsg: "آپ کی علامات کو دیکھتے ہوئے بہتر ہے کہ آپ ڈاکٹر سے رجوع کریں۔",
      consultAction: "کراچی میں موجود ماہرین",
      goodNews: "خوشخبری! آپ صحت مند لگ رہے ہیں۔",
      enjoyLife: "کوئی تشویشناک علامات نہیں ملیں۔",
      login: "لاگ ان", register: "رجسٹر", welcome: "خوش آمدید", upload: "رپورٹ اپ لوڈ کریں"
  }
};

export const ALL_QUESTIONS = [
  { id: "age", text: { en: "What is your age?", ur: "آپ کی عمر کیا ہے؟" }, type: "number", image: "https://media.istockphoto.com/id/164940623/photo/old-and-child.webp?a=1&b=1&s=612x612&w=0&k=20&c=8WPG_YO2BSQoQMutC4XBpZWtCj_a1YzGTZ0-ZeRRImg=" },
  { id: "gender", text: { en: "What is your gender?", ur: "آپ کی جنس کیا ہے؟" }, type: "select", options: { en: ["Male", "Female", "Other"], ur: ["مرد", "عورت", "دیگر"] }, image: "https://images.unsplash.com/photo-1545693315-85b6be26a3d6?w=500&auto=format&fit=crop&q=60" },
  { id: "ethnicity", text: { en: "What is your ethnicity?", ur: "آپ کا نسلی پس منظر کیا ہے؟" }, type: "select", options: { en: ["Asian", "White", "Other"], ur: ["ایشین", "سفید فام", "دیگر"] }, image: "https://media.istockphoto.com/id/1466442535/photo/diverse-american-faces.jpg?s=612x612&w=0&k=20&c=op5vaxRkMGyNSodAy-8RQmv2ruBOXiif-5V1c8gQ2qc=" },
  { id: "athlete", text: { en: "Are you an athlete?", ur: "کیا آپ کھلاڑی ہیں؟" }, type: "yesno", image: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=500&auto=format&fit=crop&q=60" },
  { id: "muscle_weakness", text: { en: "Do you experience frequent muscle weakness?", ur: "کیا آپ کو اکثر پٹھوں کی کمزوری محسوس ہوتی ہے؟" }, mnd: true, image: "https://media.istockphoto.com/id/513435166/photo/young-man-in-a-preacher-bench-at-the-gym.webp?a=1&b=1&s=612x612&w=0&k=20&c=pmscgmdQmzj0hM4yIx7CGRkbAFc5wRY0N4NBo9y4czM=" },
  { id: "muscle_twitching", text: { en: "Do you experience muscle cramps or twitching?", ur: "کیا آپ کو پٹھوں میں کھنچاؤ یا جھٹکے لگتے ہیں؟" }, mnd: true, image: "https://media.istockphoto.com/id/2245215354/photo/businessman-suffering-back-pain-working-in-office.webp?a=1&b=1&s=612x612&w=0&k=20&c=AryMCL-WJGJaWdxuL0U9SnFn0vooVqG-Utq1_BmvT-U=", skipIf: (ans) => ans.muscle_weakness === "No" },
  { id: "muscle_stiffness", text: { en: "Do you feel stiffness in arms or legs?", ur: "کیا آپ کو بازوؤں یا ٹانگوں میں اکڑن محسوس ہوتی ہے؟" }, mnd: true, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80", skipIf: (ans) => ans.muscle_weakness === "No" },
  { id: "muscle_thinning", text: { en: "Have you noticed visible muscle thinning (atrophy)?", ur: "کیا آپ نے پٹھوں کا پتلا ہونا محسوس کیا ہے؟" }, mnd: true, image: "https://zanskarhealth.in/cdn/shop/articles/Muscle_Atrophy.jpg?v=1754389682", skipIf: (ans) => ans.muscle_weakness === "No" },
  { id: "gripping", text: { en: "Do you have difficulty gripping objects?", ur: "کیا آپ کو چیزیں پکڑنے میں دشواری ہے؟" }, mnd: true, image: "https://images.unsplash.com/photo-1692659030629-6a1062e2fae6?w=500&auto=format&fit=crop&q=60", skipIf: (ans) => ans.muscle_weakness === "No" },
  { id: "difficulty_speaking", text: { en: "Do you have difficulty speaking clearly?", ur: "کیا آپ کو واضح طور پر بولنے میں دشواری होती है؟" }, mnd: true, image: "https://plus.unsplash.com/premium_photo-1705883064500-2fd3dfe8cb25?w=500&auto=format&fit=crop&q=60" },
  { id: "slurred_speech", text: { en: "Do you experience slurred or slow speech?", ur: "کیا آپ کی بولنے میں ہکلاہٹ ہے؟" }, mnd: true, image: "https://plus.unsplash.com/premium_photo-1661384366589-6ce62a232f46?w=500&auto=format&fit=crop&q=60", skipIf: (ans) => ans.difficulty_speaking === "No" },
  { id: "swallowing", text: { en: "Do you face problems while swallowing food?", ur: "کیا آپ کو کھانا نگلنے میں مسئلہ ہے؟" }, mnd: true, image: "https://marvel-b1-cdn.bc0a.com/f00000000290269/www.riversideonline.com/-/media/patients-and-visitors/healthy-you/hy-trouble-swallowing.jpg", skipIf: (ans) => ans.difficulty_speaking === "No" },
  { id: "walking_balance", text: { en: "Do you experience difficulty walking or balancing?", ur: "کیا آپ کو چلنے یا توازن برقرار رکھنے میں دشواری ہے؟" }, mnd: true, image: "https://media.istockphoto.com/id/1139743426/photo/male-nurse-helping-senior-man-walk-with-walking-frame.jpg?s=612x612&w=0&k=20&c=YObLxMq7f6Es0gBkO1hj1WHZtl0if7pNwcsnTaIs8m0=" },
  { id: "fatigue", text: { en: "Do you feel unusual fatigue?", ur: "کیا آپ کو غیر معمولی تھکاوٹ محسوس ہوتی ہے؟" }, mnd: true, image: "https://plus.unsplash.com/premium_photo-1665203627191-49b3fde12d98?w=500&auto=format&fit=crop&q=60" },
  { id: "excessive_sleep", text: { en: "Do you sleep excessively?", ur: "کیا آپ بہت زیادہ سوتے ہیں؟" }, mnd: true, image: "https://plus.unsplash.com/premium_photo-1682090466454-11f56a0b0e76?w=500&auto=format&fit=crop&q=60" },
  { id: "covid", text: { en: "Have you ever had COVID-19?", ur: "کیا آپ کو کبھی کووڈ-19 ہوا ہے؟" }, mnd: false, type: "yesno", image: "https://plus.unsplash.com/premium_photo-1661526594984-8b977c7db667?w=500&auto=format&fit=crop&q=60" },
];