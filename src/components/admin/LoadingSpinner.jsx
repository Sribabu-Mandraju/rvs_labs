import { FaEthereum } from "react-icons/fa"

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <FaEthereum className="animate-spin text-yellow-400 text-6xl" />
        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20 border-t-yellow-400 animate-spin"></div>
      </div>
      <p className="text-gray-400 mt-4 text-lg">Loading admin data...</p>
    </div>
  )
}

export default LoadingSpinner
