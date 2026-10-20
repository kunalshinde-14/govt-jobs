import { useState, useEffect } from "react";
import axios from "axios";
import { X, Sliders, GraduationCap, Building2, MapPin, Bell, Check, Loader2, Info } from "lucide-react";
import BASE_URL from "../utils/api";

const SECTORS_LIST = [
  "Banking",
  "Defence",
  "Railway",
  "SSC",
  "UPSC",
  "Police",
  "Teaching",
  "State PSC",
];

const STATES_LIST = [
  "All India",
  "Maharashtra",
  "Bihar",
  "Rajasthan",
  "Uttar Pradesh",
  "Punjab",
  "Delhi",
  "Tamil Nadu",
  "Madhya Pradesh",
  "Gujarat",
  "West Bengal",
  "Karnataka",
];

export default function PreferencesModal({ isOpen, onClose, onPreferencesSaved }) {
  const [qualifications, setQualifications] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [states, setStates] = useState([]);
  const [frequency, setFrequency] = useState("daily");
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchPreferences = async () => {
      try {
        setFetching(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${BASE_URL}/api/users/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted && res.data?.preferences) {
          const p = res.data.preferences;
          setQualifications(p.qualification || []);
          setSectors(p.sectors || []);
          setStates(p.states || []);
          setFrequency(p.notifications?.frequency || "daily");
          setEmailAlerts(Boolean(p.notifications?.emailAlerts));
        }
      } catch (err) {
        console.error("Fetch preferences error:", err);
      } finally {
        if (isMounted) setFetching(false);
      }
    };

    fetchPreferences();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");

      const payload = {
        qualification: qualifications,
        sectors,
        states,
        notifications: {
          frequency,
          emailAlerts,
        },
      };

      await axios.put(`${BASE_URL}/api/users/preferences`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Preferences saved! Your matches will update automatically.");
      if (onPreferencesSaved) onPreferencesSaved(payload);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error("Save preferences error:", err);
      setMessage("Could not save preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#17243A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-[#E4EAF3] rounded-3xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-floating relative">
        {/* CLOSE / SKIP BUTTON */}
        <button
          onClick={onClose}
          aria-label="Close preferences"
          className="absolute top-5 right-5 p-2 rounded-xl text-[#66758A] hover:text-[#17243A] hover:bg-[#EAF2FF] transition"
        >
          <X size={18} />
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#EAF2FF] border border-[#D7DFEB] text-[#F28C28] flex items-center justify-center mb-3.5 shadow-subtle">
            <Sliders size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#17243A]">
            Opportunity Preferences
          </h2>
          <p className="text-xs sm:text-sm text-[#66758A] mt-1">
            Personalize matching government jobs. You can change these anytime or skip.
          </p>
        </div>

        {fetching ? (
          <div className="py-12 text-center text-[#66758A]">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#F28C28]" />
            <p className="text-xs">Loading preferences...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. QUALIFICATIONS */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17243A] uppercase tracking-wider mb-2.5">
                <GraduationCap size={15} className="text-[#F28C28]" />
                <span>Your Educational Level</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["10th", "12th", "Graduate"].map((q) => {
                  const selected = qualifications.includes(q);
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => toggleItem(qualifications, setQualifications, q)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        selected
                          ? "bg-[#F28C28] text-white border-[#F28C28] shadow-subtle"
                          : "bg-[#F7F8FC] text-[#23334D] border-[#E4EAF3] hover:bg-[#EAF2FF] hover:border-[#D7DFEB]"
                      }`}
                    >
                      <span>{q} Pass</span>
                      {selected && <Check size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. SECTORS */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17243A] uppercase tracking-wider mb-2.5">
                <Building2 size={15} className="text-[#F28C28]" />
                <span>Target Sectors & Departments</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SECTORS_LIST.map((s) => {
                  const selected = sectors.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleItem(sectors, setSectors, s)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        selected
                          ? "bg-[#17243A] text-white border-[#17243A] shadow-subtle"
                          : "bg-[#F7F8FC] text-[#23334D] border-[#E4EAF3] hover:bg-[#EAF2FF] hover:border-[#D7DFEB]"
                      }`}
                    >
                      <span>{s}</span>
                      {selected && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. STATES */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17243A] uppercase tracking-wider mb-2.5">
                <MapPin size={15} className="text-[#F28C28]" />
                <span>Preferred Posting Regions</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#F7F8FC] rounded-2xl border border-[#E4EAF3]">
                {STATES_LIST.map((st) => {
                  const selected = states.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleItem(states, setStates, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selected
                          ? "bg-[#EAF2FF] text-[#17243A] border-[#D7DFEB] font-bold"
                          : "bg-white text-[#66758A] border-[#E4EAF3] hover:text-[#17243A]"
                      }`}
                    >
                      <span>{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. NOTIFICATIONS */}
            <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E4EAF3] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#17243A]">
                <Bell size={15} className="text-[#F28C28]" />
                <span>Summary & Alert Frequency</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "daily", label: "Daily Digest" },
                  { id: "weekly", label: "Weekly Digest" },
                  { id: "none", label: "In-App Only" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFrequency(opt.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                      frequency === opt.id
                        ? "bg-white text-[#17243A] border-[#F28C28] ring-2 ring-[#F28C28]/20 shadow-subtle"
                        : "bg-white text-[#66758A] border-[#E4EAF3] hover:bg-[#EAF2FF]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 pt-1 text-xs text-[#23334D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-[#E4EAF3] text-[#F28C28] focus:ring-[#F28C28]"
                />
                <span>Email me verified opportunity alerts and closing deadlines</span>
              </label>
            </div>

            {/* NOTICE */}
            <div className="flex items-start gap-2 text-[11px] text-[#66758A] bg-[#EAF2FF] border border-[#D7DFEB] p-3 rounded-xl">
              <Info size={14} className="text-[#F28C28] shrink-0 mt-0.5" />
              <span>
                Matching is transparent and criteria-based. JanSetu never guarantees eligibility or charges candidate discovery fees.
              </span>
            </div>

            {/* STATUS MESSAGE */}
            {message && (
              <p className="text-xs text-center font-bold text-[#159B82] animate-in fade-in">
                {message}
              </p>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#66758A] hover:text-[#17243A] hover:bg-[#F7F8FC] border border-transparent transition"
              >
                Skip for now
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#E07D1B] disabled:opacity-70 text-white text-xs sm:text-sm font-semibold transition shadow-subtle flex items-center gap-1.5"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

