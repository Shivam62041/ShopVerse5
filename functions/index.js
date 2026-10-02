const functions = require('firebase-functions');
const admin = require('firebase-admin');

const stripeSecret = functions.config().stripe?.secret || process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.error('Stripe secret is not configured. Set firebase functions config or STRIPE_SECRET_KEY.');
}
const stripe = stripeSecret ? require('stripe')(stripeSecret) : null;

admin.initializeApp();

exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, orderId, paymentMethodType = 'card' } = data;

  if (!stripe) {
    throw new functions.https.HttpsError('failed-precondition', 'Stripe secret key is not configured on the backend.');
  }

  // Validate input
  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
  }

  try {
    // Configure payment intent for INR only
    const paymentIntentConfig = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'inr',
      metadata: {
        ...(orderId ? { orderId } : {}),
        userId: context.auth.uid,
        paymentMethodType
      }
    };

    // Add payment method types for UPI support
    if (paymentMethodType === 'upi') {
      paymentIntentConfig.payment_method_types = ['card', 'upi'];
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    // Store payment intent in Firestore for tracking
    await admin.firestore().collection('paymentIntents').doc(paymentIntent.id).set({
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      currency: 'inr',
      status: paymentIntent.status,
      orderId,
      userId: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', 'Payment processing failed');
  }
});

exports.confirmPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { paymentIntentId } = data;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Update order status in Firestore
    if (paymentIntent.status === 'succeeded') {
      const paymentDoc = await admin.firestore().collection('paymentIntents').doc(paymentIntentId).get();
      const { orderId } = paymentDoc.data();

      await admin.firestore().collection('orders').doc(orderId).update({
        status: 'paid',
        paymentIntentId,
        paidAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return { status: paymentIntent.status };
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw new functions.https.HttpsError('internal', 'Payment confirmation failed');
  }
});