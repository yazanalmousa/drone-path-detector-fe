import type { ReactNode } from "react";
import Header from "../header";
import { Sidebar } from "../sidebar";

interface props {
  children: ReactNode;
}

const AppLayout = ({ children }: props) => {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-900">
      <Header logoSrc="./assets/sagerlogo.svg" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
