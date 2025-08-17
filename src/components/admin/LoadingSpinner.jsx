import { FaEthereum, FaSpinner } from "react-icons/fa";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 lg:py-24">
      <div className="relative mb-6">
        {/* Main spinning icon */}
        <div className="relative">
          <FaEthereum className="text-6xl lg:text-8xl text-yellow-400 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin"></div>
        </div>

        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/10 animate-ping"></div>

        {/* Floating particles */}
        <div
          className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="absolute -bottom-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></div>
        <div
          className="absolute -bottom-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.6s" }}
        ></div>
      </div>

      {/* Loading text */}
      <div className="text-center">
        <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
          Loading Admin Data
        </h3>
        <p className="text-gray-400 text-base lg:text-lg">
          Please wait while we fetch your dashboard information...
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-64 lg:w-80 mt-8">
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>
      </div>

      {/* Loading dots */}
      <div className="flex space-x-2 mt-6">
        <div
          className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
