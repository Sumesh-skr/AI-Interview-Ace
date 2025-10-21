
import * as admin from 'firebase-admin';

// This check prevents re-initializing the app in hot-reload scenarios.
if (!admin.apps.length) {
  try {
    // Directly initialize with service account components.
    // The private key is formatted using template literals to preserve newlines.
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'studio-3921090023-25f63',
        clientEmail: 'firebase-adminsdk-qpsm1@studio-3921090023-25f63.iam.gserviceaccount.com',
        privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCpE2C33y2oRPe3\nsh8fH/59C2p/N/+yC78jL1e0DHYBEpIsgZ3tKq3+pE1P9h5LzL9z9q3v5D3g8J7k\n5f1b5q2x6T4Q9X6s8q7b9z5G9H2f6y/2o9L9z8i7/z6a+3b8e/1n/u5b+s/yvY/v\nL+v/5X+c+4n/h/1v/P+y/r/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e\n/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T\n/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g\n/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H\n/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv\n/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e\n/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T\n/u/8H/e/4P+g/yv/T/u/8H/e/4P+g/yv/T/u/wIDAQABAoIBAQCWm3b4a2v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a\n+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b\n8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a\n+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b\n8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a\n+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b\n8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a\n+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b\n8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a\n+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b\n8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a\n+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b\n8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a+v9b8z/a\n-----END PRIVATE KEY-----\n`.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
