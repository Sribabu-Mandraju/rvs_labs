import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCoins,
  FaUser,
  FaSpinner,
  FaFileExcel,
} from "react-icons/fa";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { FiRefreshCw } from "react-icons/fi";
import * as XLSX from "xlsx";

const DepositsTracker = ({ adminData }) => {
  const [deposits, setDeposits] = useState([]); // filtered view
  const [rawDeposits, setRawDeposits] = useState([]); // unfiltered current page
  console.log("admin data in deposit tracker :", adminData);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: "",
    periodMonths: "",
    searchTerm: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNextPage: false,
    latestTokenId: "0",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Local storage keys
  const STORAGE_KEY = "depositsTracker:v1";
  const getCacheKey = (page, limit) => `${STORAGE_KEY}:${limit}:${page}`;
  const savePageToCache = (page, limit, payload) => {
    try {
      const record = { ...payload, cachedAt: Date.now(), page, limit };
      localStorage.setItem(getCacheKey(page, limit), JSON.stringify(record));
    } catch {}
  };
  const loadPageFromCache = (page, limit, maxAgeMs = 5 * 60 * 1000) => {
    try {
      const raw = localStorage.getItem(getCacheKey(page, limit));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.cachedAt &&
        Date.now() - parsed.cachedAt <= maxAgeMs
      ) {
        return parsed;
      }
    } catch {}
    return null;
  };
  const clearPageCache = (page, limit) => {
    try {
      localStorage.removeItem(getCacheKey(page, limit));
    } catch {}
  };

  // Local helper: apply client-side filters to deposits
  const applyFilters = (items) => {
    try {
      let result = Array.isArray(items) ? [...items] : [];

      // Status filter
      if (filters.status && filters.status !== "all") {
        result = result.filter((d) => {
          const now = Math.floor(Date.now() / 1000);
          const isUnlocked = Number(d.unlockTimestamp) <= now;
          if (filters.status === "locked") return !isUnlocked;
          if (filters.status === "unlocked") return isUnlocked;
          if (filters.status === "unclaimed_unlocked")
            return isUnlocked && !d.isClaimed;
          if (filters.status === "claimed") return Boolean(d.isClaimed);
          return true;
        });
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange !== "all") {
        const startTs = (ts) => Number(ts) * 1000;
        const now = Date.now();
        let from = 0;
        if (filters.dateRange === "today") {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          from = d.getTime();
        } else if (filters.dateRange === "week") {
          from = now - 7 * 24 * 60 * 60 * 1000;
        } else if (filters.dateRange === "month") {
          from = now - 30 * 24 * 60 * 60 * 1000;
        }
        result = result.filter((d) => startTs(d.startTimestamp) >= from);
      }

      // Custom from/to date
      if (filters.fromDate) {
        const fromMs = new Date(filters.fromDate).getTime();
        result = result.filter(
          (d) => Number(d.startTimestamp) * 1000 >= fromMs
        );
      }
      if (filters.toDate) {
        const toMs = new Date(filters.toDate).getTime();
        result = result.filter((d) => Number(d.startTimestamp) * 1000 <= toMs);
      }

      // Period filter
      if (filters.periodMonths) {
        result = result.filter(
          (d) => String(d.periodMonths) === String(filters.periodMonths)
        );
      }

      // Min/Max amount (interpreted in human units)
      const getDecimalsFor = (tokenAddress, fallback) => {
        try {
          const info = adminData?.allowedTokensWithNames?.find(
            (t) =>
              t.address.toLowerCase() === String(tokenAddress).toLowerCase()
          );
          if (info) return Number(info.decimals);
        } catch {}
        return typeof fallback === "number" ? fallback : 18;
      };
      const toHuman = (raw, decimals) => {
        try {
          return Number(ethers.formatUnits(raw, decimals));
        } catch {
          return 0;
        }
      };
      if (filters.minAmount) {
        result = result.filter((d) => {
          const dec = getDecimalsFor(d.depositToken, Number(d.decimals));
          return toHuman(d.amount, dec) >= Number(filters.minAmount);
        });
      }
      if (filters.maxAmount) {
        result = result.filter((d) => {
          const dec = getDecimalsFor(d.depositToken, Number(d.decimals));
          return toHuman(d.amount, dec) <= Number(filters.maxAmount);
        });
      }

      // Search term in address, tokenId, tx hash
      if (filters.searchTerm) {
        const q = String(filters.searchTerm).toLowerCase();
        result = result.filter(
          (d) =>
            String(d.tokenId).toLowerCase().includes(q) ||
            String(d.originalMinter).toLowerCase().includes(q) ||
            String(d.transactionHash || "")
              .toLowerCase()
              .includes(q)
        );
      }

      return result;
    } catch {
      return Array.isArray(items) ? items : [];
    }
  };

  // Fetch deposits with current filters (server provides only page/limit)
  const fetchDeposits = async (page = 1, { force = false } = {}) => {
    setIsLoading(true);
    try {
      const limitNum = pagination.limit || 20;
      if (!force) {
        const cachedPage = loadPageFromCache(page, limitNum);
        if (cachedPage && Array.isArray(cachedPage.deposits)) {
          setRawDeposits(cachedPage.deposits);
          setDeposits(applyFilters(cachedPage.deposits));
          setPagination((prev) => ({
            ...prev,
            currentPage: Number(cachedPage.page) || page,
            totalPages:
              (Number(cachedPage.page) || page) +
              (cachedPage.pagination?.hasNextPage ? 1 : 0),
            totalCount: prev.totalCount || 0,
            limit: Number(cachedPage.limit) || limitNum,
            hasNextPage: Boolean(cachedPage.pagination?.hasNextPage),
            latestTokenId: String(
              cachedPage.pagination?.latestTokenId || prev.latestTokenId
            ),
          }));
          return;
        }
      }
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limitNum.toString(),
      });

      const response = await fetch(
        `https://timelocknft.onrender.com/lockTimeNFT/allDeposits?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setRawDeposits(Array.isArray(data.deposits) ? data.deposits : []);
        const filtered = applyFilters(data.deposits);
        setDeposits(filtered);
        setPagination((prev) => ({
          ...prev,
          currentPage: Number(data.pagination.currentPage) || page,
          totalPages:
            Number(data.pagination.currentPage || page) +
            (data.pagination.hasNextPage ? 1 : 0),
          totalCount: prev.totalCount || 0,
          limit: Number(data.pagination.limit) || prev.limit,
          hasNextPage: Boolean(data.pagination.hasNextPage),
          latestTokenId: String(
            data.pagination.latestTokenId || prev.latestTokenId
          ),
        }));

        // Cache page-scoped
        savePageToCache(
          Number(data.pagination.currentPage) || page,
          Number(data.pagination.limit) || limitNum,
          {
            deposits: Array.isArray(data.deposits) ? data.deposits : [],
            pagination: {
              hasNextPage: Boolean(data.pagination.hasNextPage),
              latestTokenId: String(
                data.pagination.latestTokenId || pagination.latestTokenId
              ),
            },
          }
        );
      } else {
        toast.error("Failed to fetch deposits");
      }
    } catch (error) {
      console.error("Error fetching deposits:", error);
      toast.error("Failed to fetch deposits");
    } finally {
      setIsLoading(false);
    }
  };

  // On mount: use local cache unless reload
  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const isReload = nav && nav.type === "reload";
    try {
      if (!isReload) {
        const limitNum = pagination.limit || 20;
        const cachedPage = loadPageFromCache(1, limitNum);
        if (cachedPage && Array.isArray(cachedPage.deposits)) {
          setRawDeposits(cachedPage.deposits);
          setDeposits(applyFilters(cachedPage.deposits));
          setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            limit: Number(cachedPage.limit) || limitNum,
            hasNextPage: Boolean(cachedPage.pagination?.hasNextPage),
            latestTokenId: String(
              cachedPage.pagination?.latestTokenId || prev.latestTokenId
            ),
            totalPages: 1 + (cachedPage.pagination?.hasNextPage ? 1 : 0),
          }));
          return;
        }
      }
    } catch {}
    // No cache or reload -> fetch
    fetchDeposits(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply filters without fetching
  useEffect(() => {
    setDeposits(applyFilters(rawDeposits));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, rawDeposits]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    fetchDeposits(page);
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      dateRange: "all",
      fromDate: "",
      toDate: "",
      minAmount: "",
      maxAmount: "",
      periodMonths: "",
      searchTerm: "",
    });
  };

  const getStatusBadge = (deposit) => {
    const now = Math.floor(Date.now() / 1000);
    const isUnlocked = Number(deposit.unlockTimestamp) <= now;

    if (isUnlocked && deposit.isClaimed) {
      return {
        text: "Claimed",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
      };
    } else if (isUnlocked && !deposit.isClaimed) {
      return {
        text: "Unlocked",
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      };
    } else {
      return {
        text: "Locked",
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      };
    }
  };

  const formatAmount = (amount, tokenAddress, providedDecimals) => {
    try {
      // Prefer decimals provided by API; fallback to adminData lookup
      let decimals =
        providedDecimals !== undefined && providedDecimals !== null
          ? Number(providedDecimals)
          : undefined;
      if (decimals === undefined) {
        const tokenInfo = adminData?.allowedTokensWithNames?.find(
          (token) => token.address.toLowerCase() === tokenAddress?.toLowerCase()
        );
        decimals = tokenInfo ? parseInt(tokenInfo.decimals) : 18;
      }

      return parseFloat(ethers.formatUnits(amount, decimals)).toFixed(2);
    } catch (error) {
      console.warn("Error formatting amount:", error);
      return "0.00";
    }
  };

  const getTokenInfo = (tokenAddress) => {
    try {
      const tokenInfo = adminData?.allowedTokensWithNames?.find(
        (token) => token.address.toLowerCase() === tokenAddress?.toLowerCase()
      );
      return tokenInfo || { name: "Unknown", decimals: "18" };
    } catch (error) {
      console.warn("Error getting token info:", error);
      return { name: "Unknown", decimals: "18" };
    }
  };

  const getTotalAmountByToken = (tokenAddress) => {
    try {
      const tokenDeposits = deposits.filter(
        (deposit) =>
          deposit.depositToken?.toLowerCase() === tokenAddress?.toLowerCase()
      );

      const totalAmount = tokenDeposits.reduce((sum, deposit) => {
        return sum + BigInt(deposit.amount || "0");
      }, BigInt(0));

      return formatAmount(totalAmount.toString(), tokenAddress);
    } catch (error) {
      console.warn("Error calculating total amount by token:", error);
      return "0.00";
    }
  };

  const formatDate = (timestamp) => {
    try {
      return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const getTimeRemaining = (unlockTimestamp) => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Number(unlockTimestamp) - now;

      if (remaining <= 0) return "Unlocked";

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);

      if (days > 0) return `${days}d ${hours}h`;
      return `${hours}h`;
    } catch (error) {
      console.warn("Error calculating time remaining:", error);
      return "Unknown";
    }
  };

  // Function to download deposits as Excel
  const downloadExcel = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Preparing Excel file...");

      // Fetch all pages and aggregate, then apply client-side filters
      const aggregated = [];
      let page = 1;
      const limit = pagination.limit || 20;
      // Safety cap to avoid infinite loops
      const maxPages = 500;
      // eslint-disable-next-line no-constant-condition
      while (page <= maxPages) {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        const res = await fetch(
          `https://timelocknft.onrender.com/lockTimeNFT/allDeposits?${params}`
        );
        const json = await res.json();
        if (!json.success) break;
        aggregated.push(...json.deposits);
        if (!json.pagination?.hasNextPage) break;
        page += 1;
      }

      const allDeposits = applyFilters(aggregated);

      // Prepare data for Excel
      const excelData = allDeposits.map((deposit) => {
        const statusBadge = getStatusBadge(deposit);
        const timeRemaining = getTimeRemaining(deposit.unlockTimestamp);

        return {
          "Token ID": deposit.tokenId || "N/A",
          "User Address": deposit.originalMinter || "N/A",
          "Deposit Token": `${
            deposit.tokenName || getTokenInfo(deposit.depositToken).name
          } (${deposit.depositToken})`,
          Amount: formatAmount(
            deposit.amount,
            deposit.depositToken,
            deposit.decimals
          ),
          "Period (Months)": deposit.periodMonths || "N/A",
          Status: statusBadge.text,
          "Start Date": formatDate(deposit.startTimestamp),
          "Unlock Date": formatDate(deposit.unlockTimestamp),
          "Time Remaining": timeRemaining,
          "Transaction Hash": deposit.transactionHash || "N/A",
          "Is Claimed": deposit.isClaimed ? "Yes" : "No",
          // "Proposal ID": deposit.proposalId || "N/A",
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();

      // Main deposits data
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 12 }, // Token ID
        { wch: 42 }, // User Address
        { wch: 42 }, // Deposit Token
        { wch: 15 }, // Amount
        { wch: 15 }, // Period
        { wch: 12 }, // Status
        { wch: 20 }, // Start Date
        { wch: 20 }, // Unlock Date
        { wch: 15 }, // Time Remaining
        { wch: 66 }, // Transaction Hash
        { wch: 12 }, // Is Claimed
        { wch: 15 }, // Proposal ID
      ];
      worksheet["!cols"] = columnWidths;

      // Add summary sheet
      const summaryData = [
        { Metric: "Total Deposits", Value: allDeposits.length },
        {
          Metric: "Claimed Deposits",
          Value: allDeposits.filter((d) => d.isClaimed).length,
        },
        {
          Metric: "Unclaimed Unlocked",
          Value: allDeposits.filter((d) => {
            try {
              const now = Math.floor(Date.now() / 1000);
              return Number(d.unlockTimestamp) <= now && !d.isClaimed;
            } catch (error) {
              return false;
            }
          }).length,
        },
        {
          Metric: "Locked Deposits",
          Value: allDeposits.filter((d) => {
            try {
              const now = Math.floor(Date.now() / 1000);
              return Number(d.unlockTimestamp) > now;
            } catch (error) {
              return false;
            }
          }).length,
        },
        { Metric: "Export Date", Value: new Date().toLocaleString() },
        {
          Metric: "Filters Applied",
          Value:
            Object.entries(filters)
              .filter(([k, v]) => v && v !== "all")
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ") || "None",
        },
      ];

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      summaryWorksheet["!cols"] = [{ wch: 25 }, { wch: 40 }];

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Deposits Data");
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        bookSST: false,
        compression: true,
      });

      // Create blob and download
      const blob = new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `deposits_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success(`Exported ${excelData.length} deposits to Excel file`);
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Failed to download Excel file");
    }
  };

  // Function to download current page data only
  const downloadCurrentPage = () => {
    try {
      if (deposits.length === 0) {
        toast.warning("No data to export");
        return;
      }

      // Prepare data for current page
      const excelData = deposits.map((deposit) => {
        const statusBadge = getStatusBadge(deposit);
        const timeRemaining = getTimeRemaining(deposit.unlockTimestamp);

        return {
          "Token ID": deposit.tokenId || "N/A",
          "User Address": deposit.originalMinter || "N/A",
          "Deposit Token": `${
            deposit.tokenName || getTokenInfo(deposit.depositToken).name
          } (${deposit.depositToken})`,
          Amount: formatAmount(
            deposit.amount,
            deposit.depositToken,
            deposit.decimals
          ),
          "Period (Months)": deposit.periodMonths || "N/A",
          Status: statusBadge.text,
          "Start Date": formatDate(deposit.startTimestamp),
          "Unlock Date": formatDate(deposit.unlockTimestamp),
          "Time Remaining": timeRemaining,
          "Transaction Hash": deposit.transactionHash || "N/A",
          "Is Claimed": deposit.isClaimed ? "Yes" : "No",
          // "Proposal ID": deposit.proposalId || "N/A",
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 12 }, // Token ID
        { wch: 42 }, // User Address
        { wch: 42 }, // Deposit Token
        { wch: 15 }, // Amount
        { wch: 15 }, // Period
        { wch: 12 }, // Status
        { wch: 20 }, // Start Date
        { wch: 20 }, // Unlock Date
        { wch: 15 }, // Time Remaining
        { wch: 66 }, // Transaction Hash
        { wch: 12 }, // Is Claimed
        { wch: 15 }, // Proposal ID
      ];
      worksheet["!cols"] = columnWidths;

      // Add summary sheet
      const summaryData = [
        { Metric: "Page Number", Value: pagination.currentPage },
        { Metric: "Records in Page", Value: deposits.length },
        { Metric: "Total Records", Value: pagination.totalCount },
        { Metric: "Export Date", Value: new Date().toLocaleString() },
        {
          Metric: "Filters Applied",
          Value:
            Object.entries(filters)
              .filter(([k, v]) => v && v !== "all")
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ") || "None",
        },
      ];

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      summaryWorksheet["!cols"] = [{ wch: 25 }, { wch: 40 }];

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Deposits Data");
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        bookSST: false,
        compression: true,
      });

      // Create blob and download
      const blob = new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `deposits_page_${pagination.currentPage}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      toast.success(`Exported ${excelData.length} deposits from current page`);
    } catch (error) {
      console.error("Error downloading current page:", error);
      toast.error("Failed to download Excel file");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Deposits Tracker</h2>
        <p className="text-gray-400 text-lg">
          Monitor all user deposits and staking activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FaCoins className="text-blue-400 text-lg" />
            </div>
            <span className="text-2xl font-bold text-white">
              {pagination.totalCount}
            </span>
          </div>
          <p className="text-blue-300 text-sm font-medium mt-2">
            Total Deposits
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <FaCheckCircle className="text-green-400 text-lg" />
            </div>
            <span className="text-2xl font-bold text-white">
              {deposits.filter((d) => d.isClaimed).length}
            </span>
          </div>
          <p className="text-green-300 text-sm font-medium mt-2">Claimed</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <FaExclamationTriangle className="text-yellow-400 text-lg" />
            </div>
            <span className="text-2xl font-bold text-white">
              {
                deposits.filter((d) => {
                  try {
                    const now = Math.floor(Date.now() / 1000);
                    return Number(d.unlockTimestamp) <= now && !d.isClaimed;
                  } catch (error) {
                    return false;
                  }
                }).length
              }
            </span>
          </div>
          <p className="text-yellow-300 text-sm font-medium mt-2">Unclaimed</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FaClock className="text-purple-400 text-lg" />
            </div>
            <span className="text-2xl font-bold text-white">
              {
                deposits.filter((d) => {
                  try {
                    const now = Math.floor(Date.now() / 1000);
                    return Number(d.unlockTimestamp) > now;
                  } catch (error) {
                    return false;
                  }
                }).length
              }
            </span>
          </div>
          <p className="text-purple-300 text-sm font-medium mt-2">Locked</p>
        </div>
      </div>

      {/* Token Balances Overview */}
      {adminData?.allowedTokensWithNames && (
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaCoins className="mr-3 text-yellow-400" />
            Token Balances Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminData.allowedTokensWithNames.map((token) => (
              <div
                key={token.address}
                className="bg-gray-800/30 rounded-xl p-4 border border-gray-600/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{token.name}</span>
                  <span className="text-gray-400 text-sm">
                    {token.decimals} decimals
                  </span>
                </div>
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  {getTotalAmountByToken(token.address)}
                </div>
                <div className="text-gray-400 text-sm">
                  Max Cap:{" "}
                  {parseFloat(
                    ethers.formatUnits(token.maxCap, parseInt(token.decimals))
                  ).toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">
                  Contract: {token.address.slice(0, 6)}...
                  {token.address.slice(-4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <FaFilter />
              <span>Filters</span>
            </button>
            <button
              onClick={() =>
                fetchDeposits(pagination.currentPage || 1, { force: true })
              }
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              title="Refetch latest data from server"
            >
              <FiRefreshCw />
              <span>Refresh</span>
            </button>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadCurrentPage}
              disabled={deposits.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Download current page data"
            >
              <FaFileExcel className="text-sm" />
              <span>Export Page</span>
            </button>
            <button
              onClick={downloadExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
              title="Download all filtered data"
            >
              <FaDownload className="text-sm" />
              <span>Export All</span>
            </button>
          </div>

          <div className="flex-1 lg:max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by address, token ID, or transaction hash..."
                value={filters.searchTerm}
                onChange={(e) =>
                  handleFilterChange("searchTerm", e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-600/50">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="all">All Status</option>
                <option value="locked">Locked</option>
                <option value="unlocked">Unlocked</option>
                <option value="unclaimed_unlocked">Unclaimed & Unlocked</option>
                <option value="claimed">Claimed</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Period
              </label>
              <select
                value={filters.periodMonths}
                onChange={(e) =>
                  handleFilterChange("periodMonths", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="">All Periods</option>
                <option value="1">1 Month</option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
              </select>
            </div>

            {/* <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Amount Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) =>
                    handleFilterChange("minAmount", e.target.value)
                  }
                  className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    handleFilterChange("maxAmount", e.target.value)
                  }
                  className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-sm"
                />
              </div>
            </div> */}

            {/* Custom Date Range */}
            {filters.dateRange === "custom" && (
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Custom Date Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) =>
                      handleFilterChange("fromDate", e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) =>
                      handleFilterChange("toDate", e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>
            )}

            <div className="md:col-span-2 lg:col-span-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-600/70 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deposits Table */}
      <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <FaEye className="mr-3 text-yellow-400" />
              Deposits Overview
            </h3>
            <div className="text-sm text-gray-400">
              {deposits.length > 0 && (
                <span>
                  Showing {deposits.length} deposits
                  {pagination.totalCount > deposits.length &&
                    ` of ${pagination.totalCount} total`}
                </span>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-yellow-400 text-2xl mr-3" />
            <span className="text-gray-400">Loading deposits...</span>
          </div>
        ) : deposits.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Token ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Unlock Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Time Left
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {deposits.map((deposit) => {
                    const statusBadge = getStatusBadge(deposit);
                    return (
                      <tr
                        key={deposit.tokenId}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-yellow-400 font-bold">
                            #{deposit.tokenId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <FaUser className="text-gray-400 text-sm" />
                            <span className="text-white font-mono text-sm">
                              {deposit.originalMinter?.slice(0, 6)}...
                              {deposit.originalMinter?.slice(-4)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white font-medium">
                            {formatAmount(
                              deposit.amount,
                              deposit.depositToken,
                              deposit.decimals
                            )}{" "}
                            <span className="text-gray-400 text-sm">
                              {deposit.tokenName ||
                                getTokenInfo(deposit.depositToken).name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                            {deposit.periodMonths}M
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${statusBadge.color}`}
                          >
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                          {formatDate(deposit.startTimestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                          {formatDate(deposit.unlockTimestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <FaClock className="text-gray-400 text-sm" />
                            <span className="text-gray-300 text-sm">
                              {getTimeRemaining(deposit.unlockTimestamp)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                    {pagination.currentPage * pagination.limit}
                    {pagination.totalCount > 0 && (
                      <> of {pagination.totalCount} results</>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-gray-300">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FaEye className="text-4xl text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No deposits found</p>
            <p className="text-gray-500 text-sm mt-2">
              {Object.values(filters).some((f) => f && f !== "all")
                ? "Try adjusting your filters"
                : "No deposits have been made yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositsTracker;
