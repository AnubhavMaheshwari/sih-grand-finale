import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// Dummy DB for UI testing
const dummyEmails = {
  institute: ["college1@edu.in", "college2@edu.in"],
  employee: [
    { id: "UGCM123456", email: "ugcemp1@gov.in" },
    { id: "AITC987654", email: "ugcemp2@gov.in" }
  ]
};

function ForgotPasswordPage() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const showToast = (msg, type) => {
    if (type === "success") toast.success(msg);
    else toast.error(msg);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!role) {
      const msg = "Please select your role!";
      showToast(msg, "error");
      setMessage({ text: msg, type: "error" });
      return;
    }

    if (role === "institute") {
      if (!dummyEmails.institute.includes(email.toLowerCase())) {
        const msg = "No registered institute found with this email!";
        showToast(msg, "error");
        setMessage({ text: msg, type: "error" });
        return;
      }
    }

    if (role === "employee") {
      const match = dummyEmails.employee.find(
        (u) => u.id === userId.toUpperCase() && u.email === email.toLowerCase()
      );
      if (!match) {
        const msg = "Invalid Employee ID or Email!";
        showToast(msg, "error");
        setMessage({ text: msg, type: "error" });
        return;
      }
    }

    const successMsg = "A password reset link has been sent to your email!";
    showToast(successMsg, "success");
    setMessage({ text: successMsg, type: "success" });

    setEmail("");
    setUserId("");
    setRole("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Forgot Password?
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Recover your account by verifying registered details.
        </p>

        {/* Inline Notification */}
        {message.text && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ROLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reset as
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="institute">Institute</option>
              <option value="employee">UGC/AICTE Employee</option>
            </select>
          </div>

          {/* Employee — User ID */}
          {role === "employee" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee / User ID
              </label>
              <input
                type="text"
                value={userId}
                placeholder="UGCM123456"
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border uppercase border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                maxLength="10"
                required
              />
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registered Email
            </label>
            <input
              type="email"
              value={email}
              placeholder="you@domain.in"
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3 rounded-xl font-semibold text-sm shadow-lg transition"
          >
            Verify & Send Reset Link
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-xs sm:text-sm text-indigo-600 hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
