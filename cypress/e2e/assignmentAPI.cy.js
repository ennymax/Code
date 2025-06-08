describe('Loan Calculation GraphQL API', () => {
  it('should return valid loan calculation data', () => {
    cy.request({
      method: 'POST',
      url: 'https://platform-demo.seez.dev/api',
      headers: {
        'client-id': 'aam',
        'Content-Type': 'application/json',
      },
      body: {
        query: `
          query loanCalculations($input: LoanCalculationInput) {
            loanCalculations(listingId: 253945, input: $input) {
              selected
              config {
                interestTypes
                terms
                maxPaymentTerms
                downPayment { min max default }
                provider { name logo }
              }
              userInput {
                selectedProvider
                downPayment
                interestType
                paymentTerms
              }
              calculation {
                apr
                aopBeforeTax
                financedAmount
                loanAmount
                downPayment
                downPaymentPct
                totalPayable
                totalLoanCost
                paymentTerms
                monthlyPayment
                nominalInterestRate
                interestType
                interestRate
                disclaimer
                rates { key value }
                customAttributes { key value }
              }
              errors { field errorCode }
            }
          }
        `,
        variables: {
          input: {
            customerType: 'qatari',
            downPayment: 21700,
            interestType: 'fixed',
            paymentTerms: 12,
            selectedProvider: 'emi',
          },
        },
      },
    }).then((response) => {
      expect(response.status).to.eq(200);

      const loan = response.body.data.loanCalculations[0];

      expect(response.body.data.loanCalculations).to.be.an('array');
      expect(loan.selected).to.be.true;
      expect(loan.config.interestTypes).to.include('fixed');
      expect(loan.config.downPayment.min).to.equal(21700);
      expect(loan.config.downPayment.max).to.equal(217000);
      expect(loan.config.downPayment.default).to.equal(21700);
      expect(loan.config.provider.name).to.equal('emi');
      expect(loan.calculation.monthlyPayment).to.equal(17211);
      expect(loan.errors).to.be.an('array').that.is.empty;

      cy.log('All GraphQL assertions passed');
    });
  });
});
