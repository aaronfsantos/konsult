/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";

// admin.initializeApp();
// const db = admin.firestore();

// Create a Firestore document when a user is created
// (uncomment to enable)
// Note: if you use the seed-users.js script to bulk create users, this will
// trigger for each user created.
// If you don't want that, comment this out and run the script.
// Alternatively, you can add a check to see if the doc already exists first.
// (e.g. if you only want to create docs for users created via Auth UI or API)
// To keep things simple, this example does not do that.
// exports.createUserDoc = functions.auth.user().onCreate(async (user) => {
//   await db.collection("users").doc(user.uid).set({
//     email: user.email || null,
//     fullName: user.displayName || "",
//     role: "employee", // default, can update later. "manager", "hr", "admin"
//     group: "SD",
//     department: "Custom Dev",
//     dateJoined: "2025-09-01",
//     status: "active",
//     onboardingComplete: false,
//     createdAt: admin.firestore.FieldValue.serverTimestamp(),
//   });
//   console.log(`Created Firestore doc for user: ${user.email}`);
// });


const functions = require("firebase-functions");
const { VertexAI } = require("@google-cloud/vertexai");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Init Vertex AI
const vertex = new VertexAI({
  project: process.env.GCLOUD_PROJECT,
  location: "asia-southeast1", // or your region
});

exports.parseOnboardingDoc = functions.https.onCall(async (data, context) => {
  const { content, project } = data;

  const model = vertex.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  Extract clear, actionable onboarding tasks from this documentation.
  Return as JSON array with fields: { title, description, priority }.

  File content:
  ${content}
  `;

  const response = await model.generateContent(prompt);
  const parsed = JSON.parse(
    response.response.candidates[0].content.parts[0].text
  );

  // Save to Firestore
  for (const task of parsed) {
    await db.collection("onboarding_tasks").add({
      title: task.title,
      description: task.description,
      project,
      priority: task.priority || "medium",
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  return { success: true, tasks: parsed };
});