// ponytail: single source of truth for shipping options (shared by checkout UI and orders API)
export const SHIPPING_OPTIONS: Record<string, number> = {
  PICKUP: 0,
  URBAN: 12.5,
  RURAL: 17,
};

export const SHIPPING_LABELS: Record<string, string> = {
  PICKUP: 'Pick Up',
  URBAN: 'Urban Area',
  RURAL: 'Rural Area',
};

export function shippingCost(method?: string): number {
  return Object.hasOwn(SHIPPING_OPTIONS, method ?? '') ? SHIPPING_OPTIONS[method ?? ''] : 0;
}
