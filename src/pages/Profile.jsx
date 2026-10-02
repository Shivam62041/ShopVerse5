/**
 * Profile.jsx — User profile management
 * 🔒 Protected route.
 */
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import "./Profile.css";

export default function Profile() {
  const { currentUser } = useAuth();
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function handleSave(e) {
    e.preventDefault();
    if (!displayName.trim() || displayName === currentUser?.displayName) return;

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(currentUser, { displayName: displayName.trim() });
      
      // 2. Update Firestore User Document
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { displayName: displayName.trim() });

      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const initials = displayName
    ? displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : currentUser?.email[0].toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="profile-info-top">
            <h1 className="profile-name">{currentUser?.displayName || "User"}</h1>
            <p className="profile-role">Customer Account</p>
          </div>
        </div>

        {message.text && (
          <div className={`profile-alert ${message.type}`}>
            {message.type === "success" ? "✓" : "⚠️"} {message.text}
          </div>
        )}

        <form className="profile-form" onSubmit={handleSave}>
          <div className="pf-section">
            <h2 className="pf-section-title">Personal Information</h2>
            
            <div className="pf-field">
              <label htmlFor="pf-name">Full Name</label>
              <input
                id="pf-name"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div className="pf-field">
              <label htmlFor="pf-email">Email Address</label>
              <input
                id="pf-email"
                type="email"
                value={currentUser?.email || ""}
                disabled
                title="Email cannot be changed"
              />
              <span className="pf-hint">Your email address is managed by your sign-in provider.</span>
            </div>
          </div>

          <div className="pf-actions">
            <button 
              type="submit" 
              className="pf-btn-save"
              disabled={saving || displayName === currentUser?.displayName}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
