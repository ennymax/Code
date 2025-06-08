import basePage from './basePage';

// Page Object representing the Landing Page
export default class landingPage extends basePage {
  constructor() {
    super();

    // Define page elements using getter functions for dynamic access
    this.elements = {
      // Language options list
      carName: () => cy.get('seez-sdk-listing-details'),

      // Language dropdown button
      english: () => cy.get('ul.language-dropdown-list li div'),
      languageSpan: () => cy.get('.nav-container > .language-btn > span'), // Car listing shadow DOM element
      selectCarId: (carId) => cy.get(`a.listingCard[href="/listing/${carId}"]`), // Car listing link by carId
    };
  }

  // Opens the language dropdown menu
  selectLanguage() {
    this.elements.languageSpan().should('be.visible').click();
    return this; // Return this for method chaining
  }

  // Selects the English language option from the dropdown
  selectEnglish() {
    this.elements
      .english()
      .should('be.visible')
      .should('have.length', 2) // Expect exactly 2 language options
      .contains('English') // Find the English option
      .click();
    return this; // For chaining
  }

  /**
   * Selects a car on the landing page by its product ID.
   * Retrieves car name and model, stores them globally for reuse.
   * Then clicks the car listing to navigate to details.
   * @param {string} carId - The unique ID of the car to select.
   * @returns {Promise} Resolves with car details {name, model}.
   */
  selectCarById(carId) {
    return this.elements
      .selectCarId(carId)
      .should('exist') // Ensure the element exists before interaction
      .within(() => {
        // Extract car name text inside the listing card
        const namePromise = cy
          .get('span.name')
          .invoke('text')
          .then((t) => t.trim());

        // Extract car model text inside the listing card
        const modelPromise = cy
          .get('span.variant')
          .invoke('text')
          .then((t) => t.trim());

        // Wait for both name and model to be extracted
        return Promise.all([namePromise, modelPromise]).then(
          ([name, model]) => {
            const carDetails = { model, name };
            Cypress.env('carDetails', carDetails); // Store details globally in Cypress environment
            return carDetails; // Return for immediate use
          },
        );
      })
      .click(); // Click the car link after extracting details
  }
}
