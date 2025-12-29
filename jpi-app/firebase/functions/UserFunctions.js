import { auth, db } from "../config";
import { doc, getDoc, setDoc, serverTimestamp,collection, query, where, getDocs, addDoc  } from "firebase/firestore";

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
      Timesleft: 2,
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
export const getGenerations = async (uid) => {
  if (!uid) return [];

  try {
    const q = query(
      collection(db, "generations"),
      where("generatedBy", "==", uid)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching generations:", error);
    return [];
  }
};
//create a new generation
export const createGeneration = async (uid, videoUrl) => {
  if (!uid || !videoUrl) return;

  try {
    const generationData = {
      generatedBy: uid,
      video: videoUrl,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "generations"), generationData);
  } catch (error) {
    console.error("Error creating generation:", error);
    throw error;
  }
};
