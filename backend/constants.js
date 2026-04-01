// Shared constants — avoids circular dependencies
const JWT_SECRET = process.env.JWT_SECRET || 'expense_tracker_secret_2024';
module.exports = { JWT_SECRET };
