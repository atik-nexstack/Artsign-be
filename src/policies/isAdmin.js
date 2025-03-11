'use strict';

/**
 * `isAdmin` policy
 */

module.exports = (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  if (!user) {
    return false;
  }

  // Check if the user has the admin role
  if (user.role && user.role.type === 'admin') {
    return true;
  }

  // If using the users-permissions plugin, check for admin role
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some(role => role.type === 'admin');
  }

  return false;
};
