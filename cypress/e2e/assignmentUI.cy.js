// Page object imports
import carDetailPage from '../pages/carDetailPage';
import landingPage from '../pages/landingPage';
import orderSummaryPage from '../pages/orderSummaryPage';

// Instantiate page objects
const landingpage = new landingPage();
const cardetailpage = new carDetailPage();
const orderSummarypage = new orderSummaryPage();

// List of loan durations to simulate
const loanDurations = [12, 18, 24, 30, 36, 42, 48];

// Get product ID from Cypress environment
const productId = Cypress.env('productId');

/**
 * Simulate a loan for a given user country and down payment percentage.
 * Sets up price, admin fee, downpayment, and API interception for simulation.
 */
const simulateLoan = (country, downPaymentPercentage) => {
  cardetailpage.searchCountry(country);
  return cardetailpage.extractCarPrice().then((carPrice) => {
    return cardetailpage.extractFuelType().then((fuelType) => {
      const adminFee =
        fuelType === 'Hybrid' ? 350 : carPrice > 100_000 ? 500 : 350;
      const downpayment = carPrice * downPaymentPercentage;
      const cashPayment = downpayment + adminFee;

      cy.log(`Cash Payment: ${cashPayment}`);
      cy.log(`Admin Fee: ${adminFee}`);

      cardetailpage.enterDownPayment(downpayment);

      // Intercept loan simulation API call
      cy.intercept('POST', '/api').as('loanSimulation');
    });
  });
};

describe('Loan Simulation Tests', () => {
  beforeEach(() => {
    // Clean session state
    cy.clearCookies();
    cy.clearLocalStorage();

    // Open landing page and select language
    landingpage
      .visit('/search?sort=-attractiveness')
      .selectLanguage()
      .selectEnglish();

    // Select car and verify it's loaded correctly
    landingpage.selectCarById(productId).then(() => {
      const carDetails = Cypress.env('carDetails');
      cardetailpage
        .verifyLandingPageURL(productId)
        .assertCarNameAndModel(carDetails.name, carDetails.model);
    });
  });

  describe('Qatari User Simulations', () => {
    for (const month of loanDurations) {
      it(`TC00: should simulate loan for Qatari - ${month} months`, () => {
        simulateLoan('Qatar', 0.1).then(() => {
          cardetailpage.chooseLoanDuration(month).calculateLoan();

          cy.wait('@loanSimulation').then(({ response }) => {
            const data = response.body.data.loanCalculations[0].calculation;

            cardetailpage
              .assertMonthlyInstallment(data.monthlyPayment)
              .assertLoanDuration(data.paymentTerms)
              .assertTotalFinanceAmount(data.financedAmount)
              .assertTotalPayableAmount(data.totalPayable);
          });
        });
      });
    }

    it('TC01: should simulate a Complete order for Qatari - 12 months', () => {
      const twelveMonth = 12;

      simulateLoan('Qatar', 0.1).then(() => {
        cardetailpage.chooseLoanDuration(twelveMonth).calculateLoan();

        cy.wait('@loanSimulation').then(({ response }) => {
          const data = response.body.data.loanCalculations[0].calculation;

          cy.log(`Verifying loan calculation for ${twelveMonth} months`);
          cardetailpage
            .assertMonthlyInstallment(data.monthlyPayment)
            .assertLoanDuration(data.paymentTerms)
            .assertTotalFinanceAmount(data.financedAmount)
            .assertTotalPayableAmount(data.totalPayable);
        });

        cardetailpage.startOrder().then(() => {
          const carDetails = Cypress.env('carDetails');
          orderSummarypage
            .verifyOrderSummarTittle()
            .assertCarNameAndModel(carDetails.name, carDetails.model);
        });

        orderSummarypage.clickStart();
      });
    });
  });

  describe('Non-Qatari User Simulations Checkout', () => {
    it('TC003 should simulate a Complete order for Non-Qatari - 12 months', () => {
      const twelveMonth = 12;

      simulateLoan('Egypt', 0.2).then(() => {
        if ([42, 48].includes(twelveMonth)) {
          cy.log(
            `Loan duration ${twelveMonth} is not available for Non-Qatari users`,
          );
          return cardetailpage.selectLoanMonth(twelveMonth).should('not.exist');
        }

        cardetailpage.chooseLoanDuration(twelveMonth).calculateLoan();

        cy.wait('@loanSimulation').then(({ response }) => {
          const data = response.body.data.loanCalculations[0].calculation;

          cy.log(`Verifying loan calculation for ${twelveMonth} months`);
          cardetailpage
            .assertMonthlyInstallment(data.monthlyPayment)
            .assertLoanDuration(data.paymentTerms)
            .assertTotalFinanceAmount(data.financedAmount)
            .assertTotalPayableAmount(data.totalPayable);
        });

        cardetailpage.startOrder().then(() => {
          const carDetails = Cypress.env('carDetails');
          orderSummarypage
            .verifyOrderSummarTittle()
            .assertCarNameAndModel(carDetails.name, carDetails.model);
        });

        orderSummarypage.clickStart();
      });
    });

    for (const month of loanDurations) {
      it(`TC004: should simulate loan for Non-Qatari - ${month} months`, () => {
        simulateLoan('Egypt', 0.2).then(() => {
          if ([42, 48].includes(month)) {
            cardetailpage.selectLoanMonth(month).should('not.exist');
          } else {
            cardetailpage.chooseLoanDuration(month).calculateLoan();

            cy.wait('@loanSimulation').then(({ response }) => {
              const data = response.body.data.loanCalculations[0].calculation;

              cardetailpage
                .assertMonthlyInstallment(data.monthlyPayment)
                .assertLoanDuration(data.paymentTerms)
                .assertTotalFinanceAmount(data.financedAmount)
                .assertTotalPayableAmount(data.totalPayable);
            });
          }
        });
      });
    }
  });
});
