import { http } from "@/shared/api/createClient";
import type { ICreateSubscriptionResponse } from "../model/ICreateSubscriptionResponse";

export interface SubscriptionType {
  id: number;
  name: string;
  price: string;
  duration: number;
}

export const getVNPayUrl = async (id: string): Promise<{ url: string }> => {
  const res = await http.get<{ url: string }>(`/payment/vnpay/url/PRO/${id}`);
  return res.data;
};

interface CreateSubscriptionPayload {
  paymentId: string;
  transactionNo: string;
  transactionTime: string;
  transactionStatus: string;
  subscriptionType: string;
}

export const createSubscription = async (
  paymentId: string,
  vnp_TransactionNo: string,
  vnp_PayDate: string,
  vnp_TransactionStatus: string,
  subscriptionType: string
): Promise<ICreateSubscriptionResponse> => {
  const year = vnp_PayDate.substring(0, 4);
  const month = vnp_PayDate.substring(4, 6);
  const day = vnp_PayDate.substring(6, 8);
  const formattedDate = `${year}-${month}-${day}`;
  const payload: CreateSubscriptionPayload = {
    paymentId,
    transactionNo: vnp_TransactionNo,
    transactionTime: formattedDate,
    transactionStatus: vnp_TransactionStatus,
    subscriptionType,
  };
  const res = await http.post<ICreateSubscriptionResponse>(
    "/payment/subscription",
    payload
  );
  return res.data;
};
