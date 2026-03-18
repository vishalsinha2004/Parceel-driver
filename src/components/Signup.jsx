import React, { useState } from 'react';
import api from '../api/axios';

const Signup = ({ onSignupSuccess }) => {
    const [formData, setFormData] = useState({
        username: '', password: '', email: '', phone_number: '', license_number: ''
    });

    const [files, setFiles] = useState({
        photo: null, aadhar_card: null, license_image: null
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            alert("✅ Application Submitted! Please wait for Admin approval.");
            onSignupSuccess(formData.username);
        } catch (error) {
            if (error.response && error.response.data) {
                const errData = error.response.data;
                if (errData.username) alert(`❌ Error: ${errData.username[0]}`);
                else if (errData.phone_number) alert(`❌ Error: Phone number - ${errData.phone_number[0]}`);
                else alert(`❌ Signup Failed:\n${JSON.stringify(errData, null, 2)}`);
            } else {
                alert("❌ Signup Failed: Cannot reach server.");
            }
        }
    };

    const inputClass = "w-full p-4 rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 transition-all font-medium text-zinc-900";
    const fileInputClass = "block w-full text-sm text-zinc-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-zinc-100 file:text-zinc-900 hover:file:bg-zinc-200 cursor-pointer";

    return (
       // FIXED: Changed min-h to h-[100dvh] and added overflow-y-auto
       <div className="h-[100dvh] overflow-y-auto w-full bg-zinc-50 py-8 px-4 md:py-12">
            <div className="max-w-md mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-zinc-100">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-zinc-900 italic tracking-tighter">P- Pilot Application</h2>
                    <p className="text-sm font-bold text-zinc-400 mt-1">Join the fleet today.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <input name="username" placeholder="Username" onChange={handleChange} required className={inputClass} />
                        <input name="email" placeholder="Email Address" type="email" onChange={handleChange} required className={inputClass} />
                        <input name="phone_number" placeholder="Phone Number" onChange={handleChange} required className={inputClass} />
                        <input name="password" placeholder="Create Password" type="password" onChange={handleChange} required className={inputClass} />
                        <input name="license_number" placeholder="License Number (Text)" onChange={handleChange} required className={inputClass} />
                    </div>

                    <div className="mt-8 mb-4 border-t border-zinc-100 pt-6">
                        <h4 className="font-black text-zinc-900 mb-4 uppercase tracking-wide text-sm">Required Documents</h4>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1">Profile Photo</label>
                                <input type="file" name="photo" accept="image/*" onChange={handleFileChange} required className={fileInputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1">Aadhar Card</label>
                                <input type="file" name="aadhar_card" accept="image/*" onChange={handleFileChange} required className={fileInputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1">Driving License</label>
                                <input type="file" name="license_image" accept="image/*" onChange={handleFileChange} required className={fileInputClass} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full p-4 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 active:scale-95 transition-all shadow-[0_8px_20px_rgba(220,38,38,0.25)] mt-6">
                        SUBMIT APPLICATION
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;