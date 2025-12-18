import { auth, db } from "../config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const createUser = async (user) => {
  if (!user) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }

    const newUser = {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
      Timesleft: 3,
      generationsList: [],
    };

    await setDoc(userRef, newUser);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
};

export const getUser = async (uid) => {
  if (!uid) return null;
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const updateGeneration = async (uid) => {
  if (!uid) return false;
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentTimesLeft = userData.Timesleft || 0;
      await setDoc(
        userRef,
        { Timesleft: currentTimesLeft - 1 },
        { merge: true }
      );
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating generation count:", error);
    return false;
  }
};

//get generations by genId
export const getGenerations = async (genId) => {
  if (!uid) return null;
  try {
    const generationsRef = doc(db, "generations", genId);
    const generationsSnap = await getDoc(generationsRef);
    if (generationsSnap.exists()) {
      return generationsSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching generations:", error);
    return null;
  }
};

//create a new generation
export const createGeneration = async (uid, videourl, imageurl) => {
  if (!uid || !generationData) return null;
  try {
    const generationRef = doc(db, "generations");
    const newGeneration = {
      video: videourl,
      generatedBy: uid,
      createdAt: serverTimestamp(),
      image: imageurl,
    };
    await setDoc(generationRef, newGeneration);
    return generationData;
  } catch (error) {
    console.error("Error creating generation:", error);
    return null;
  }
};
