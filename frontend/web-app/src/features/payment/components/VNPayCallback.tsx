import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Spin, Result, Button } from "antd";
import { createSubscription } from "../api/SubscriptionApiService";

const VNPayCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      setLoading(true);

      const queryParams = Object.fromEntries(searchParams.entries());
      console.log("paymentId:", queryParams.paymentId);
      console.log("subscriptionType:", queryParams.subscriptionType);

      handleUpdateSubscriptions(
        queryParams.paymentId,
        queryParams.vnp_TransactionNo,
        queryParams.vnp_PayDate,
        queryParams.vnp_TransactionStatus,
        queryParams.subscriptionType
      );
    };

    verifyPayment();
  }, []);

  const handleUpdateSubscriptions = async (
    paymentId: string,
    vnp_TransactionNo: string,
    vnp_PayDate: string,
    vnp_TransactionStatus: string,
    subscriptionType: string
  ) => {
    try {
      const res = await createSubscription(
        paymentId,
        vnp_TransactionNo,
        vnp_PayDate,
        vnp_TransactionStatus,
        subscriptionType
      );
      console.log("res: ", res);
      if (res && res.data?.statusCode === 200) {
        setLoading(false);
        setStatus("success");
      } else {
        setLoading(false);
        setStatus("error");
      }
    } catch (error) {
      setLoading(false);
      setStatus("error");
      console.error("Payment update error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spin size="large" />
        <p className="mt-4">Checking Transaction...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {status === "success" ? (
        <Result
          status="success"
          title="Payment successfully!"
          subTitle="Thanks for using my service."
          extra={
            <Button type="primary" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          }
        />
      ) : (
        <Result
          status="error"
          title="Transaction Failed!"
          subTitle="Please check your credit card!"
          extra={
            <Button type="primary" onClick={() => navigate("/pricing")}>
              Try again
            </Button>
          }
        />
      )}
    </div>
  );
};

export default VNPayCallback;
