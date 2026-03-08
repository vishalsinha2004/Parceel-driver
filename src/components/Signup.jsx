import React, { useState } from 'react';
import api from '../api/axios';

const Signup = ({ onSignupSuccess }) => {
    const [formData, setFormData] = useState({
        username: '', password: '', email: '', phone_number: '', license_number: ''
    });

    const [files, setFiles] = useState({
        photo: null, aadhar_card: null, license_image: null
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if files are selected
        if (!files.photo || !files.aadhar_card || !files.license_image) {
            alert("⚠️ Please upload all 3 documents.");
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        Object.keys(files).forEach(key => data.append(key, files[key]));

        try {
            await api.post('auth/signup/driver/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("✅ Signup Successful! Please wait for Admin approval.");
            onSignupSuccess(formData.username);
        } catch (error) {
            console.error("FULL ERROR:", error.response?.data);

            // --- FIX: Extract clean user-friendly error messages ---
            if (error.response && error.response.data) {
                const errData = error.response.data;
                
                // If Django tells us the username is taken, show just that text
                if (errData.username) {
                    alert(`❌ Error: ${errData.username[0]}`);
                } 
                else if (errData.phone_number) {
                    alert(`❌ Error: Phone number - ${errData.phone_number[0]}`);
                }
                // Fallback for other errors
                else {
                    alert(`❌ Signup Failed:\n${JSON.stringify(errData, null, 2)}`);
                }
            } else {
                alert("❌ Signup Failed: Cannot reach server.");
            }
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>🚖 Driver Registration</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                <input name="username" placeholder="Username" onChange={handleChange} required />
                <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
                <input name="phone_number" placeholder="Phone Number" onChange={handleChange} required />
                <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
                <input name="license_number" placeholder="License Number (Text)" onChange={handleChange} required />

                <h4>Upload Documents</h4>
                <label>Profile Photo:</label>
                <input type="file" name="photo" accept="image/*" onChange={handleFileChange} required />

                <label>Aadhar Card:</label>
                <input type="file" name="aadhar_card" accept="image/*" onChange={handleFileChange} required />

                <label>Driving License:</label>
                <input type="file" name="license_image" accept="image/*" onChange={handleFileChange} required />

                <button type="submit" style={{
                    marginTop: '10px', padding: '10px', background: 'black', color: 'white', border: 'none', cursor: 'pointer'
                }}>
                    Register & Upload
                </button>
            </form>
        </div>
    );
};

export default Signup;