import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/api";
import { JOB_TITLES } from "../../constants/jobTitles";


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

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name || !form.mobile) {
      alert("Name and Mobile are required.");
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }


    if (!isAdminRoute && form.jobTitles[0] === "Admin") {
      if (!adminCodeValid) {
        alert("Admin code not verified.");
        return;
      }
      if (!form.jobTitles[1]) {
        alert("Please select a secondary job title.");
        return;
      }
    }

    const endpoint = isAdminRoute
      ? `${BASE_URL}/api/users/register`
      : `${BASE_URL}/api/users/register`;

    const isAdmin = isAdminRoute || (form.jobTitles[0] === "Admin" && adminCodeValid);
const jobTitles = isAdmin
  ? ["Admin", form.jobTitles[1]]
  : [form.jobTitles[0]];

const payload = {
  name: form.name,
  mobile: form.mobile,
  password: form.password,
  jobTitles,
  isAdmin
};

    try {
      await axios.post(endpoint, payload);
      alert(isAdminRoute ? "Admin registered successfully!" : "User request submitted!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {isAdminRoute ? "Admin Registration" : "User Registration"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border px-3 py-2"
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
        />

        {/* Job Title Selection */}
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
              {JOB_TITLES.filter(title => title !== "Admin").map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
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
              {JOB_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>


            {/* Admin passcode input if Admin is selected */}
            {isAdminSelected && !adminCodeValid && (
              <input
                type="password"
                placeholder="Enter Admin Code"
                className="w-full border px-3 py-2"
                value={form.passcode}
                onChange={(e) =>
                  setForm({ ...form, passcode: e.target.value })
                }
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

            {/* Secondary job title if Admin verified */}
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
                {JOB_TITLES.filter(title => title !== "Admin").map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isAdminRoute ? "Register Admin" : "Submit Request"}
        </button>
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
