'use strict';

/**
 * `isAuthenticated` policy
 */

module.exports = (policyContext, config, { strapi }) => {
  if (policyContext.state.user) {
    // Go to next policy or controller
    return true;
  }

  return false;
};
