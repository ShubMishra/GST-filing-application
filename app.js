const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios'); // For making HTTP requests

admin.initializeApp();
const firestore = admin.firestore();

// Retry configuration for GST API calls
const maxRetries = 3;
const retryDelay = 10000; // 10 seconds between retries

exports.generateInvoice = functions.firestore
  .document('bookings/{bookingId}')
  .onWrite(async (change, context) => {
    const bookingData = change.after.data();

    if (bookingData.status === 'finished') {
      const name = bookingData.name;
      const totalAmount = bookingData.totalBookingAmount;
      const items = bookingData.items || []; 

      // taken 18 % GST rate
      const gstRate = 0.18;
      const totalGST = totalAmount * gstRate;
      let igst, sgst, cgst;

      const igst = totalAmount * (gstRate / 100);
      const sgst =  igst / 2;
      const cgst = igst / 2; // Assuming equal split for SGST and CGST

      const invoiceData = {
        name,
        totalAmount,
        items,
        gst: {
          totalGST,
          igst, 
          sgst: sgst,
          cgst: cgst, 
        }
      };

      // GST API Integration 
      let response;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          response = await sendInvoiceToGSTAPI(invoiceData);
          break; // Exit loop on successful response
        } catch (error) {
          console.error(`Error generating invoice (attempt ${attempt}/${maxRetries})`, error);
          if (attempt === maxRetries) {
            throw error; // Re-throw error on last attempt
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }

      if (response.success) {
        console.log('Invoice generated successfully!');
        // Update booking status to "invoice generated" or similar
        await firestore.collection('bookings').doc(context.params.bookingId).update({
          status: 'invoice generated'
        });
      } else {
        console.error('Error generating invoice:', response.error);
        // Store error details for manual intervention
        await storeErrorDetails(context.params.bookingId, response.error);
      }
    }
  });


async function sendInvoiceToGSTAPI(invoiceData) {
  // This uses a placeholder URL and basic request structure
  const gstApiUrl = 'https://your-gst-api.com/invoices';
  const apiKey = 'your_api_key'; // to be replaced with actual API key

  try {
    const response = await axios.post(gstApiUrl, invoiceData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Store error details for manual intervention
async function storeErrorDetails(bookingId, error) {
  const errorData = {
    bookingId,
    errorMessage: error.message,
    errorStack: error.stack
  };
  
  console.error('Storing error details:', errorData);
}
