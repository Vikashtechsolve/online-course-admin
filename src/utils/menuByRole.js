export function getMenuForRole(role) {
  const commonTop = [
    { name: "Dashboard", icon: "dashboard", path: "/" },
    { name: "My Courses", icon: "courses", path: "/courses" },
    { name: "Assignments", icon: "assignment", path: "/assignments" },
    { name: "Announcements", icon: "announcement", path: "/announcements" },
    { name: "Support/Help", icon: "support", path: "/support" },
  ];

  const studentRegistration = {
    name: "Student registration",
    icon: "registrations",
    path: "/student-registrations",
  };

  const profile = { name: "Profile", icon: "profile", path: "/profile" };

  const staffBase = [...commonTop, studentRegistration, profile];

  if (role === "superadmin") {
    return [
      ...staffBase,
      {
        name: "Manage Batches",
        icon: "batches",
        path: "/manage-batches",
      },
      {
        name: "Super Admin Panel",
        icon: "admin",
        path: "/admin",
        superAdminOnly: true,
      },
      {
        name: "User Management",
        icon: "admin",
        path: "/users",
      },
    ];
  }

  if (role === "coordinator") {
    return [
      ...staffBase,
      {
        name: "Manage Batches",
        icon: "batches",
        path: "/manage-batches",
      },
    ];
  }

  if (role === "admin") {
    return [
      ...staffBase,
      {
        name: "Manage Batches",
        icon: "batches",
        path: "/manage-batches",
        adminOnly: true,
      },
      {
        name: "User Management",
        icon: "admin",
        path: "/users",
        adminOnly: true,
      },
    ];
  }

  return [...commonTop, profile];
}
