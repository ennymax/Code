// Test suite for verifying loan calculation results for various payment durations
describe('Loan Calculation - Payment Duration Tests', () => {
  // GraphQL API endpoint and required headers
  const endpoint = 'https://platform-demo.seez.dev/api';
  const headers = {
    'client-id': 'aam',
    'Content-Type': 'application/json',
  };

  // List of valid payment durations to test
  const loanDurations = [12, 18, 24, 30, 36, 42, 48];

  // GraphQL query used to fetch loan calculation data
  const baseQuery = `
    query loanCalculations($input: LoanCalculationInput) {
      loanCalculations(listingId: 253945, input: $input) {
        calculation {
          paymentTerms
          monthlyPayment
        }
        errors { field errorCode }
      }
    }
  `;

  // Iterate through each payment duration and verify response is valid
  loanDurations.forEach((duration) => {
    it(`should return valid calculation for payment term = ${duration}`, () => {
      cy.request({
        method: 'POST',
        url: endpoint,
        headers,
        body: {
          query: baseQuery,
          variables: {
            input: {
              customerType: 'qatari',
              downPayment: 21700,
              interestType: 'fixed',
              paymentTerms: duration,
              selectedProvider: 'emi',
            },
          },
        },
      }).then((res) => {
        // Assert the response was successful
        expect(res.status).to.eq(200);

        const loan = res.body.data.loanCalculations[0];

        // Validate the returned payment term matches the requested one
        expect(loan.calculation.paymentTerms).to.equal(duration);

        // Ensure a monthly payment value is returned and is a number
        expect(loan.calculation.monthlyPayment).to.be.a('number');

        // Confirm there are no calculation errors
        expect(loan.errors).to.be.an('array').that.is.empty;
      });
    });
  });

  // Edge case: malformed GraphQL query should return 400 with errors
  it('should handle invalid GraphQL syntax', () => {
    cy.request({
      method: 'POST',
      url: endpoint,
      headers,
      body: {
        query: 'query { loanCalculations }', // intentionally invalid query
      },
      failOnStatusCode: false, // don't fail the test automatically on 4xx/5xx
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.errors).to.exist;
    });
  });
});
