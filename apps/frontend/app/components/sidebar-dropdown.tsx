import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router";
import { logout } from "~/service/api";
import { NBCard } from "./ui/neobrutal";

function SidebarDropdown() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <NBCard
      color="white"
      shadow="sm"
      className="absolute left-0 bottom-[calc(100%+8px)] w-full z-50 overflow-hidden"
    >
      <ul className="py-1.5 text-sm">
        <li>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-red-600 font-bold hover:bg-red-50 flex items-center gap-2.5 transition-colors"
          >
            <FiLogOut size={15} />
            Sign out
          </button>
        </li>
      </ul>
    </NBCard>
  );
}

export default React.memo(SidebarDropdown);
