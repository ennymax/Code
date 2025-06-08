import basePage from './basePage';

// Page Object representing the Order Summary page
export default class orderSummaryPage extends basePage {
  constructor() {
    super();

    // Define key elements on the Order Summary page
    this.elements = {
      // Car price info (third child)
      startButton: () => cy.get('.contentHolder > button'),

      // Car name heading
      vehicleModel: () => cy.get('.carInfo > div > :nth-child(2)'),
      vehicleName: () => cy.get('.carInfo > div > h1'),
      // Car model info (second child)
      vehiclePrize: () => cy.get('.carInfo > div > :nth-child(3)'), // Start button to proceed with order
    };
  }

  // Clicks the start button to proceed from the order summary page
  clickStart() {
    this.elements.startButton().should('be.visible').click();
    return this; // Allow chaining
  }

  // Retrieves the car name text from the page, trimmed of whitespace
  getCarName() {
    return this.elements
      .vehicleName()
      .should('be.visible')
      .invoke('text')
      .then((text) => text.trim());
  }

  // Retrieves the car model text from the page, trimmed of whitespace
  getCarModel() {
    return this.elements
      .vehicleModel()
      .should('be.visible')
      .invoke('text')
      .then((text) => text.trim());
  }

  // Retrieves the car price as a numeric value after cleaning the raw text
  getCarPrize() {
    return this.elements
      .vehiclePrize()
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const cleanText = text.replaceAll('\u00A0', ' ').trim(); // Replace non-breaking spaces and trim
        const numericPrice = Number.parseInt(
          cleanText.replaceAll(/\D/g, ''),
          10,
        ); // Extract digits only and parse to int
        cy.log(`Car Price: ${numericPrice}`);
        return numericPrice;
      });
  }

  /**
   * Assert that the car name and model on the page match the expected values.
   * Uses Cypress assertions to verify actual vs expected.
   * @param {string} expectedName - Expected car name
   * @param {string} expectedModel - Expected car model (partial match)
   */
  assertCarNameAndModel(expectedName, expectedModel) {
    return cy.then(() => {
      return this.getCarName().then((actualName) => {
        expect(actualName).to.eq(expectedName);
        return this.getCarModel().then((actualModel) => {
          expect(actualModel).to.contain(expectedModel);
        });
      });
    });
  }

  // Verify that the page title matches the expected title for Order Summary page
  verifyOrderSummarTittle() {
    return this.verifyPageTitle('Start your Buying Journey · AAM');
  }
}
