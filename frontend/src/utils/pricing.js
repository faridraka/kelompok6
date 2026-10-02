// DISPLAY-ONLY estimate for the cart/checkout screens.
// The backend is the source of truth (orders.total_price, invoices.tax/discount).
// NEXT WEEK: once POST /orders returns tax/total, the final amount shown after
// payment comes from the server. Update TAX_RATE here to match the backend.
export const TAX_RATE = 0.11

export const calcTotals = (price) => {
  const subtotal = Number(price)
  const tax = Math.round(subtotal * TAX_RATE)
  return { subtotal, tax, discount: 0, total: subtotal + tax }
}
