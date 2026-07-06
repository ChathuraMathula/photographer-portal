export type InvoiceItem = {
  reservation: {
    id: string;
    date: string;
    eventType: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  totalPaidLkr: number;
  totalValueLkr: number;
  isFullyPaid: boolean;
};

export type InvoiceSettings = {
  invoiceTitle: string;
  invoiceColor: string;
  invoiceNotes: string;
  invoiceLogoText: string;
  invoicePhone: string;
  invoiceTaxRate: number;
  invoiceInstructions: string;
};
