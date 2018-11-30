export default function validatePaymentInformationForm(values = {}) {
  const creditCardValues = values.creditCard || {};
  const creditCardBillingAddressValues = creditCardValues.billingAddress || {};

  return {
    creditCard: {
      number: (!creditCardValues.number || (creditCardValues.number && creditCardValues.number.trim() === '') || creditCardValues.number.length < 15 || creditCardValues.number.length > 17) && 'Credit card number is invalid',
      expirationMonth: !creditCardValues.expirationMonth && 'Expiration month is required',
      expirationYear: !creditCardValues.expirationYear && 'Expiration year is required',
      cvv: (!creditCardValues.cvv || (creditCardValues.cvv && creditCardValues.cvv.trim() === '') || creditCardValues.cvv > 9999 || isNaN(creditCardValues.cvv)) && 'CVV is invalid',
      billingAddress: {
        firstName: (!creditCardBillingAddressValues.firstName || (creditCardBillingAddressValues.firstName && creditCardBillingAddressValues.firstName.trim() === '')) && 'First name is required',
        lastName: (!creditCardBillingAddressValues.lastName || (creditCardBillingAddressValues.lastName && creditCardBillingAddressValues.lastName.trim() === '')) && 'Last name is required',
        streetAddress: (!creditCardBillingAddressValues.streetAddress || (creditCardBillingAddressValues.streetAddress && creditCardBillingAddressValues.streetAddress.trim() === '')) && 'Street address is required',
        city: (!creditCardBillingAddressValues.city || (creditCardBillingAddressValues.city && creditCardBillingAddressValues.city.trim() === '')) && 'City is required',
        postalCode: (!creditCardBillingAddressValues.postalCode || (creditCardBillingAddressValues.postalCode && creditCardBillingAddressValues.postalCode.trim() === '')) && 'Postal code is required',
      },
      countryCode: !creditCardValues.countryCode && 'Country code is required',
    },
  };
}

