/*
// src/hooks/useRazorpay.js
import { useCallback } from 'react';
import { initiateCheckout, verifyPayment } from '../services/orderService';

// Dynamically load Razorpay script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src   = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const checkout = useCallback(async ({
    cartItems,
    addressId,
    userProfile,      // { full_name, phone, email }
    notes = '',
    onSuccess,
    onFailure,
  }) => {
    // 1. Load SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onFailure?.('Failed to load Razorpay. Check your internet connection.');
      return;
    }

    // 2. Create order on backend
    let orderData;
    try {
      orderData = await initiateCheckout({ cartItems, addressId, notes });
    } catch (err) {
      onFailure?.(err.message ?? 'Could not create order.');
      return;
    }

    // 3. Open Razorpay modal
    const options = {
      key:         orderData.keyId,
      amount:      orderData.amount,
      currency:    orderData.currency,
      name:        "Sumathi's Crazy Collections",
      description: `Order #${orderData.orderNumber}`,
      order_id:    orderData.razorpayOrderId,
      prefill: {
        name:    userProfile?.full_name ?? '',
        email:   userProfile?.email     ?? '',
        contact: userProfile?.phone     ?? '',
      },
      theme: { color: '#E91E8C' },

      handler: async (response) => {
        // 4. Verify payment on backend
        try {
          await verifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            order_id:            orderData.orderId,
          });
          onSuccess?.(orderData.orderId);
        } catch (err) {
          onFailure?.(err.message ?? 'Payment verification failed.');
        }
      },

      modal: {
        ondismiss: () => onFailure?.('Payment was cancelled.'),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }, []);

  return { checkout };
}
*/
