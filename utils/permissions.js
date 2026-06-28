const { reviewRoles } = require('../config');

// Returns true if the member has at least one of the configured review roles.
// Centralized here so Accept/Deny buttons and /edit flights stay in sync.
function hasReviewPermission(member) {
  if (!member || !member.roles || !member.roles.cache) return false;
  return member.roles.cache.some((role) => reviewRoles.includes(role.name));
}

module.exports = { hasReviewPermission };
