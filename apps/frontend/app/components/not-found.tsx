import Lottie from "lottie-react";
import animationData from "public/404.json";
import { Link } from "react-router";
import { nbButtonClass } from "./ui/neobrutal";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8E7] text-black p-4">
      <div className="w-80 sm:w-96">
        <Lottie animationData={animationData} loop={true} />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold">Oops! Page not found.</h1>
      <p className="text-black/60 font-medium mb-6">The page you are looking for doesn't exist.</p>
      <Link to="/" className={nbButtonClass({ color: "yellow" })}>
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;
