const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Define the GST API endpoint and API key
const GST_API_ENDPOINT = 'https://example.com/api/gst';
const GST_API_KEY = 'YOUR_GST_API_KEY';

// Define the Cloud Function to process booking documents and calculate GST
exports.processBooking = functions.firestore
    .document('bookings/{bookingId}')
    .onUpdate(async (change, context) => {
        // Get the new and previous values of the booking document
        const newValue = change.after.data();
        const previousValue = change.before.data();

        // Check if the status field has changed to 'finished'
        if (newValue.status === 'finished' && previousValue.status !== 'finished') {
            // Extract relevant parameters from the booking document
            const bookingId = context.params.bookingId;
            const name = newValue.name;
            const totalAmount = newValue.totalBookingAmount;

            // Calculate GST based on the total booking amount
            const { igst, sgstCgst } = calculateGST(totalAmount);

            try {
                // Send data to GST API for automated filing
                const response = await axios.post(GST_API_ENDPOINT, {
                    bookingId,
                    name,
                    totalAmount,
                    igst,
                    sgstCgst,
                    apiKey: GST_API_KEY
                });

                // Log successful GST filing
                console.log('GST filed successfully:', response.data);
            } catch (error) {
                // Log errors if GST filing fails
                console.error('Error filing GST:', error);
            }
        }
    });

// Function to calculate IGST and SGST/CGST based on total amount
function calculateGST(totalAmount) {
    // Placeholder implementation for GST calculation logic
    const gstRate = 18; // Assuming a GST rate of 18%
    const igst = totalAmount * (gstRate / 100);
    const sgstCgst = igst / 2; // Assuming equal split for SGST and CGST

    return { igst, sgstCgst };
}
