import React from "react";
// import Sidebar from "../../Sidebar/components/Sidebar";

const DashboardPage: React.FC = () => {
  return (
    <div className="flex">
      {/* <Sidebar /> */}
      <main className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-2 gap-4">
          {/* Add Cards and Charts here */}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
