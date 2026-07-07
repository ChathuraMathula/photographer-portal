import { useState, useEffect } from "react";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function usePaymentSandbox(
  open: boolean,
  reservation: any,
  token: string,
  packageId: string,
  onSuccess: (s: string, p: string) => void,
  onClose: () => void,
) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [processingStep, setProcessingStep] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const getSriLankanBankName = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (clean.startsWith("453285")) return "Sampath Bank (Visa)";
    if (clean.startsWith("543788")) return "Sampath Bank (Mastercard)";
    if (clean.startsWith("405659")) return "Commercial Bank (Visa)";
    if (clean.startsWith("525496")) return "Commercial Bank (Mastercard)";
    if (clean.startsWith("490822")) return "HNB (Visa)";
    if (clean.startsWith("510526")) return "HNB (Mastercard)";
    if (clean.startsWith("400586")) return "BOC (Visa)";
    if (clean.startsWith("549040")) return "BOC (Mastercard)";
    if (clean.startsWith("415668")) return "Seylan Bank (Visa)";
    if (clean.startsWith("520448")) return "Seylan Bank (Mastercard)";
    return null;
  };

  const lkBank = getSriLankanBankName(cardNumber);
  const cardBrand =
    lkBank ||
    (cardNumber.replace(/\s+/g, "").startsWith("4")
      ? "Visa"
      : cardNumber.replace(/\s+/g, "").startsWith("5")
        ? "Mastercard"
        : null);

  const fillTestCard = (num: string) => {
    setCardNumber(num);
    setExpiryDate("12/28");
    setCvv("123");
    setCardholderName("John Doe");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiryDate || !cvv || !cardholderName)
      return toast.error("Please fill in all card details.");
    setPaymentStatus("processing");
    setErrorMsg("");
    setProcessingStep("Securing connection to bank...");
    await new Promise((r) => setTimeout(r, 800));
    setProcessingStep("Verifying card parameters...");
    await new Promise((r) => setTimeout(r, 800));
    setProcessingStep("Authorizing deposit funds...");
    try {
      const res = await fetch(`${API}/payments/charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email: localStorage.getItem(`verified_email_res_${token}`) || "",
          packageId,
          cardNumber,
          expiryDate,
          cvv,
          cardholderName,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Payment authorization failed");
      const isBalancePayment = reservation.status === "CONFIRMED";
      setPaymentStatus("success");
      setProcessingStep(
        isBalancePayment
          ? "Payment approved! Balance settled."
          : "Payment approved! Booking confirmed.",
      );
      toast.success(
        isBalancePayment
          ? "Remaining balance paid successfully!"
          : "Deposit paid and slot confirmed!",
      );
      setTimeout(() => {
        onSuccess("CONFIRMED", packageId);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Card transaction failed");
      setPaymentStatus("error");
      toast.error(err.message || "Payment declined");
    }
  };

  useEffect(() => {
    if (open) {
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setCardholderName("");
      setPaymentStatus("idle");
      setErrorMsg("");
      setProcessingStep("");
    }
  }, [open]);

  const getDepositAmountInCents = () => {
    if (!packageId || !reservation.selectedPackages)
      return reservation.advancePaymentPriceInCents ?? 0;
    const pkg = reservation.selectedPackages.find(
      (p: any) => p.id === packageId,
    );
    if (!pkg) return reservation.advancePaymentPriceInCents ?? 0;
    if (
      pkg.customDepositAmountInCents !== undefined &&
      pkg.customDepositAmountInCents !== null
    )
      return pkg.customDepositAmountInCents;
    if (pkg.depositType === "fixed") return pkg.depositValue ?? 0;
    if (pkg.depositType === "percentage")
      return Math.round((pkg.priceInCents * (pkg.depositValue ?? 0)) / 100);
    return reservation.advancePaymentPriceInCents ?? 0;
  };

  const isBalancePayment = reservation.status === "CONFIRMED";
  const chargeLkr =
    (isBalancePayment
      ? (reservation.totalAmountInCents ?? 0) -
        (reservation.totalPaidInCents ?? 0)
      : getDepositAmountInCents()) / 100;

  return {
    cardNumber,
    setCardNumber,
    expiryDate,
    setExpiryDate,
    cvv,
    setCvv,
    cardholderName,
    setCardholderName,
    paymentStatus,
    processingStep,
    errorMsg,
    cardBrand,
    fillTestCard,
    handleSubmit,
    chargeLkr,
    isBalancePayment,
  };
}
