import { useState, useEffect } from "react";
import InstituteLayout from "../components/layout/InstituteLayout";
import UGCLayout from "../components/layout/UGCLayout";
import { useAuth } from "../contexts/AuthContext.jsx";
import axios from "../api/axios.config.js";

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
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/contact");
      setContactInfo(response.data.data.contactInfo);
    } catch (error) {
      console.error("Error fetching contact information:", error);
      // Fallback to default data
      setContactInfo({
        officeName: "SARTHI National Portal",
        address: "National Institute of Technology Jamshedpur, Adityapur Industrial Area",
        city: "Jamshedpur",
        state: "Jharkhand",
        pincode: "831014",
        country: "India",
        phoneNumbers: [
          { label: "Support Hotline", number: "+91 123-456-7891" }
        ],
        emailAddresses: [
          { label: "Support", email: "support@edurank.gov" },
          { label: "Partnerships", email: "partners@edurank.gov" }
        ],
        workingHours: "Monday - Friday, 9:00 AM - 5:00 PM IST",
        socialMedia: [],
        mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.041668468091!2d86.1415411!3d22.7770223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5e5c5c5c5c5c5%3A0x5c5c5c5c5c5c5c5c!2sNational%20Institute%20of%20Technology%20Jamshedpur!5e0!3m2!1sen!2sin!4v1234567890!5m2!1sen!2sin",
        description: "Government portal for educational institution ranking and assessment",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFormSubmission = async (e) => {
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

    try {
      // In a real implementation, you would send this to your backend
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFormStatus({
        message:
          "Thank you! Your message has been received and we will contact you shortly. ✨",
        type: "success",
      });
      setFormData({ name: "", email: "", message: "" });

      setTimeout(() => {
        setFormStatus({ message: "", type: "" });
      }, 8000);
    } catch (error) {
      setFormStatus({
        message: "Failed to submit message. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusClasses =
    formStatus.type === "success"
      ? "text-green-300"
      : formStatus.type === "error"
        ? "text-yellow-300"
        : "text-white";

  if (loading) {
    return (
      <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* CONTACT INFORMATION */}
        <div>
          <span className="font-semibold mb-2 block text-primary-blue">
            24/7 Support and Guidance
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
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
              href={contactInfo?.mapEmbedUrl || "https://www.google.com/maps"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start space-x-4 p-4 -m-4 rounded-lg hover:bg-indigo-50 transition duration-150 cursor-pointer"
            >
              <MapMarkerIcon className="w-8 h-8 pt-1 text-primary-blue" />
              <div>
                <h3 className="text-xl font-semibold text-deep-indigo">
                  {contactInfo?.officeName || "Our Corporate Office"}
                </h3>
                <p className="text-gray-600">
                  {contactInfo?.address || "Address not available"}
                  {contactInfo?.city && <br />}
                  {contactInfo?.city && `${contactInfo.city}, `}
                  {contactInfo?.state && `${contactInfo.state} `}
                  {contactInfo?.pincode && `${contactInfo.pincode}`}
                  {contactInfo?.country && <br />}
                  {contactInfo?.country && contactInfo.country}
                </p>
                {contactInfo?.workingHours && (
                  <p className="text-sm text-gray-500 mt-1">
                    ⏰ {contactInfo.workingHours}
                  </p>
                )}
              </div>
            </a>

            {/* Email */}
            <div className="flex items-start space-x-4 p-4 -m-4 rounded-lg hover:bg-indigo-50 transition duration-150">
              <EnvelopeIcon className="w-8 h-8 pt-1 text-primary-blue" />
              <div>
                <h3 className="text-xl font-semibold text-deep-indigo">
                  Email Us
                </h3>
                {contactInfo?.emailAddresses?.length > 0 ? (
                  contactInfo.emailAddresses.map((email, index) => (
                    <p key={index} className="text-gray-600">
                      {email.label}:{" "}
                      <a
                        href={`mailto:${email.email}`}
                        className="text-primary-blue hover:underline"
                      >
                        {email.email}
                      </a>
                    </p>
                  ))
                ) : (
                  <p className="text-gray-600">
                    For Support:{" "}
                    <a
                      href="mailto:support@edurank.gov"
                      className="text-primary-blue hover:underline"
                    >
                      support@edurank.gov
                    </a>
                    <br />
                    For Partnerships:{" "}
                    <a
                      href="mailto:partners@edurank.gov"
                      className="text-primary-blue hover:underline"
                    >
                      partners@edurank.gov
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4 p-4 -m-4 rounded-lg hover:bg-indigo-50 transition duration-150">
              <PhoneIcon className="w-8 h-8 pt-1 text-primary-blue" />
              <div>
                <h3 className="text-xl font-semibold text-deep-indigo">
                  Call Us
                </h3>
                {contactInfo?.phoneNumbers?.length > 0 ? (
                  contactInfo.phoneNumbers.map((phone, index) => (
                    <p key={index} className="text-gray-600">
                      {phone.label}:{" "}
                      <a
                        href={`tel:${phone.number.replace(/\D/g, '')}`}
                        className="text-primary-blue hover:underline"
                      >
                        {phone.number}
                      </a>
                    </p>
                  ))
                ) : (
                  <p className="text-gray-600">
                    Support Hotline:{" "}
                    <a
                      href="tel:+911234567891"
                      className="text-primary-blue hover:underline"
                    >
                      +91 123-456-7891
                    </a>
                    <br />
                    Mon - Fri, 9:00 AM - 5:00 PM IST
                  </p>
                )}
                {contactInfo?.workingHours && (
                  <p className="text-sm text-gray-500 mt-1">
                    ⏰ {contactInfo.workingHours}
                  </p>
                )}
              </div>
            </div>

            {/* Social Media */}
            {contactInfo?.socialMedia?.length > 0 && (
              <div className="flex items-start space-x-4 p-4 -m-4 rounded-lg hover:bg-indigo-50 transition duration-150">
                <div className="w-8 h-8 pt-1 text-primary-blue flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-deep-indigo">
                    Follow Us
                  </h3>
                  <div className="flex space-x-3 mt-2">
                    {contactInfo.socialMedia.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-blue hover:text-indigo-700"
                        title={social.platform}
                      >
                        {social.icon || social.platform}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
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

export default ContactUsPage;
