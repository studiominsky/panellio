import * as admin from "firebase-admin";
import {onCall} from "firebase-functions/v2/https";
import {logger, https} from "firebase-functions";

admin.initializeApp();

export const validateUsername = onCall(
  {
    region: "europe-west3",
  },
  async (request) => {
    const username = request.data.username;

    if (!username || typeof username !== "string") {
      throw new https.HttpsError(
        "invalid-argument",
        "Invalid or missing \"username\" parameter."
      );
    }

    try {
      const db = admin.firestore();

      const querySnapshot = await db
        .collection("users")
        .where("username", "==", username)
        .get();

      if (!querySnapshot.empty) {
        return {available: false};
      }

      return {available: true};
    } catch (error) {
      logger.error("Error validating username:", error);

      throw new https.HttpsError(
        "internal",
        "An error occurred while validating the username." +
        " Please try again later."
      );
    }
  }
);

export const validateEmail = onCall(
  {
    region: "europe-west3",
  },
  async (request) => {
    const email = request.data.email;

    if (!email || typeof email !== "string") {
      throw new https.HttpsError(
        "invalid-argument",
        "Invalid or missing \"email\" parameter."
      );
    }

    try {
      const db = admin.firestore();

      const querySnapshot = await db
        .collection("users")
        .where("email", "==", email)
        .get();

      if (!querySnapshot.empty) {
        return {available: false};
      }

      return {available: true};
    } catch (error) {
      logger.error("Error validating email:", error);

      throw new https.HttpsError(
        "internal",
        "An error occurred while validating the email. " +
        "Please try again later."
      );
    }
  }
);
