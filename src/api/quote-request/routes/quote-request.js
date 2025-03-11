'use strict';

/**
 * Quote Request router
 */

// Using destructuring to directly access the factories property
const { factories } = require('@strapi/strapi');
const { createCoreRouter } = factories;

module.exports = createCoreRouter('api::quote-request.quote-request');
