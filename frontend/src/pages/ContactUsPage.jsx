import { useState } from "react";
import Navigation from "../components/layout/Navigation";

const PRIMARY_BLUE = "#4F46E5"; // Primary Blue
const DEEP_INDIGO = "#3730A3"; // Deep Indigo


const Footer = () => (
  <footer className="bg-white border-t border-gray-200 py-6 mt-12">
    <div className="container mx-auto text-center text-sm text-gray-500">
      &copy; 2025 SARTHI National Portal, all rights reserved
    </div>
  </footer>
);

const MapMarkerIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const EnvelopeIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const PhoneIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-5.65-5.65 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

// --- Main Contact Us Page Component ---
function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFormSubmission = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setFormStatus({
        message: "Please fill out all required fields.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setFormStatus({ message: "", type: "" });

    // Simulate API Call (2-second delay)
    setTimeout(() => {
      setIsSubmitting(false);

      setFormStatus({
        message:
          "Thank you! Your message has been received and we will contact you shortly. ✨",
        type: "success",
      });
      setFormData({ name: "", email: "", message: "" });

      setTimeout(() => {
        setFormStatus({ message: "", type: "" });
      }, 8000);
    }, 2000);
  };

  const statusClasses =
    formStatus.type === "success"
      ? "text-green-300"
      : formStatus.type === "error"
        ? "text-yellow-300"
        : "text-white";

  return (
    <>
      <style jsx="true">{`
        .text-primary-blue {
          color: ${PRIMARY_BLUE};
        }
        .text-deep-indigo {
          color: ${DEEP_INDIGO};
        }
        .bg-deep-indigo {
          background-color: ${DEEP_INDIGO};
        }
        .focus\\:ring-primary-blue:focus {
          --tw-ring-color: ${PRIMARY_BLUE};
        }
        .bg-primary-blue {
          background-color: ${PRIMARY_BLUE};
        }
        .hover\\:bg-indigo-700:hover {
          background-color: #4338ca;
        }
      `}</style>

      <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
        {/* ✅ Shared navbar, with correct active tab */}
        <Navigation currentPage="Contact Us" />

        <div className="container mx-auto px-4 py-16 grow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* CONTACT INFORMATION */}
            <div>
              <span className="font-semibold mb-2 block text-primary-blue">
                24/7 Support and Guidance
              </span>
              <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                We are ready to hear from you.
              </h1>
              <p className="text-lg text-gray-600 mb-10 max-w-lg">
                Whether you have a technical question, need support on
                regulatory compliance, or wish to discuss partnership
                opportunities, our team is on standby.
              </p>

              <div className="space-y-8 mt-12">
                {/* Office */}
                <a
                  href="https://www.google.com/maps/place/National+Institute+of+Technology+Jamshedpur+(NIT+Jamshedpur)/@22.7770223,86.1415411,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 -m-4 rounded-lg hover:bg-indigo-50 transition duration-150 cursor-pointer"
                >
                  <MapMarkerIcon className="w-8 h-8 pt-1 text-primary-blue" />
                  <div>
                    <h3 className="text-xl font-semibold text-deep-indigo">
                      Our Corporate Office
                    </h3>
                    <p className="text-gray-600">
                      National Institute of Technology Jamshedpur
                      <br />
                      Adityapur Industrial Area, Jamshedpur, Jharkhand 831014
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=support@edurank.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 -m-4 rounded-lg hover:bg-indigo-50 transition duration-150 cursor-pointer"
                >
                  <EnvelopeIcon className="w-8 h-8 pt-1 text-primary-blue" />
                  <div>
                    <h3 className="text-xl font-semibold text-deep-indigo">
                      Email Us
                    </h3>
                    <p className="text-gray-600">
                      For Support: support@edurank.gov
                      <br />
                      For Partnerships: partners@edurank.gov
                    </p>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href="tel:1234567891"
                  className="flex items-start space-x-4 p-4 -m-4 rounded-lg hover:bg-indigo-50 transition duration-150 cursor-pointer"
                >
                  <PhoneIcon className="w-8 h-8 pt-1 text-primary-blue" />
                  <div>
                    <h3 className="text-xl font-semibold text-deep-indigo">
                      Call Us
                    </h3>
                    <p className="text-gray-600">
                      Support Hotline: +91 123-456-7891 (Mock)
                      <br />
                      Mon - Fri, 9:00 AM - 5:00 PM IST
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* CONTACT FORM */}
            <div>
              <div className="mt-14 p-8 rounded-2xl shadow-xl lg:mt-0 bg-deep-indigo">
                <h2 className="text-3xl font-bold text-white text-center mb-8">
                  Send Us a Message
                </h2>
                <form onSubmit={handleFormSubmission} className="space-y-6">
                  <input
                    id="name"
                    type="text"
                    placeholder="Your Full Name..."
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full p-4 rounded-xl bg-indigo-100 text-deep-indigo placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-primary-blue transition duration-150"
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="Your Official Email..."
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full p-4 rounded-xl bg-indigo-100 text-deep-indigo placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-primary-blue transition duration-150"
                  />
                  <textarea
                    id="message"
                    placeholder="How can we help you today?..."
                    required
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full p-4 rounded-xl bg-indigo-100 text-deep-indigo placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none transition duration-150"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-deep-indigo ${isSubmitting
                        ? "bg-indigo-700 opacity-75 animate-pulse"
                        : "bg-primary-blue hover:bg-indigo-700"
                      }`}
                  >
                    {isSubmitting ? "Sending..." : "Submit Request"}
                  </button>
                  <div
                    className={`text-center font-medium mt-4 pt-2 ${statusClasses}`}
                  >
                    {formStatus.message}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default ContactUsPage;
