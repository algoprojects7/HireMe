import api from './api';

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (amount: number, bookingId: string, onSuccess: () => void) => {
  try {
    // We create a dynamic payment link via our API
    const { data: paymentLink } = await api.post('/payments/create-link', { 
      amount, 
      bookingId 
    });

    // Open the unique short URL provided by Razorpay
    window.open(paymentLink.short_url, '_blank');
    
    // In a real flow with webhooks, the system would update automatically.
    // For the demo, we still provide a confirmation dialog.
    if (confirm('A payment link has been opened. Once you have completed the payment, click OK to confirm in the system.')) {
      await api.post(`/bookings/${bookingId}/pay-advance`);
      onSuccess();
    }
  } catch (err) {
    console.error('Payment initiation failed', err);
    alert('Failed to generate payment link');
  }
};
