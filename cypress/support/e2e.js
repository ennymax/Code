/* eslint import/no-unassigned-import: 0 */
/* eslint unicorn/prevent-abbreviations: 0 */

// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:

import './commands';
import 'cypress-plugin-api';
import 'cypress-wait-until';
import 'cypress-real-events-v14';

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  if (err.message.includes('Network request failed')) {
    return false;
  }

  // Let other errors fail the test
  return true;
});
require('cypress-xpath');

// Alternatively you can use CommonJS syntax:
// require('./commands')
