import React, { useState, useRef } from 'react';
import axios from 'axios';

const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userId] = useState("user123"); // Replace with real userId from auth/session
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSubscribe = (plan: 'Community' | 'Pro') => {
    setSelectedPlan(plan);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    
    if (!selectedPlan) return;
    const subscriptionType = selectedPlan.toUpperCase();
    try {
      const response = await axios.get<string>(
        `http://localhost:8085/payment/api/v1/payment/vnpay/url/${subscriptionType}/${userId}`
      );
      window.location.href = response.data; // redirect to VNPay URL
    } catch (error) {
      console.error("Payment URL fetch error:", error);
      alert("Failed to get payment URL");
    }
  };

  return (
    <div ref={contentRef} className="relative flex flex-col items-center justify-center min-h-screen bg-white p-6 overflow-hidden">
      <h1 className="text-4xl font-bold mb-2">Choose your plan</h1>
      <p className="text-lg mb-8">Upgrade your plan to get unlimited features and much more</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Community Plan */}
        <div className="border rounded-2xl p-6 shadow text-center">
          <h2 className="text-2xl font-semibold">Community</h2>
          <p className="text-sm text-gray-600 mt-1">Distraction-free trading and investing...</p>
          <p className="text-3xl font-bold mt-4">$1.99<span className="text-base font-normal">/mo</span></p>
          <button
            onClick={() => handleSubscribe('Community')}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            SUBSCRIBE
          </button>
          <ul className="text-left mt-4 text-sm text-gray-700 list-disc pl-4">
            <li>toolkits for drawing trading support line</li>
            <li>multi-monitor support in Desktop app</li>
            <li>more indicators support</li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="border rounded-2xl p-6 shadow text-center">
          <h2 className="text-2xl font-semibold">Pro</h2>
          <p className="text-sm text-gray-600 mt-1">Distraction-free trading and investing...</p>
          <p className="text-3xl font-bold mt-4">$4.99<span className="text-base font-normal">/mo</span></p>
          <button
            onClick={() => handleSubscribe('Pro')}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            SUBSCRIBE
          </button>
          <ul className="text-left mt-4 text-sm text-gray-700 list-disc pl-4">
            <li>toolkits for drawing trading support line</li>
            <li>multi-monitor support in Desktop app</li>
            <li>more indicators support</li>
            <li>add unlimited chart in multichart</li>
            <li>modify custom indicators</li>
            <li>predict next price (Limited Assets)</li>
            <li>backtesting</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Payment</h3>
            <p>You're subscribing to the <strong>{selectedPlan}</strong> plan.</p>
            <p className="mt-2">Do you want to proceed with VNPay?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
