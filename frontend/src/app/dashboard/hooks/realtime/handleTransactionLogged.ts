"use client";

interface TransactionLoggedContext {
  loadTransactions: () => Promise<void>;
  reservationsState: any;
}

export function handleTransactionLogged(
  data: { reservationId: string } | undefined,
  ctx: TransactionLoggedContext
) {
  ctx.loadTransactions();
  if (data?.reservationId) {
    if (ctx.reservationsState.setPaymentsUpdatedTrigger) {
      ctx.reservationsState.setPaymentsUpdatedTrigger((prev: number) => prev + 1);
    }
    if (ctx.reservationsState.fetchReservations) {
      ctx.reservationsState.fetchReservations();
    }
  }
}
