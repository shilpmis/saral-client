import React from "react";
import LoginForm from "../components/LoginForm";
 
const LoginPage: React.FC = () => {
  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url('https://melzo-erp.web.app/static/media/loginBackground.b8f274aa51940f5435a4.png')`,
      }}
    >
      <div className="absolute top-10">
        <img
          src="https://melzo.com/0ba47a2849538df92edfac89c4a787bd.webp"
          alt="Logo"
          className="h-16"
        />
      </div>
      <div className="bg-white/90 p-8 rounded-xl shadow-lg w-96">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
