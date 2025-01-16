import React from "react";

const LoginPage: React.FC = () => {
  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url('https://melzo-erp.web.app/static/media/loginBackground.b8f274aa51940f5435a4.png')`,
      }}
    >
      {/* Logo */}
      <div className="absolute top-10">
        <img
          src="https://melzo.com/0ba47a2849538df92edfac89c4a787bd.webp"
          alt="Melzo Logo"
          className="h-16"
        />
      </div>

      {/* Login Card */}
      <div className="bg-white/90 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">લોગ ઇન</h2>
        <form>
          {/* User Email Field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              User Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-orange-300 focus:outline-none"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-orange-300 focus:outline-none"
              required
            />
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="remember-me"
              className="mr-2"
            />
            <label htmlFor="remember-me" className="text-gray-700">
              Remember me
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
          >
            લોગ ઇન
          </button>
        </form>

        {/* Forgot Password Link */}
        <p className="text-center text-gray-500 mt-4">
          <a href="/forgot-password" className="text-orange-500 hover:underline">
            Forgot your password?
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
