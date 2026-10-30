import { Outlet, useNavigate } from "react-router";
import { useAuth } from "~/zustand/store";
import Sidebar from "~/components/sidebar";
import { useEffect } from "react";
import Footer from "~/components/footer";
import { GLOBAL_BG } from "constant";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const user = useAuth.getState().user?.username;

  useEffect(() => {
    if (!user) navigate("/auth");
  }, []);

  return (
    <div className={`${GLOBAL_BG} text-black`}>
      <div className="relative flex min-h-screen ">
        <Sidebar />
        <main className="flex-1  p-4 md:p-6 min-h-screen overflow-auto">
          {/* <SupportPage /> */}
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
