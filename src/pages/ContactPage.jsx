"use client";

import { FaTelegram, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const ContactPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Background overlay for texture */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-gray-800/20 to-black/60"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 lg:p-6">
        {/* Back Button */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300 group"
        >
          <FaArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Page Title */}
        {/* <h1 className="text-2xl lg:text-3xl font-bold text-yellow-400">
          Contact Us
        </h1> */}

        {/* Spacer for centering */}
        <div className="w-32"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 lg:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-yellow-400 mb-4">
              Get In Touch
            </h2>
            {/* <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to start your next project? We'd love to hear from you.
              Contact us on Telegram for quick responses and project
              discussions.
            </p> */}
          </div>

          {/* Telegram Contact Section */}
          <div className="flex justify-center">
            <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 lg:p-12 text-center max-w-md w-full">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTelegram className="text-3xl text-blue-400" />
              </div>

              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                Contact on Telegram
              </h3>

              <p className="text-gray-300 mb-6">
                Reach out to us directly on Telegram for:
              </p>

              <ul className="text-left text-gray-300 mb-8 space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Project inquiries</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Custom development requests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Smart contract development</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>General questions</span>
                </li>
              </ul>

              <a
                href="https://t.me/memeseedergod"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:from-blue-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300"
              >
                <FaTelegram className="text-xl" />
                <span>@memeseedergod</span>
              </a>
            </div>
          </div>

          {/* Additional Info */}
          {/* <div className="mt-12 text-center">
            <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">
                Why Choose River Labs?
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Custom web development solutions</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Smart contract development</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>E-commerce solutions</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Quick response on Telegram</span>
                </li>
              </ul>
            </div>
          </div> */}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex-shrink-0 p-4 text-center mt-12">
        <p className="text-xs text-gray-500">
          © 2024 River Labs IT Solutions. All rights reserved.
        </p>
      </footer>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-16 lg:h-24 bg-gradient-to-t from-yellow-400/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-32 h-32 lg:w-48 lg:h-48 bg-yellow-400/5 rounded-full blur-3xl transform -translate-x-16 lg:-translate-x-24 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-48 h-48 lg:w-72 lg:h-72 bg-yellow-400/3 rounded-full blur-3xl transform translate-x-24 lg:translate-x-36 pointer-events-none"></div>
    </div>
  );
};

export default ContactPage;
