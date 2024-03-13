# GST-filing-application
Automated GST Invoicing System Development using Firebase Firestore and Cloud Functions.


# Automated GST Invoicing System with Firebase Firestore and Cloud Functions
This Automated GST Invoicing System is built using Firebase Firestore and Cloud Functions. It automates the process of generating Goods and Services Tax (GST) invoices based on specific document field changes within a Firestore collection. The system integrates with an external GST API to file GST returns.

## System Components
Firestore Collection: The system uses a Firestore collection named bookings to store booking documents. Each document contains fields such as name, total booking amount, and status.

## Cloud Function: 
The Cloud Function generateInvoice is triggered when a document in the bookings collection is written (created or updated). It calculates GST based on the booking data and sends invoice details to the GST API for automated filing.

## GST API Integration: 
The system integrates with an external GST API to submit invoice data for GST filing. It handles retries with exponential backoff to ensure robustness.

## Installation and Setup
Clone the repository:

## bash
Copy code
git clone <repository-url>
Install dependencies:

bash
Copy code
cd automated-gst-invoicing
npm install
Set up Firebase project and Firestore:

Create a Firebase project on the Firebase Console.
Enable Firestore and create a Firestore collection named bookings.
Set environment variables:

Define the GST API endpoint and API key in the Cloud Function code.
Deploy Cloud Functions:

bash
Copy code
firebase deploy --only functions
Usage
Add booking documents to the Firestore collection bookings with the required fields (name, totalBookingAmount, status).
