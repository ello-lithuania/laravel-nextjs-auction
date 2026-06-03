// Bendri formatavimo helperiai. Kaina aukcione yra emocinis centras —
// rodom ją tvarkingai su lietuvišku tarpu tarp tūkstančių: "3 450 €".

export const formatEur = (value: number | string): string =>
  new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value));

// Su centais — detalės puslapiui, kur tikslumas svarbus.
export const formatEurPrecise = (value: number | string): string =>
  new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));
