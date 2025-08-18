import React from "react";
import { useToggleDeposits } from "../../../interactions/StableZUser_interactoins";

const ToggleDepositsForm = ({ onSuccess }) => {
  const {
    toggleDeposits,
    isTogglePending,
    isToggleConfirming,
    isToggleConfirmed,
    toggleError,
    isDepositsDisabled,
    isStatusLoading,
  } = useToggleDeposits();

  const handleToggle = async () => {
    try {
      await toggleDeposits();
      onSuccess && onSuccess();
    } catch (error) {
      // errors are toasted in the hook
    }
  };

  const buttonLabel = isDepositsDisabled
    ? "Enable Deposits"
    : "Disable Deposits";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
        <span className="text-sm text-gray-300">Deposits status</span>
        <span
          className={`text-sm font-semibold ${
            isStatusLoading
              ? "text-gray-400"
              : isDepositsDisabled
              ? "text-red-400"
              : "text-green-400"
          }`}
        >
          {isStatusLoading
            ? "Loading..."
            : isDepositsDisabled
            ? "DISABLED"
            : "ENABLED"}
        </span>
      </div>

      <button
        onClick={handleToggle}
        disabled={isStatusLoading || isTogglePending || isToggleConfirming}
        className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
          isStatusLoading || isTogglePending || isToggleConfirming
            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
            : isDepositsDisabled
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
      >
        {isTogglePending || isToggleConfirming ? "Processing..." : buttonLabel}
      </button>

      {toggleError && (
        <p className="text-xs text-red-400">
          {toggleError.message || "Failed to toggle deposits"}
        </p>
      )}

      {isToggleConfirmed && !toggleError && (
        <p className="text-xs text-green-400">Status updated.</p>
      )}
    </div>
  );
};

export default ToggleDepositsForm;
