export interface SubscriptionType {
  id: number;
  name: string;
  price: string;
  duration: number;
}

const getVNPayUrl = async (data: number) => {
  const URL_BACKEND = "/api/v1/payment/vnpay/url/" + data;
  const res = await fetch(URL_BACKEND, { method: "GET" });
  return res.json();
};

const createSubscription = async (
  paymentId: string,
  vnp_TransactionNo: string,
  vnp_PayDate: string,
  vnp_TransactionStatus: string,
  subscriptionType: string
) => {
  const URL_BACKEND = "http://localhost:8085/payment/api/v1/subscription";
  const year = vnp_PayDate.substring(0, 4);
  const month = vnp_PayDate.substring(4, 6);
  const day = vnp_PayDate.substring(6, 8);
  const formattedDate = `${year}-${month}-${day}`;
  const data = {
    paymentId: paymentId,
    transactionNo: vnp_TransactionNo,
    transactionTime: formattedDate,
    transactionStatus: vnp_TransactionStatus,
    subscriptionType: subscriptionType,
  };
  const res = await fetch(URL_BACKEND, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export { getVNPayUrl, createSubscription };
