/**
 * Interface definitions for deposit data from the backend API
 */

/**
 * @typedef {Object} Deposit
 * @property {string} tokenId - Unique identifier for the deposit
 * @property {string} transactionHash - Transaction hash of the deposit
 * @property {string} address - Contract address
 * @property {string} depositToken - Token address used for deposit
 * @property {string} originalMinter - Address of the user who made the deposit
 * @property {boolean} isClaimed - Whether the deposit has been claimed
 * @property {number} periodMonths - Lock period in months (1, 2, or 3)
 * @property {string} startTimestamp - Start timestamp of the lock period
 * @property {string} unlockTimestamp - End timestamp when the deposit can be unlocked
 * @property {string} amount - Amount deposited in wei
 * @property {string} status - Calculated status: 'locked', 'unlocked', 'claimed', 'unclaimed_unlocked'
 * @property {number} timeUntilDeadline - Time remaining until unlock (in seconds)
 * @property {number} daysSinceDeposit - Days since the deposit was made
 */

/**
 * @typedef {Object} DepositsResponse
 * @property {boolean} success - Whether the API call was successful
 * @property {Deposit[]} deposits - Array of deposit objects
 * @property {Object} pagination - Pagination information
 * @property {number} pagination.currentPage - Current page number
 * @property {number} pagination.totalPages - Total number of pages
 * @property {number} pagination.totalCount - Total number of deposits
 * @property {boolean} pagination.hasNextPage - Whether there's a next page
 * @property {boolean} pagination.hasPrevPage - Whether there's a previous page
 * @property {number} pagination.limit - Number of items per page
 * @property {Object} filters - Applied filters information
 * @property {Object} filters.applied - Currently applied filters
 * @property {string} filters.status - Current status filter
 * @property {string} filters.dateRange - Current date range filter
 */

/**
 * @typedef {Object} DepositsFilters
 * @property {string} status - Filter by status: 'all', 'locked', 'unlocked', 'unclaimed_unlocked', 'claimed', 'pending_claim'
 * @property {string} dateRange - Filter by date range: 'all', 'today', 'week', 'month', 'custom'
 * @property {string} fromDate - Custom start date (ISO string)
 * @property {string} toDate - Custom end date (ISO string)
 * @property {string} minAmount - Minimum amount filter
 * @property {string} maxAmount - Maximum amount filter
 * @property {string} periodMonths - Filter by lock period: '1', '2', '3'
 * @property {string} searchTerm - Search term for address, token ID, or transaction hash
 */

/**
 * @typedef {Object} DepositsPagination
 * @property {number} currentPage - Current page number
 * @property {number} totalPages - Total number of pages
 * @property {number} totalCount - Total number of deposits
 * @property {boolean} hasNextPage - Whether there's a next page
 * @property {boolean} hasPrevPage - Whether there's a previous page
 * @property {number} limit - Number of items per page
 */

export {};
