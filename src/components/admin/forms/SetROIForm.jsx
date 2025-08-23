"use client";

import { useState, useEffect } from "react";
import { FaPercentage, FaSpinner } from "react-icons/fa";
import { useSetROIs } from "../../../interactions/StableZ_interactions";
import toast from "react-hot-toast";

const SetROIForm = ({ onSuccess }) => {
  const [roi1m, setRoi1m] = useState("");
  const [roi2m, setRoi2m] = useState("");
  const [roi3m, setRoi3m] = useState("");
  const [fetchedRoi1m, setFetchedRoi1m] = useState("");
  const [fetchedRoi2m, setFetchedRoi2m] = useState("");
  const [fetchedRoi3m, setFetchedRoi3m] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const { setROIs, isPending, isConfirming, isConfirmed } = useSetROIs();

  // Fetch public data to set placeholder ROI values
  useEffect(() => {
    const fetchPublicData = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(
          "https://timelocknft.onrender.com/lockTimeNFT/publicMetaData"
        );
        const data = await response.json();
        if (data.success) {
          setFetchedRoi1m((Number(data.roi1m) / 100).toFixed(2));
          setFetchedRoi2m((Number(data.roi2m) / 100).toFixed(2));
          setFetchedRoi3m((Number(data.roi3m) / 100).toFixed(2));
        } else {
          toast.error("Failed to load ROI data", { id: "fetch-error" });
        }
      } catch (err) {
        console.error("Error fetching public data:", err);
        toast.error("Failed to load ROI data", { id: "fetch-error" });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPublicData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roi1m.trim() || !roi2m.trim() || !roi3m.trim()) {
      toast.error("Enter all ROI values", { id: "input-error" });
      return;
    }

    const roi1mBps = Math.floor(Number.parseFloat(roi1m) * 100);
    const roi2mBps = Math.floor(Number.parseFloat(roi2m) * 100);
    const roi3mBps = Math.floor(Number.parseFloat(roi3m) * 100);

    if (
      !Number.isFinite(Number(roi1m)) ||
      !Number.isFinite(Number(roi2m)) ||
      !Number.isFinite(Number(roi3m)) ||
      roi1mBps < 0 ||
      roi2mBps < 0 ||
      roi3mBps < 0
    ) {
      toast.error("Enter valid ROI values", { id: "input-error" });
      return;
    }

    try {
      await setROIs(roi1mBps, roi2mBps, roi3mBps);
    } catch (err) {
      // Errors are handled in the useSetROIs hook via toast notifications
      console.error("Set ROI error:", err);
    }
  };

  // Trigger onSuccess and clear inputs when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      toast.success("ROI rates updated successfully!", {
        id: "set-roi-success",
      });
      setRoi1m("");
      setRoi2m("");
      setRoi3m("");
      onSuccess();
    }
  }, [isConfirmed, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-300 text-xs font-medium mb-1">
            1 Month ROI (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={roi1m}
            onChange={(e) => setRoi1m(e.target.value)}
            placeholder={fetchedRoi1m || "0.00"}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors text-sm"
            disabled={isPending || isConfirming || isFetching}
          />
        </div>
        <div>
          <label className="block text-gray-300 text-xs font-medium mb-1">
            2 Month ROI (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={roi2m}
            onChange={(e) => setRoi2m(e.target.value)}
            placeholder={fetchedRoi2m || "0.00"}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors text-sm"
            disabled={isPending || isConfirming || isFetching}
          />
        </div>
        <div>
          <label className="block text-gray-300 text-xs font-medium mb-1">
            3 Month ROI (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={roi3m}
            onChange={(e) => setRoi3m(e.target.value)}
            placeholder={fetchedRoi3m || "0.00"}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors text-sm"
            disabled={isPending || isConfirming || isFetching}
          />
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-gray-400 text-sm">
          <strong>Preview:</strong> 1M: {roi1m || fetchedRoi1m || "0"}%, 2M:{" "}
          {roi2m || fetchedRoi2m || "0"}%, 3M: {roi3m || fetchedRoi3m || "0"}%
        </p>
        <p className="text-gray-400 text-xs mt-1">
          These rates will be applied to new deposits
        </p>
      </div>
      {isFetching ? (
        <div className="flex items-center justify-center">
          <FaSpinner className="animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading ROI data...</span>
        </div>
      ) : (
        <button
          type="submit"
          disabled={
            isPending ||
            isConfirming ||
            isFetching ||
            !roi1m.trim() ||
            !roi2m.trim() ||
            !roi3m.trim()
          }
          className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-lg hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
        >
          {isPending || isConfirming ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Updating ROI Rates...
            </>
          ) : (
            <>
              <FaPercentage className="mr-2" />
              Update ROI Rates
            </>
          )}
        </button>
      )}
    </form>
  );
};

export default SetROIForm;
