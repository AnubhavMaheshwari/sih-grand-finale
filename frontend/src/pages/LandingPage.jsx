import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import sarthiLogo from '../assets/images/sarthiLogo.png';
import footerLogos from '../assets/images/footer_logos.png';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 py-8">
                <div className="text-center max-w-6xl mx-auto">
                    {/* Logo */}
                    <img src={sarthiLogo} alt="SARTHI Logo" className="w-40 h-40 mx-auto mb-6" />

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
                        Welcome to <span className="text-indigo-600">SARTHI</span> Portal
                    </h1>

                    {/* Detailed Information Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-left max-w-5xl mx-auto">
                        {/* About Website */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">About SARTHI</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>Comprehensive digital platform for academic record management</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>Secure document upload and verification system</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>Real-time tracking and status updates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>Automated compliance monitoring and reporting</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>Integration with regulatory bodies for seamless data exchange</span>
                                </li>
                            </ul>
                        </div>

                        {/* UGC & AICTE Approval Process */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">UGC & AICTE Approval Process</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>Submit institutional documents through the portal</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>Automated verification of academic credentials</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>Quality assessment and compliance checks</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>Direct communication with regulatory authorities</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>Transparent approval status and feedback mechanism</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Get Started Button */}
                    <button
                        onClick={handleGetStarted}
                        className="group relative px-10 py-4 text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-110 transition-all duration-300"
                    >
                        <span className="flex items-center gap-3">
                            Get Started
                            <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
                        </span>
                    </button>
                </div>
            </div>

            {/* Footer with Image */}
            <footer className="bg-white border-t border-gray-200 py-6 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    {/* Footer Image */}
                    <img
                        src={footerLogos}
                        alt="Footer Logos"
                        className="mx-auto mb-4 max-w-full h-auto"
                        style={{ maxHeight: '80px' }}
                    />

                    {/* Copyright */}
                    <p className="text-sm text-gray-600">
                        © 2024 SARTHI - Streamlining Academic Records & Transforming Higher Education Infrastructure
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Need help? Contact us at{' '}
                        <a href="mailto:support@sarthi.gov.in" className="text-indigo-600 hover:underline">
                            support@sarthi.gov.in
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
