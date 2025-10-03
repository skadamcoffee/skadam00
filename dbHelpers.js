// app/dbHelpers.js
import { collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Add a document
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

// Get all documents
export const getDocuments = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update document
export const updateDocument = async (collectionName, docId, data) => {
  await updateDoc(doc(db, collectionName, docId), data);
};

// Delete document
export const deleteDocument = async (collectionName, docId) => {
  await deleteDoc(doc(db, collectionName, docId));
};
