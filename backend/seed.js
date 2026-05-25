const dns = require("dns");

dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Job = require("./models/Job");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const jobs = [
  { title: "SSC CGL 2026", department: "SSC", qualification: "Graduate", state: "All India", salary: "₹47,600 - ₹1,51,100", vacancies: 12256, lastDate: "2026-06-22", applyLink: "https://ssc.gov.in" },
  { title: "RRB ALP 2026", department: "Railway", qualification: "10th", state: "All India", salary: "₹19,900 - ₹35,400", vacancies: 11127, lastDate: "2026-06-14", applyLink: "https://rrbapply.gov.in" },
  { title: "UPSC NDA (2) 2026", department: "UPSC", qualification: "12th", state: "All India", salary: "₹56,100 - ₹1,77,500", vacancies: 400, lastDate: "2026-06-17", applyLink: "https://upsc.gov.in" },
  { title: "UPSC CDS 2 Exam 2026", department: "UPSC", qualification: "Graduate", state: "All India", salary: "₹56,100 - ₹1,77,500", vacancies: 500, lastDate: "2026-06-17", applyLink: "https://upsc.gov.in" },
  { title: "SSC CHSL 2026", department: "SSC", qualification: "12th", state: "All India", salary: "₹25,500 - ₹81,100", vacancies: 3712, lastDate: "2026-07-07", applyLink: "https://ssc.gov.in" },
  { title: "BRO GREF 2026", department: "Defence", qualification: "10th", state: "All India", salary: "₹18,000 - ₹56,900", vacancies: 899, lastDate: "2026-06-20", applyLink: "https://bro.gov.in" },
  { title: "Indian Air Force AFCAT 02/2026", department: "Defence", qualification: "Graduate", state: "All India", salary: "₹56,100 - ₹1,77,500", vacancies: 250, lastDate: "2026-06-30", applyLink: "https://afcat.cdac.in" },
  { title: "IBPS PO 2026", department: "Banking", qualification: "Graduate", state: "All India", salary: "₹48,480 - ₹85,920", vacancies: 5000, lastDate: "2026-07-31", applyLink: "https://ibps.in" },
  { title: "IBPS Clerk 2026", department: "Banking", qualification: "Graduate", state: "All India", salary: "₹26,000 - ₹59,170", vacancies: 6000, lastDate: "2026-08-15", applyLink: "https://ibps.in" },
  { title: "RBI Grade B Officers 2026", department: "Banking", qualification: "Graduate", state: "All India", salary: "₹55,000 - ₹1,10,000", vacancies: 60, lastDate: "2026-06-25", applyLink: "https://rbi.org.in" },
  { title: "MPSC State Services 2026", department: "MPSC", qualification: "Graduate", state: "Maharashtra", salary: "₹56,100 - ₹1,77,500", vacancies: 200, lastDate: "2026-07-15", applyLink: "https://mpsc.gov.in" },
  { title: "Maharashtra Police Constable 2026", department: "Police", qualification: "12th", state: "Maharashtra", salary: "₹21,700 - ₹69,100", vacancies: 17471, lastDate: "2026-07-20", applyLink: "https://mahapolice.gov.in" },
  { title: "SPPU Assistant Professor 2026", department: "MPSC", qualification: "Graduate", state: "Maharashtra", salary: "₹57,700 - ₹1,82,400", vacancies: 133, lastDate: "2026-06-15", applyLink: "https://unipune.ac.in" },
  { title: "NALCO Non-Executive 2026", department: "SSC", qualification: "10th", state: "All India", salary: "₹18,000 - ₹40,000", vacancies: 300, lastDate: "2026-06-18", applyLink: "https://nalcoindia.com" },
  { title: "EdCIL Multi-Disciplinary 2026", department: "SSC", qualification: "Graduate", state: "All India", salary: "₹35,400 - ₹1,12,400", vacancies: 879, lastDate: "2026-06-22", applyLink: "https://edcilindia.co.in" },
  { title: "Punjab & Sind Bank Apprentice 2026", department: "Banking", qualification: "Graduate", state: "All India", salary: "₹15,000", vacancies: 200, lastDate: "2026-06-20", applyLink: "https://punjabandsindbank.co.in" },
  { title: "UPSC Various Posts 2026", department: "UPSC", qualification: "Graduate", state: "All India", salary: "₹56,100 - ₹2,50,000", vacancies: 194, lastDate: "2026-06-12", applyLink: "https://upsc.gov.in" },
  { title: "Indian Navy 10+2 B.Tech Entry 2027", department: "Defence", qualification: "12th", state: "All India", salary: "₹56,100 - ₹1,77,500", vacancies: 35, lastDate: "2026-06-28", applyLink: "https://joinindiannavy.gov.in" },
  { title: "RSSB Computer Instructor 2026", department: "SSC", qualification: "Graduate", state: "All India", salary: "₹29,200 - ₹92,300", vacancies: 3951, lastDate: "2026-06-25", applyLink: "https://rsmssb.rajasthan.gov.in" },
  { title: "CISF Head Constable 2026", department: "Police", qualification: "12th", state: "All India", salary: "₹25,500 - ₹81,100", vacancies: 1130, lastDate: "2026-07-10", applyLink: "https://cisf.gov.in" },
  { title: "UPSSSC AGTA 2026", department: "SSC", qualification: "Graduate", state: "All India", salary: "₹29,200 - ₹92,300", vacancies: 2759, lastDate: "2026-06-30", applyLink: "https://upsssc.gov.in" },
  { title: "SBI Clerk 2026", department: "Banking", qualification: "Graduate", state: "All India", salary: "₹26,000 - ₹59,170", vacancies: 13735, lastDate: "2026-08-01", applyLink: "https://sbi.co.in/careers" },
  { title: "DRDO CEPTAM 2026", department: "Defence", qualification: "10th", state: "All India", salary: "₹18,000 - ₹56,900", vacancies: 635, lastDate: "2026-07-15", applyLink: "https://drdo.gov.in" },
  { title: "Maharashtra Arogya Vibhag 2026", department: "MPSC", qualification: "12th", state: "Maharashtra", salary: "₹18,000 - ₹56,900", vacancies: 800, lastDate: "2026-07-05", applyLink: "https://arogya.maharashtra.gov.in" },
  { title: "LIC AAO 2026", department: "Banking", qualification: "Graduate", state: "All India", salary: "₹53,600 - ₹64,400", vacancies: 300, lastDate: "2026-08-10", applyLink: "https://licindia.in" },
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