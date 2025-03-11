'use strict';

/**
 * Policy configuration for the application
 */

module.exports = {
  isAuthenticated: (ctx, next) => {
    if (ctx.state.user) {
      return next();
    }
    return ctx.unauthorized();
  },
  isAdmin: (ctx, next) => {
    if (ctx.state.user && 
        ((ctx.state.user.role && ctx.state.user.role.type === 'admin') || 
         (ctx.state.user.roles && Array.isArray(ctx.state.user.roles) && 
          ctx.state.user.roles.some(role => role.type === 'admin')))) {
      return next();
    }
    return ctx.forbidden();
  },
};
