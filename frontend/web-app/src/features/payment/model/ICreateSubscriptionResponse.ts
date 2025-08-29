export interface ICreateSubscriptionResponse {
  success: boolean;
  message: string;
  data?: {
    subscriptionId: number;
    paymentId: string;
    transactionNo: string;
    transactionTime: string;
    transactionStatus: string;
    subscriptionType: string;
    // Add more fields if needed
  };
}
