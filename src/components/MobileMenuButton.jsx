import { Menu } from "lucide-react";

export default function MobileMenuButton({ setIsOpen }) {
  return (
    <button
      className="lg:hidden p-2"
      onClick={() => setIsOpen(true)}
    >
      <Menu size={22} />
    </button>
  );
}