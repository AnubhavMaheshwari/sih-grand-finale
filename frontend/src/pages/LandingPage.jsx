import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    FileText,
    School,
    Bot,
    CheckCircle2,
    ArrowLeftRight
} from "lucide-react";
import { useEffect, useState } from "react";

import sarthiLogo from "../assets/images/sarthiLogo.png";
import footerLogos from "../assets/images/footer_logos.png";

const slides = [
    {
        id: 1,
        title: "AI Chat Bot",
        subtitle: "Ask questions directly to your uploaded documents.",
        bg: "bg-gradient-to-r from-blue-900 to-slate-900",
        content: (
            <div className="flex items-center gap-8 w-full max-w-4xl mx-auto p-4">
                {/* Document View */}
                <div className="hidden md:block w-1/3 bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20 h-32 relative overflow-hidden">
                    <div className="w-full h-2 bg-white/20 mb-2 rounded"></div>
                    <div className="w-3/4 h-2 bg-white/20 mb-4 rounded"></div>
                    <div className="space-y-2">
                        <div className="w-full h-1.5 bg-white/10 rounded"></div>
                        <div className="w-full h-1.5 bg-white/10 rounded"></div>
                        <div className="w-5/6 h-1.5 bg-white/10 rounded"></div>
                        <div className="w-full h-1.5 bg-white/10 rounded"></div>
                    </div>
                    <div className="absolute bottom-2 right-2">
                        <FileText className="text-blue-400 h-8 w-8" />
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 bg-white rounded-xl shadow-2xl p-3 md:p-4 relative">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="bg-slate-100 p-2 rounded-full">
                            <School className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-2 text-sm text-slate-700">
                            What is the faculty-to-student ratio mentioned in the report?
                        </div>
                    </div>
                    <div className="flex items-start gap-3 justify-end">
                        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 text-sm shadow-md">
                            Based on page 3, the current ratio is <strong>1:18</strong>, which meets AICTE norms.
                        </div>
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Bot className="h-5 w-5 text-blue-700" />
                        </div>
                    </div>
                    <div className="absolute -right-2 -top-2 bg-green-500 rounded-full p-1 border-2 border-white">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: "Comprehensive Analytics",
        subtitle: "Visualized data for every aspect of your institution.",
        bg: "bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900",
        content: (
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto items-end">
                {/* Bar Chart Mockup */}
                <div className="flex-1 bg-white/95 backdrop-blur rounded-xl p-3 shadow-xl border-b-4 border-indigo-500 h-32 flex flex-col justify-end">
                    <div className="flex justify-between items-end h-20 gap-2 px-2">
                        <div className="w-full bg-indigo-200 rounded-t h-[40%]"></div>
                        <div className="w-full bg-indigo-300 rounded-t h-[60%]"></div>
                        <div className="w-full bg-indigo-500 rounded-t h-[85%] relative group">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition">85%</div>
                        </div>
                        <div className="w-full bg-indigo-400 rounded-t h-[70%]"></div>
                        <div className="w-full bg-indigo-600 rounded-t h-[95%]"></div>
                    </div>
                    <p className="text-center text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide">Research Output Year-on-Year</p>
                </div>

                {/* Pie Chart Mockup */}
                <div className="w-full md:w-64 bg-white/95 backdrop-blur rounded-xl p-3 shadow-xl border-b-4 border-purple-500 h-32 flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16 rounded-full border-8 border-purple-200 border-t-purple-600 border-r-purple-600 rotate-45">
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-700">72%</div>
                    </div>
                    <p className="text-center text-xs font-bold text-slate-500 mt-4 uppercase tracking-wide">Grant Utilization</p>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: "Institutional Comparison",
        subtitle: "Benchmark performance against other approved institutes.",
        bg: "bg-gradient-to-r from-slate-800 to-gray-900",
        content: (
            <div className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl p-3 h-[18rem] md:h-[15rem] flex flex-col">
                <div className="flex items-center justify-between mb-2 px-4">
                    <h3 className="text-lg font-bold text-slate-800">Comparative Analysis</h3>
                    <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Live Data</div>
                </div >
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                { name: 'Placement', A: 92, B: 85 },
                                { name: 'Research', A: 75, B: 88 },
                                { name: 'Infra', A: 85, B: 72 },
                                { name: 'Diversity', A: 78, B: 82 },
                            ]}
                            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="A" name="Engineering College A" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                            <Bar dataKey="B" name="Engineering College B" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div >
        )
    }
];

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleGetStarted = () => {
        navigate("/login");
    };

    // Auto slide
    useEffect(() => {
        const interval = setInterval(
            () => setCurrentSlide((prev) => (prev + 1) % slides.length),
            2000
        );
        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* --- NAVBAR --- */}
            <header className="w-full bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={sarthiLogo} alt="SARTHI Logo" className="w-12 h-12 object-contain" />
                        <div>
                            <h1 className="text-sm font-bold tracking-widest text-indigo-700 uppercase">
                                SARTHI Portal
                            </h1>
                            <p className="text-[10px] text-slate-500 font-medium">
                                One Portal for UGC & AICTE Compliance
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleGetStarted}
                        className="hidden md:inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition"
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col">
                {/* --- FULL WIDTH HERO SLIDER --- */}
                <div className="relative w-full bg-slate-900 group">
                    {/* 2.70:1 Aspect Ratio Container -> Updated to be taller and have min-height */}
                    <div className="relative w-full h-[380px] md:h-[420px] overflow-hidden">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                                    } ${slide.bg}`}
                                style={{
                                    transform: `translateX(${(index - currentSlide) * 100}%)`,
                                    opacity: index === currentSlide ? 1 : 0
                                }}
                            >
                                {/* Slide Content Container */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-10 gap-4">
                                    <div className="text-center max-w-3xl z-10">
                                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-md">{slide.title}</h2>
                                        <p className="text-blue-100 text-base md:text-lg font-light">{slide.subtitle}</p>
                                    </div>

                                    {/* Visual Element */}
                                    <div className="w-full flex-grow flex items-center justify-center z-10 transform scale-90 md:scale-100 min-h-0">
                                        {slide.content}
                                    </div>

                                    {/* Background Decor */}
                                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                        <div className="absolute -top-1/2 -left-1/2 w-[100%] h-[100%] bg-white/5 rounded-full blur-3xl"></div>
                                        <div className="absolute top-1/2 right-0 w-[50%] h-[100%] bg-blue-500/10 rounded-full blur-3xl"></div>
                                    </div>
                                </div>
                            </div>
                        ))}



                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 z-20"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 z-20"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- INFO CARDS SECTION --- */}
                <section className="py-8 px-4 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-6">
                            <h3 className="text-3xl font-bold text-slate-900">Streamlining Higher Education</h3>
                            <p className="text-slate-500 mt-2">Centralized management for UGC, AICTE, NAAC & NIRF</p>
                            <div className="mt-4">
                                <button
                                    onClick={handleGetStarted}
                                    className="group px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 inline-flex items-center gap-3"
                                >
                                    Get Started
                                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Card 1 */}
                            <div className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">About SARTHI</h3>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                        Centralised academic & regulatory record management
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                        Secure document upload, e-sign and verification
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                        Real-time dashboards for approvals & submissions
                                    </li>
                                </ul>
                            </div>

                            {/* Card 2 */}
                            <div className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-emerald-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Approval Flow</h3>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                        Upload institutional data & mandatory documents
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                        Automated validation & compliance checks
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                        Transparent status, queries & feedback in portal
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SIMPLE ANALYTICS STRIP --- */}
                <section className="bg-slate-50 border-y border-slate-200">
                    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">Integrated Analytics</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Combined indicators from NAAC, NIRF, UGC, AICTE and AISHE in a single dashboard.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">Early Risk Detection</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Flags missing data, expiring approvals and low-performing criteria before deadlines.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">Evidence-Based Decisions</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Support strategic planning with clear visual trends and reliable metrics.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-white pt-10 pb-6 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <img
                        src={footerLogos}
                        alt="Government Logos"
                        className="mx-auto mb-6 h-16 md:h-20 object-contain opacity-90 hover:opacity-100 transition"
                    />
                    <div className="border-t border-slate-100 pt-6">
                        <p className="text-sm text-slate-500">
                            © 2024 SARTHI - Streamlining Academic Records & Transforming Higher Education Infrastructure
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                            Need help? Contact us at{" "}
                            <a href="mailto:support@sarthi.gov.in" className="text-indigo-600 hover:text-indigo-800 font-medium">
                                support@sarthi.gov.in
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
