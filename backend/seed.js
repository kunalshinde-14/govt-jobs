const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const Job = require("./models/Job");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const jobs = [
  // ⚡ CLOSING VERY SOON (these 3 will appear in Closing Soon section)
  {
    title: "Indian Army Agniveer",
    department: "Defence",
    qualification: "12th",
    state: "All India",
    salary: "₹30,000 - ₹40,000",
    vacancies: 25000,
    lastDate: "2026-05-12",
    applyLink: "https://joinindianarmy.nic.in",
  },
  {
    title: "Railway Group D",
    department: "Railway",
    qualification: "10th",
    state: "All India",
    salary: "₹18,000 - ₹56,900",
    vacancies: 12000,
    lastDate: "2026-05-18",
    applyLink: "https://indianrailways.gov.in",
  },
  {
    title: "SSC CHSL 2026",
    department: "SSC",
    qualification: "12th",
    state: "All India",
    salary: "₹25,000 - ₹81,000",
    vacancies: 4500,
    lastDate: "2026-05-25",
    applyLink: "https://ssc.nic.in",
  },

  // ✅ LATEST JOBS (different deadlines, won't overlap with Closing Soon)
  {
    title: "IBPS PO 2026",
    department: "Banking",
    qualification: "Graduate",
    state: "All India",
    salary: "₹52,000 - ₹55,000",
    vacancies: 3200,
    lastDate: "2026-06-02",
    applyLink: "https://ibps.in",
  },
  {
    title: "UPSC Civil Services",
    department: "UPSC",
    qualification: "Graduate",
    state: "All India",
    salary: "₹56,100 - ₹2,50,000",
    vacancies: 1056,
    lastDate: "2026-06-10",
    applyLink: "https://upsc.gov.in",
  },
  {
    title: "Maharashtra Police Constable",
    department: "Police",
    qualification: "12th",
    state: "Maharashtra",
    salary: "₹21,700 - ₹69,100",
    vacancies: 17471,
    lastDate: "2026-06-15",
    applyLink: "https://mahapolice.gov.in",
  },
  {
    title: "SSC CGL 2026",
    department: "SSC",
    qualification: "Graduate",
    state: "All India",
    salary: "₹47,600 - ₹1,51,100",
    vacancies: 6700,
    lastDate: "2026-06-20",
    applyLink: "https://ssc.nic.in",
  },
  {
    title: "RRB NTPC 2026",
    department: "Railway",
    qualification: "12th",
    state: "All India",
    salary: "₹19,900 - ₹35,400",
    vacancies: 8000,
    lastDate: "2026-06-25",
    applyLink: "https://indianrailways.gov.in",
  },
  {
    title: "MPSC State Services",
    department: "MPSC",
    qualification: "Graduate",
    state: "Maharashtra",
    salary: "₹56,100 - ₹1,77,500",
    vacancies: 200,
    lastDate: "2026-06-28",
    applyLink: "https://mpsc.gov.in",
  },
  {
    title: "Navy Sailor 2026",
    department: "Defence",
    qualification: "10th",
    state: "All India",
    salary: "₹21,700 - ₹69,100",
    vacancies: 2800,
    lastDate: "2026-07-05",
    applyLink: "https://joinindiannavy.gov.in",
  },
  {
    title: "SBI Clerk 2026",
    department: "Banking",
    qualification: "Graduate",
    state: "All India",
    salary: "₹26,000 - ₹59,170",
    vacancies: 13735,
    lastDate: "2026-07-10",
    applyLink: "https://sbi.co.in",
  },
  {
    title: "CISF Constable",
    department: "Defence",
    qualification: "12th",
    state: "All India",
    salary: "₹21,700 - ₹69,100",
    vacancies: 1130,
    lastDate: "2026-07-15",
    applyLink: "https://cisf.gov.in",
  },
  {
    title: "Bihar Police SI",
    department: "Police",
    qualification: "Graduate",
    state: "Bihar",
    salary: "₹35,400 - ₹1,12,400",
    vacancies: 1998,
    lastDate: "2026-07-20",
    applyLink: "https://bpssc.bih.nic.in",
  },
  {
    title: "DRDO Technician",
    department: "Defence",
    qualification: "10th",
    state: "All India",
    salary: "₹18,000 - ₹56,900",
    vacancies: 635,
    lastDate: "2026-07-25",
    applyLink: "https://drdo.gov.in",
  },
  {
    title: "LIC AAO 2026",
    department: "Banking",
    qualification: "Graduate",
    state: "All India",
    salary: "₹53,600 - ₹64,400",
    vacancies: 300,
    lastDate: "2026-08-01",
    applyLink: "https://licindia.in",
  },
];

const importData = async () => {
  try {
    await Job.deleteMany();
    await Job.insertMany(jobs);
    console.log(`✅ ${jobs.length} Jobs Seeded Successfully`);
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

importData();