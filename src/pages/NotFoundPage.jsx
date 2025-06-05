import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center text-white">
      <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
      <p className="text-2xl text-gray-300 mb-8">Page Not Found</p>
      <Link
        to="/"
        className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
