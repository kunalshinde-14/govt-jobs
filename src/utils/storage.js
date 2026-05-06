export const getSavedJobs = () => {
  return JSON.parse(localStorage.getItem("savedJobs")) || [];
};

export const saveJob = (jobId) => {
  const saved = getSavedJobs();
  if (!saved.includes(jobId)) {
    localStorage.setItem(
      "savedJobs",
      JSON.stringify([...saved, jobId])
    );
  }
};

export const removeJob = (jobId) => {
  const saved = getSavedJobs().filter((id) => id !== jobId);
  localStorage.setItem("savedJobs", JSON.stringify(saved));
};