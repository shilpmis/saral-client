import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../slices/authSlice";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password })); // Redux action
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          User Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>
      {/* Remember Me Checkbox */}
      <div className="flex items-center mb-4">
        <input type="checkbox" id="remember-me" className="mr-2" />
        <label htmlFor="remember-me" className="text-gray-700">
          Remember me
        </label>
      </div>
      <button className="w-full bg-orange-500 text-white py-2 rounded-lg">
        Log In
      </button>
      {/* Forgot Password Link */}
      <p className="text-center text-gray-500 mt-4">
          <a href="/forgot-password" className="text-orange-500 hover:underline">
            Forgot your password?
          </a>
        </p>
    </form>
  );
};

export default LoginForm;
