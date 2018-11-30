import currencyFormatter from 'currency-formatter';
import config from '../../constants/config';
import LocalizedStrings from './data';

export function localizedStringForKey(str) {
  let localizedString = str;
  if (config.locale === 'af_ZA') {
    if (LocalizedStrings.af_za[str]) {
      localizedString = LocalizedStrings.af_za[str];
    }
  } else if (window.store.getState().user.country_code === 'GB') {
    if (LocalizedStrings.en_gb[str]) {
      localizedString = LocalizedStrings.en_gb[str];
    }
  }
  return localizedString;
}

export function formatNumberToCurrency(number, locale) {
  return currencyFormatter.format(number, { locale });
}
