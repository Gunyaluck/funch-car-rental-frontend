const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })

export function getCountryName(countryCode: string) {
  return countryNames.of(countryCode) ?? countryCode
}
