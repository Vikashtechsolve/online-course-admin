import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import CreateAssignment from "./pages/CreateAssignment";
import Announcements from "./pages/Announcements";
import Support from "./pages/Support";
import TicketDetail from "./pages/TicketDetail";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ManageAdmins from "./pages/ManageAdmins";
import UserManagement from "./pages/UserManagement";
import ManageUsersByRole from "./pages/ManageUsersByRole";
import CourseDetails from "./pages/CourseDetails";
import Lectures from "./pages/Lectures";
import LectureSession from "./pages/LectureSession";
import BatchCourses from "./pages/BatchCourses";
import ManageBatches from "./pages/ManageBatches";
import AdminBatchDetail from "./pages/AdminBatchDetail";
import AdminCourseDetail from "./pages/AdminCourseDetail";
import BatchStudents from "./pages/BatchStudents";
import StudentRegistrations from "./pages/StudentRegistrations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/assignments/create" element={<CreateAssignment />} />
                  <Route path="/assignments/:id/edit" element={<CreateAssignment />} />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/support/:ticketId" element={<TicketDetail />} />
                  <Route
                    path="/student-registrations"
                    element={
                      <RoleRoute allowedRoles={["superadmin", "admin", "coordinator"]}>
                        <StudentRegistrations />
                      </RoleRoute>
                    }
                  />
                  <Route path="/profile" element={<Profile />} />

                  {/* Super Admin only */}
                  <Route
                    path="/admin"
                    element={
                      <RoleRoute allowedRoles={["superadmin"]}>
                        <Admin />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/admins"
                    element={
                      <RoleRoute allowedRoles={["superadmin"]}>
                        <ManageAdmins />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/teachers"
                    element={
                      <RoleRoute allowedRoles={["superadmin"]}>
                        <ManageUsersByRole />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/coordinators"
                    element={
                      <RoleRoute allowedRoles={["superadmin"]}>
                        <ManageUsersByRole />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/students"
                    element={
                      <RoleRoute allowedRoles={["superadmin"]}>
                        <ManageUsersByRole />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/batch/:batchId"
                    element={
                      <RoleRoute allowedRoles={["superadmin"]}>
                        <BatchCourses />
                      </RoleRoute>
                    }
                  />

                  {/* Manage Batches (admin + superadmin + coordinator) */}
                  <Route
                    path="/manage-batches"
                    element={
                      <RoleRoute allowedRoles={["admin", "superadmin", "coordinator"]}>
                        <ManageBatches />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/manage-batches/:batchId"
                    element={
                      <RoleRoute allowedRoles={["admin", "superadmin", "coordinator"]}>
                        <AdminBatchDetail />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/manage-batches/:batchId/students"
                    element={
                      <RoleRoute allowedRoles={["admin", "superadmin", "coordinator"]}>
                        <BatchStudents />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/manage-batches/:batchId/course/:courseId"
                    element={
                      <RoleRoute allowedRoles={["admin", "superadmin", "coordinator"]}>
                        <AdminCourseDetail />
                      </RoleRoute>
                    }
                  />

                  {/* Admin: User Management (teachers, coordinators, students) */}
                  <Route
                    path="/users"
                    element={
                      <RoleRoute allowedRoles={["admin", "superadmin"]}>
                        <UserManagement />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/users/:roleType"
                    element={
                      <RoleRoute allowedRoles={["admin", "superadmin"]}>
                        <ManageUsersByRole />
                      </RoleRoute>
                    }
                  />

                  <Route path="/courses/:id" element={<CourseDetails />} />
                  <Route path="/courses/:id/lectures" element={<Lectures />} />
                  <Route path="/courses/:courseId/lectures/:lectureId" element={<LectureSession />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
