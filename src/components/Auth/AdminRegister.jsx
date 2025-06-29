import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/api";
import { JOB_TITLES } from "../../constants/jobTitles";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../../firebase";

const AdminRegistration = () => {
  const isAdminRoute = window.location.pathname === "/admin-register";

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "Monday01",
    jobTitles: isAdminRoute ? ["Admin", ""] : [""],
    passcode: ""
  });

  const [isAdminSelected, setIsAdminSelected] = useState(false);
  const [adminCodeValid, setAdminCodeValid] = useState(false);

  const [otpStage, setOtpStage] = useState("none"); // none | sent | verifying | verified
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const triggerRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      const container = document.getElementById("recaptcha-container");
      if (!container) {
        const newContainer = document.createElement("div");
        newContainer.id = "recaptcha-container";
        document.body.appendChild(newContainer);
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      });
    }
    return window.recaptchaVerifier;
  };

  const sendOtp = async () => {
    const fullPhone = `+91${form.mobile}`;
    try {
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, triggerRecaptcha());
      setConfirmationResult(confirmation);
      setOtpStage("sent");
      alert("OTP sent to your mobile.");
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP. Try again.");
    }
  };

  const verifyOtp = async () => {
    if (!otp || !confirmationResult) {
      alert("Enter the OTP sent to your phone.");
      return;
    }

    setOtpStage("verifying");
    try {
      await confirmationResult.confirm(otp);
      setOtpStage("verified");
      alert("✅ OTP verified.");
      submitForm(); // Proceed with registration
    } catch (err) {
      console.error(err);
      alert("❌ Invalid OTP.");
      setOtpStage("sent");
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!form.name || !form.mobile) {
      alert("Name and Mobile are required.");
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Send OTP
    await sendOtp();
  };

  const submitForm = async () => {
    const isAdmin = isAdminRoute || (form.jobTitles[0] === "Admin" && adminCodeValid);
    const jobTitles = isAdmin ? ["Admin", form.jobTitles[1]] : [form.jobTitles[0]];

    const payload = {
      name: form.name,
      mobile: form.mobile,
      password: form.password,
      jobTitles,
      isAdmin
    };

    try {
      console.log(payload);
      await axios.post(`${BASE_URL}/api/users/register`, payload);
      alert(isAdminRoute ? "Admin registered successfully!" : "User request submitted!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Registration failed.";
      alert(`❌ ${errorMsg}`);
    }
  };

  const resetOtpFlow = () => {
    setOtp("");
    setOtpStage("none");
    setConfirmationResult(null);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {isAdminRoute ? "Admin Registration" : "User Registration"}
      </h2>

      <form onSubmit={otpStage === "none" ? handleInitialSubmit : (e) => e.preventDefault()} className="space-y-4">
        {/* Name & Mobile */}
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border px-3 py-2"
          disabled={otpStage !== "none"}
        />
        <input
          name="mobile"
          value={form.mobile}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d{0,10}$/.test(val)) {
              setForm({ ...form, mobile: val });
            }
          }}
          placeholder="Mobile"
          className="w-full border px-3 py-2"
          inputMode="numeric"
          disabled={otpStage !== "none"}
        />

        {otpStage === "none" && (
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send OTP & Continue
          </button>
        )}

        {/* OTP Verification Section */}
        {otpStage === "sent" && (
          <>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border px-3 py-2"
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={verifyOtp}
              >
                Verify OTP
              </button>
              <button
                type="button"
                className="bg-yellow-500 text-white px-4 py-2 rounded"
                onClick={sendOtp}
              >
                Resend OTP
              </button>
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={resetOtpFlow}
              >
                Change Mobile
              </button>
            </div>
          </>
        )}

        {/* Admin Job Title selection */}
        {otpStage === "verified" && (
          <>
            <label className="block font-medium">Job Title(s)</label>
            {isAdminRoute ? (
              <>
                <select
                  className="w-full border px-3 py-2 bg-gray-100 cursor-not-allowed"
                  disabled
                >
                  <option value="Admin">Admin</option>
                </select>
                <select
                  className="w-full border px-3 py-2"
                  value={form.jobTitles[1] || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      jobTitles: ["Admin", e.target.value]
                    }))
                  }
                >
                  <option value="">Select Secondary Job Title</option>
                  {JOB_TITLES.filter(t => t !== "Admin").map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  name="passcode"
                  type="password"
                  placeholder="Admin Passcode"
                  className="w-full border px-3 py-2"
                  value={form.passcode}
                  onChange={handleChange}
                />
              </>
            ) : (
              <>
                <select
                  className="w-full border px-3 py-2"
                  value={form.jobTitles[0] || ""}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setForm({ ...form, jobTitles: [selected], passcode: "" });

                    if (selected === "Admin") {
                      setIsAdminSelected(true);
                      setAdminCodeValid(false);
                    } else {
                      setIsAdminSelected(false);
                      setAdminCodeValid(false);
                    }
                  }}
                >
                  <option value="">Select Job Title</option>
                  {JOB_TITLES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                {isAdminSelected && !adminCodeValid && (
                  <input
                    type="password"
                    placeholder="Enter Admin Code"
                    className="w-full border px-3 py-2"
                    value={form.passcode}
                    onChange={(e) => setForm({ ...form, passcode: e.target.value })}
                    onBlur={() => {
                      if (form.passcode === "King@2025") {
                        setAdminCodeValid(true);
                      } else {
                        alert("❌ Invalid Admin code. Use other Job Titles.");
                        setForm({ ...form, jobTitles: [""], passcode: "" });
                        setIsAdminSelected(false);
                        setAdminCodeValid(false);
                      }
                    }}
                  />
                )}

                {adminCodeValid && (
                  <select
                    className="w-full border px-3 py-2"
                    value={form.jobTitles[1] || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        jobTitles: ["Admin", e.target.value]
                      }))
                    }
                  >
                    <option value="">Select Secondary Job Title</option>
                    {JOB_TITLES.filter(t => t !== "Admin").map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </>
            )}

            {otpStage === "verified" && (
              <button
                type="button"
                className={`px-4 py-2 rounded mt-4 text-white ${(
                  (isAdminRoute && !form.jobTitles[1]) ||
                  (!isAdminRoute && (
                    form.jobTitles[0] === "" ||
                    (form.jobTitles[0] === "Admin" && (!adminCodeValid || !form.jobTitles[1]))
                  ))
                ) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"}`}
                disabled={
                  (isAdminRoute && !form.jobTitles[1]) ||
                  (!isAdminRoute && (
                    form.jobTitles[0] === "" ||
                    (form.jobTitles[0] === "Admin" && (!adminCodeValid || !form.jobTitles[1]))
                  ))
                }
                onClick={submitForm}
              >
                {isAdminRoute ? "Register Admin" : "Submit Request"}
              </button>
            )}
          </>
        )}
        <div id="recaptcha-container"></div>
      </form>

      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Login here
        </a>
      </p>
    </div>
  );
};

export default AdminRegistration;
