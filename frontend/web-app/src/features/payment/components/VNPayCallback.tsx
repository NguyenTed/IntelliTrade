import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Spin, Result, Button } from "antd";
import { createSubscription } from "../api/SubscriptionApiService";
import { authStore } from "@/features/auth/model/authStore";

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
  function vnpCompactToIsoLocal(compact: string): string {
    if (!/^\d{14}$/.test(compact)) throw new Error("Bad VNPay time format");
    const y = compact.slice(0, 4);
    const M = compact.slice(4, 6);
    const d = compact.slice(6, 8);
    const h = compact.slice(8, 10);
    const m = compact.slice(10, 12);
    const s = compact.slice(12, 14);
    return `${y}-${M}-${d}T${h}:${m}:${s}`;
  }

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
        vnpCompactToIsoLocal(vnp_PayDate),
        vnp_TransactionStatus,
        subscriptionType
      );
      console.log("res: ", res);
      if (res) {
        try {
          const loadMe = authStore.getState().loadMe;
          if (typeof loadMe === "function") {
            await loadMe();
          }
        } catch (e) {
          console.warn("Profile refresh after VNPay success failed:", e);
        }
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
