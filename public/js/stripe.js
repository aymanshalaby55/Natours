/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  // get session from the server.
  const stripe = Stripe('pk_test_51Of7M7DUHuuBmb7n6yOETtN5qs8RfrDMcVonCqdJICxX232v4j6nT2TSlyEl3IlOXV9VfFBPBym8TICoGXzV1PQV00jFFuF0DQ');
  try {
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    // create checkout form + chargeback
    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    });

  } catch (err) {
    showAlert('error', err);
  }

};
