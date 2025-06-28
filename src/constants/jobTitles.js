export const JOB_TITLES = [
  "Admin",
  "Front Office Manager",
  "Assistant Front Office Manager",
  "Duty Manager",
  "Guest Relations Manager",
  "Concierge Manager",
  "Transport Manager",
  "Assistant Manager",
  "Executive",
  "Supervisor",
  "Associate",
  "Intern",
];

export const NON_ADMIN_JOB_TITLES = JOB_TITLES.filter(title => title !== "Admin");

export const JOB_TITLES_WITH_ALL_OPTION = [
  ...NON_ADMIN_JOB_TITLES,
  "All of the above"
];
