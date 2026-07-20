// Product brand constants. The product code is stamped at instantiation
// (instantiate.mjs replaces the placeholder); domain-neutral in the template.
export const BRAND = {
  productCode: "__PRODUCT_CODE__",
  displayName: "__PRODUCT_CODE__",
  defaultLocale: "en",
} as const;

export type Brand = typeof BRAND;
