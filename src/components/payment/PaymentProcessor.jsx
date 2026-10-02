import React, { useState } from 'react';

/**
 * PaymentProcessor.jsx – Development-friendly payment form
 * Simplified payment flow without external Stripe/Firebase integration
 */

const CheckoutForm = ({ amount, orderId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (paymentMethod === 'card' && !cardNumber.trim()) {
      setMessage('Please enter a valid card number.');
      return;
    }

    if (paymentMethod === 'upi' && !upiId.trim()) {
      setMessage('Please enter a valid UPI ID.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock payment success
      setMessage('Payment successful! Processing your order...');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      const messageText = error?.message || 'Payment failed. Please try again.';
      setMessage(messageText);
      onError(error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      {/* Payment Method Selector */}
      <div className="payment-method-selector">
        <label>
          <input
            type="radio"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Credit/Debit Card
        </label>
        <label>
          <input
            type="radio"
            value="upi"
            checked={paymentMethod === 'upi'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          UPI
        </label>
      </div>

      {/* Card Payment Form */}
      {paymentMethod === 'card' && (
        <div className="card-element-container">
          <input
            type="text"
            placeholder="Card Number (e.g., 4242424242424242)"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="card-input"
            required
            maxLength="19"
          />
          <small className="card-help">
            Use test card: 4242 4242 4242 4242 (demo mode)
          </small>
        </div>
      )}

      {/* UPI Payment Form */}
      {paymentMethod === 'upi' && (
        <div className="upi-element-container">
          <input
            type="text"
            placeholder="Enter UPI ID (e.g., user@upi)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="upi-input"
            required
          />
          <small className="upi-help">
            Enter your UPI ID from apps like Google Pay, PhonePe, Paytm, etc.
          </small>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (paymentMethod === 'card' && !cardNumber) || (paymentMethod === 'upi' && !upiId)}
        className="payment-button"
      >
        {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
      </button>
      {message && <div className="payment-message">{message}</div>}
    </form>
  );
};

const PaymentProcessor = ({ amount, orderId, onSuccess, onError }) => {
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, loading, success, error

  const handleSuccess = () => {
    setPaymentStatus('success');
    onSuccess && onSuccess();
  };

  const handleError = (error) => {
    setPaymentStatus('error');
    onError && onError(error);
  };

  return (
    <div className="payment-processor">
      {paymentStatus === 'idle' && (
        <CheckoutForm
          amount={amount}
          orderId={orderId}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
      {paymentStatus === 'loading' && (
        <div className="payment-loading">
          <div className="spinner"></div>
          <p>Processing your gravity-defying transaction...</p>
        </div>
      )}
      {paymentStatus === 'success' && (
        <div className="payment-success">
          <h3>Payment Successful!</h3>
          <p>Your anti-gravity products are on their way.</p>
        </div>
      )}
      {paymentStatus === 'error' && (
        <div className="payment-error">
          <h3>Payment Failed</h3>
          <p>Please check your card details and try again.</p>
          <button onClick={() => setPaymentStatus('idle')}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessor;