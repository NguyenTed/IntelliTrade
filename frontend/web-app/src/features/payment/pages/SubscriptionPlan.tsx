
import React, { useState, useRef } from 'react';
import { getVNPayUrl } from '../api/SubscriptionApiService';
import { authStore } from '@/features/auth/model/authStore';

const SubscriptionPlans: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPlan] = useState<'Pro'>('Pro');
  const contentRef = useRef<HTMLDivElement>(null);
  const user = authStore;

  const handleSubscribe = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      const userId = user.getState().user?.userId;
      if (!userId) {
        alert('User not found!');
        return;
      }
      const result = await getVNPayUrl(userId);
      // Nếu API trả về object có trường url, thì lấy url, nếu trả về string thì dùng luôn
      let url = '';
      if (typeof result === 'string') {
        url = result;
      } else if (result && typeof result === 'object' && result.url) {
        url = result.url;
      }
      if (url) {
        window.location.href = url;
      } else {
        alert('Failed to get payment URL');
      }
    } catch (error) {
      console.error('Payment URL fetch error:', error);
      alert('Failed to get payment URL');
    }
  };

  return (
    <div
      ref={contentRef}
      className="relative flex flex-col items-center justify-center min-h-screen bg-white p-6 overflow-hidden"
    >
      <h1 className="text-4xl font-bold mb-2">Choose your plan</h1>
      <p className="text-lg mb-8">
        Upgrade your plan to get unlimited features and much more
      </p>
      <div className="w-full max-w-md">
        <div className="border rounded-2xl p-6 shadow text-center">
          <h2 className="text-2xl font-semibold">Pro</h2>
          <p className="text-sm text-gray-600 mt-1">
            Distraction-free trading and investing...
          </p>
          <p className="text-3xl font-bold mt-4">
            $4.99<span className="text-base font-normal">/mo</span>
          </p>
          <button
            onClick={handleSubscribe}
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
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Payment</h3>
            <p>
              You're subscribing to the <strong>{selectedPlan}</strong> plan.
            </p>
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
