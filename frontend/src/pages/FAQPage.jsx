import { useState, useEffect } from "react";
import InstituteLayout from "../components/layout/InstituteLayout";
import UGCLayout from "../components/layout/UGCLayout";
import { useAuth } from "../contexts/AuthContext.jsx";
import axios from "../api/axios.config.js";

const PRIMARY_BLUE = "#4F46E5"; // Primary Blue
const DEEP_INDIGO = "#3730A3"; // Deep Indigo

/** Single FAQ item */
function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div
      className="rounded-xl bg-indigo-50 p-5 shadow-sm cursor-pointer"
      onClick={onToggle}
    >
      <button
        className="flex justify-between items-center w-full text-left text-lg font-semibold focus:outline-none"
        style={{ color: DEEP_INDIGO }}
      >
        <span>{question}</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? "rotate-90" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: PRIMARY_BLUE }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </button>
      <div
        className={`mt-3 text-indigo-700 leading-relaxed ${isOpen ? "block" : "hidden"
          }`}
      >
        {answer}
      </div>
    </div>
  );
}

/** Main FAQ Page */
function FAQPage() {
  const { user } = useAuth();
  const [openIndex, setOpenIndex] = useState(null);
  const [formMessage, setFormMessage] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General" },
    { value: "technical", label: "Technical" },
    { value: "submission", label: "Submission" },
    { value: "account", label: "Account" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchFAQs();
  }, [selectedCategory]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === "all" 
        ? "/api/faq" 
        : `/api/faq?category=${selectedCategory}`;
      
      const response = await axios.get(url);
      setFaqs(response.data.data.faqs || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      // Fallback to static data if API fails
      setFaqs([
        {
          question: "What technology is behind this platform?",
          answer: "This platform is powered by a robust technology stack designed for performance and security. At its core, we utilize Artificial Intelligence (AI) and Machine Learning (ML) models to automate the analysis of historical data and generate insightful performance reports.",
        },
        {
          question: "How does the AI evaluate an institution's performance?",
          answer: "Our AI provides an unbiased and data-driven evaluation by systematically analyzing a wide range of inputs, including historical performance data, faculty metrics, and participation in national schemes like NIRF, ensuring every institution is evaluated on the same consistent criteria.",
        },
        {
          question: "What types of reports can the system generate?",
          answer: "Our system generates a variety of detailed reports, including longitudinal trend reports, comparative analysis against peer institutions, and document sufficiency reports that highlight any missing or incomplete submissions, providing a comprehensive overview of institutional performance.",
        },
        {
          question: "How does this tool make the review process more efficient?",
          answer: "This tool makes the review process more efficient by automating repetitive and time-consuming tasks. Instead of manual data analysis, our AI instantly processes records to generate performance reports, allowing human reviewers to focus on critical evaluation and decision-making.",
        },
        {
          question: "What is the expected timeline for review?",
          answer: "The AI provides instantaneous preliminary assessment reports. Final review by UGC/AICTE members, supported by the AI-generated reports, typically takes between 7 to 14 business days, depending on the complexity and volume of the submitted data.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");
    
    try {
      // In a real implementation, you would send this to your backend
      // For now, we'll just show a success message
      setFormMessage("Question submitted! We'll get back to you soon.");
      e.target.reset();

      setTimeout(() => {
        setFormMessage("");
      }, 5000);
    } catch (error) {
      console.error("Error submitting question:", error);
      setFormMessage("Failed to submit question. Please try again.");
    }
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: FAQ List */}
        <div>
          <span className="font-semibold mb-2 block text-primary-blue">
            We've Got Answers
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-lg">
            Save time and find instant solutions without the hassle. From
            detailed guidance to quick tips, everything you need is just a
            click away.
          </p>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-8 bg-gray-100 rounded-xl">
              <p className="text-gray-500">No FAQs found for the selected category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((item, index) => (
                <FAQItem
                  key={item._id || index}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Contact form */}
        <div>
          <div className="p-8 rounded-2xl shadow-lg mt-14 lg:mt-0 bg-deep-indigo">
            <h2 className="text-2xl font-semibold text-white text-center mb-8">
              Any Question For Us?
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <input
                type="text"
                name="name"
                placeholder="Your Name...."
                required
                className="w-full p-4 rounded-xl bg-indigo-100 text-deep-indigo placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email...."
                required
                className="w-full p-4 rounded-xl bg-indigo-100 text-deep-indigo placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              <textarea
                name="message"
                placeholder="Enter your message...."
                rows="6"
                required
                className="w-full p-4 rounded-xl bg-indigo-100 text-deep-indigo placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-primary-blue text-white py-4 rounded-xl font-semibold text-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-deep-indigo"
              >
                Submit Question
              </button>

              {formMessage && (
                <div className="text-center font-medium pt-4 text-green-300">
                  {formMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  // Wrap content in appropriate layout based on user role
  if (user?.role === "institute") {
    return <InstituteLayout>{content}</InstituteLayout>;
  } else if (user?.role === "ugc_employee") {
    return <UGCLayout>{content}</UGCLayout>;
  }

  // For non-logged in users or other roles, return plain content
  return (
    <div className="bg-gray-50 min-h-screen">
      {content}
    </div>
  );
}

export default FAQPage;
