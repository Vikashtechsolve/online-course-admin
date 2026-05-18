import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import UploadProgressIndicator from "../components/UploadProgressIndicator";
import { UserProvider } from "../context/UserContext";
import { UploadProvider } from "../context/UploadContext";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <UserProvider>
      <UploadProvider>
        <div className="flex min-h-screen">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

          <div className="flex-1 lg:ml-[260px] min-h-screen">
            <Navbar setIsOpen={setIsOpen} />

            <div className="p-4 sm:p-6">{children}</div>
          </div>
        </div>

        <UploadProgressIndicator />
      </UploadProvider>
    </UserProvider>
  );
}
