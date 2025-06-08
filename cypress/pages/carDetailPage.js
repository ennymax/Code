import basePage from './basePage';

// Page Object for Car Detail Page
export default class carDetailPage extends basePage {
  constructor() {
    super();

    // Define page elements as functions for dynamic interaction
    this.elements = {
      calculateLoan: () => cy.contains('button', 'Calculate'),
      carName: () => cy.get('seez-sdk-listing-details'),
      countryOption: () => cy.get('.options-list'),
      countrySearch: () => cy.get('#input-search-dropdown'),
      getCarFuelType: () => cy.get('#fuelType'),
      loanDuration: (number) => cy.get(`button[data-test-id="${number}"]`),
      Months: () => cy.contains('span', 'Months'),
      selectCarPrice: () => cy.get('.selectedPrice p'),
      selectDownPayment: () => cy.get('[data-test-id="downPayment"]'),
      startOrderbtn: () => cy.get('[data-test-id="startOrderCalculator"]'),
      totalFinanceAmount: () => cy.get('div.totalFinanceAmount span'),
      totalPayable: () => cy.get('div.totalPayable span'),
    };
  }

  shadowHost = 'seez-sdk-listing-details';

  // --- Shadow DOM Interactions ---

  // Extracts car name from Shadow DOM
  getCarName() {
    return this.elements
      .carName()
      .shadow()
      .find('h2')
      .should('be.visible')
      .invoke('text')
      .then((text) => text.trim());
  }

  // Extracts car model from Shadow DOM
  getCarModel() {
    return this.elements
      .carName()
      .shadow()
      .find('p')
      .should('be.visible')
      .invoke('text')
      .then((text) => text.trim());
  }

  // Asserts the displayed car name and model
  assertCarNameAndModel(expectedName, expectedModel) {
    this.getCarName().then((actualName) => {
      expect(actualName).to.eq(expectedName);
    });

    this.getCarModel().then((actualModel) => {
      expect(actualModel).to.contain(expectedModel);
    });
  }

  // Stores car details globally for reuse
  carDetails() {
    return this.getCarName().then((name) => {
      return this.getCarModel().then((model) => {
        const carDetails = { model, name };
        Cypress.env('carDetails', carDetails);
        return carDetails;
      });
    });
  }

  // --- Interactions & Assertions ---

  // Initiates the order flow
  startOrder() {
    return this.elements
      .startOrderbtn()
      .should('be.visible')
      .should('be.enabled')
      .click();
  }

  // Gets fuel type and trims text
  extractFuelType() {
    return this.elements
      .getCarFuelType()
      .children('span')
      .eq(1)
      .invoke('text')
      .then((text) => text.trim());
  }

  // Clicks the Calculate button
  calculateLoan() {
    this.elements
      .calculateLoan()
      .should('be.visible')
      .should('be.enabled')
      .click();
    return this;
  }

  // Selects loan duration and triggers calculation
  chooseLoanDuration(month) {
    this.selectLoanMonth(month).should('be.visible').click();
    return this;
  }

  // Fills in down payment amount
  enterDownPayment(downpayment) {
    this.selectDownPayment().should('be.visible').clear().type(downpayment);
    return this;
  }

  // Selects country from dropdown
  searchCountry(name) {
    this.elements.countrySearch().click().clear();
    this.elements.countryOption().contains(name).click();
    return this;
  }

  // Returns locator for loan duration button
  selectLoanMonth(number) {
    return this.elements.loanDuration(number);
  }

  // Returns locator for down payment input
  selectDownPayment() {
    return this.elements.selectDownPayment();
  }

  // Verifies URL contains correct product ID
  verifyLandingPageURL(Id) {
    cy.url().should('include', Id);
    return this;
  }

  // Asserts the calculated monthly installment
  assertMonthlyInstallment(expectedAmount) {
    cy.contains('span', /QAR\s*[\d,]+\.\d{2}\s*\/ month/)
      .invoke('text')
      .then((text) => {
        const match = text.match(/([\d,]+\.\d{2})/);
        const amount = match
          ? Number.parseFloat(match[1].replaceAll(',', ''))
          : null;
        cy.log('Monthly amount:', amount);
        expect(amount).to.equal(expectedAmount);
      });
    return this;
  }

  // Extracts numeric value of car price
  extractCarPrice() {
    return this.elements
      .selectCarPrice()
      .eq(1)
      .invoke('text')
      .then((text) => Number.parseInt(text.replaceAll(/\D/g, ''), 10));
  }

  // Asserts loan duration value
  assertLoanDuration(expectedMonths) {
    this.elements
      .Months()
      .invoke('text')
      .then((text) => {
        const loanDuration = Number.parseInt(text.replaceAll(/\D/g, ''), 10);
        cy.log('Loan Duration:', loanDuration);
        expect(loanDuration).to.equal(expectedMonths);
      });
    return this;
  }

  // Asserts the total amount being financed
  assertTotalFinanceAmount(expectedAmount) {
    this.elements
      .totalFinanceAmount()
      .eq(1)
      .invoke('text')
      .then((text) => {
        const totalLoanAmount = Number.parseFloat(
          text.replaceAll(/[^\d.]/g, ''),
        );
        expect(totalLoanAmount).to.equal(expectedAmount);
      });
    return this;
  }

  // Asserts the total payable amount
  assertTotalPayableAmount(expectedAmount) {
    this.elements
      .totalPayable()
      .eq(1)
      .invoke('text')
      .then((text) => {
        const totalPayable = Number.parseFloat(text.replaceAll(/[^\d.]/g, ''));
        cy.log('Total Payable:', totalPayable);
        expect(totalPayable).to.equal(expectedAmount);
      });
    return this;
  }
}
