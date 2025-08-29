import { useRef } from "react";
import Header from "../layouts/Header";
import DefaultAvatar from "@/features/articles/components/DefaultAvatar";
import Footer from "../layouts/Footer";
import EditIcon from "@mui/icons-material/Edit";

export default function ProfilePage() {
  const whiteSectionRef = useRef<HTMLDivElement | null>(null);
  return (
    <div>
      <Header whiteSectionRef={whiteSectionRef} />
      <div className="w-full h-[40vh] overflow-hidden">
        <img
          src="https://i.pinimg.com/1200x/0d/46/f6/0d46f64778413b07d406604c5e712715.jpg"
          alt="cover"
          className="w-full h-full object-cover object-center"
        />
        {/* Profile image + content */}
      </div>
      <div
        ref={whiteSectionRef}
        className="mx-[13%] flex flex-col gap-4 pb-[15%]"
      >
        <div className="-mt-[75px] flex items-center gap-6">
          <DefaultAvatar size={170} />
          <div className="bg-blue-500 text-white font-bold h-fit px-4 py-2 rounded-lg mt-10">
            <span>Premium</span>
          </div>
        </div>
        <h3 className="text-[30px] font-bold">John Doe</h3>
        <hr />
        <div className="flex justify-between">
          <h3 className="text-[25px] font-semibold">Personal Information</h3>
          <button className="bg-gray-500 hover:bg-gray-400 transition-colors duration-300 ease-in-out cursor-pointer flex items-center gap-3 text-white font-bold h-fit px-6 py-2 rounded-lg">
            <span>Edit</span>
            <EditIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
        <div className="grid grid-cols md:grid-cols-2 lg:grid-cols-3 gap-8 text-black font-semibold">
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">First Name</span>
            <span>John</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">Last Name</span>
            <span>Doe</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">Date of Birth</span>
            <span>01/01/1990</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">User Name</span>
            <span>johndoe@example.com</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">User Role</span>
            <span>User</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
