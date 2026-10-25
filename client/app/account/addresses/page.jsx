"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];

const INITIAL_FORM = {
  label: "Home",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "Gujarat",
  pincode: "",
  isDefault: false,
};

export default function SavedAddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    loadAddresses();
  }, [user, authLoading]);

  async function loadAddresses() {
    try {
      setLoading(true);
      const res = await getAddresses();
      setAddresses(res.data || []);
    } catch (err) {
      setError("Failed to load saved addresses.");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingAddressId(null);
    setFormData({
      ...INITIAL_FORM,
      isDefault: addresses.length === 0,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(addr) {
    setEditingAddressId(addr._id);
    setFormData({
      label: addr.label || "Home",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "Gujarat",
      pincode: addr.pincode || "",
      isDefault: Boolean(addr.isDefault),
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!formData.addressLine1.trim()) {
      setFormError("Street Address Line 1 is required.");
      return;
    }
    if (!formData.city.trim()) {
      setFormError("City is required.");
      return;
    }
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setFormError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setSaving(true);
    try {
      if (editingAddressId) {
        const res = await updateAddress(editingAddressId, formData);
        setAddresses(res.data.addresses || []);
        setSuccess("Address updated successfully.");
      } else {
        const res = await addAddress(formData);
        setAddresses(res.data.addresses || []);
        setSuccess("New address added successfully.");
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      const res = await deleteAddress(id);
      setAddresses(res.data.addresses || []);
      setSuccess("Address deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert("Failed to delete address.");
    }
  }

  async function handleSetDefault(id) {
    try {
      const res = await setDefaultAddress(id);
      setAddresses(res.data.addresses || []);
      setSuccess("Default address updated.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert("Failed to set default address.");
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center font-display">
        <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">
          Loading addresses...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-display">
        <h1 className="font-display text-2xl text-black font-extrabold uppercase tracking-wider mb-2">Access Denied</h1>
        <p className="text-neutral-500 text-xs font-semibold mb-6 uppercase tracking-wider">Please log in to manage your addresses.</p>
        <Link href="/login" className="bg-black hover:bg-gold hover:text-black text-white px-8 py-3.5 border-2 border-black text-xs font-extrabold uppercase tracking-widest transition-all">
          Login with OTP
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 md:px-8 lg:px-12 py-8 md:py-12 font-display w-full">
      <div className="w-full space-y-8">
        
        {/* Header & Tabs */}
        <div className="border-b-2 border-black pb-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">Account Settings</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-black font-extrabold uppercase tracking-wider">
                Saved Addresses
              </h1>
              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1.5">
                Manage your primary and alternate shipping destinations for 1-click checkout.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="bg-black hover:bg-gold hover:text-black text-white border-2 border-black px-6 py-3 text-xs font-extrabold uppercase tracking-widest transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
            >
              + Add New Address
            </button>
          </div>

          {/* Account Sub-Navigation Tabs */}
          <div className="flex gap-4 mt-6 border-t border-neutral-200 pt-4 text-xs font-black uppercase tracking-wider">
            <Link
              href="/account/orders"
              className="text-neutral-400 hover:text-black transition-colors pb-1"
            >
              My Orders
            </Link>
            <span className="text-black border-b-2 border-black pb-1">
              Saved Addresses ({addresses.length})
            </span>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <p className="text-red-600 text-xs font-bold bg-red-50 border border-red-200 p-3 uppercase tracking-wider">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-800 text-xs font-bold bg-green-50 border border-green-300 p-3 uppercase tracking-wider">
            ✓ {success}
          </p>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-none p-16 text-center border-2 border-black max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="text-5xl">📍</div>
            <h2 className="text-lg font-black uppercase tracking-wider text-black">No saved addresses yet</h2>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider leading-relaxed">
              Add your home or temple delivery address to save time during your next sacred purchase.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-block bg-black hover:bg-gold hover:text-black text-white px-8 py-3.5 border-2 border-black text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer"
            >
              Add First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`bg-white border-2 p-6 flex flex-col justify-between transition-all relative ${
                  addr.isDefault
                    ? "border-black shadow-md ring-1 ring-black/10"
                    : "border-neutral-300 hover:border-black"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="bg-neutral-100 text-black border border-neutral-300 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider">
                      {addr.label || "Home"}
                    </span>
                    {addr.isDefault && (
                      <span className="bg-gold text-black border border-black text-[9px] font-black px-2 py-0.5 uppercase tracking-widest">
                        Default Address
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-neutral-800 font-semibold space-y-1 leading-relaxed">
                    <p className="font-black text-black text-sm">{user.name || "Customer"}</p>
                    <p>{addr.addressLine1}</p>
                    {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                    <p>
                      {addr.city}, {addr.state} — <strong className="font-mono text-black">{addr.pincode}</strong>
                    </p>
                    <p className="text-[11px] text-neutral-500 font-bold uppercase">{addr.country || "India"}</p>
                    <p className="text-[11px] text-neutral-500 pt-1">Phone: +91 {user.phone}</p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="font-black text-black hover:text-gold uppercase tracking-wider underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id)}
                      className="font-black text-red-600 hover:text-red-700 uppercase tracking-wider underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-[10px] font-black text-neutral-500 hover:text-black border border-neutral-300 hover:border-black px-2.5 py-1 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit Address Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border-2 border-black max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b-2 border-black pb-3">
                <h3 className="font-display text-lg font-black uppercase tracking-wider text-black">
                  {editingAddressId ? "Edit Address" : "Add New Delivery Address"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-400 hover:text-black font-bold text-lg p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 p-2.5 uppercase tracking-wider">
                  {formError}
                </p>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 font-display">
                {/* Address Label Chips */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold block mb-1.5">
                    Address Type
                  </label>
                  <div className="flex gap-2">
                    {["Home", "Work", "Temple", "Other"].map((lbl) => (
                      <button
                        type="button"
                        key={lbl}
                        onClick={() => setFormData({ ...formData, label: lbl })}
                        className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                          formData.label === lbl
                            ? "bg-black text-white border-black"
                            : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Street Address Line 1 */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold block mb-1">
                    Flat / House No. / Building / Street *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    placeholder="e.g. 402, Shivalik Residency, Ring Road"
                    className="w-full border-2 border-black p-3 text-xs font-bold uppercase tracking-wider focus:outline-hidden"
                  />
                </div>

                {/* Street Address Line 2 */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold block mb-1">
                    Landmark / Area (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    placeholder="Near ISKCON Temple"
                    className="w-full border-2 border-black p-3 text-xs font-bold uppercase tracking-wider focus:outline-hidden"
                  />
                </div>

                {/* City & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Surat"
                      className="w-full border-2 border-black p-3 text-xs font-bold uppercase tracking-wider focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold block mb-1">
                      Pincode (6 Digits) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                      placeholder="395007"
                      className="w-full border-2 border-black p-3 text-xs font-mono font-bold tracking-widest focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* State Dropdown */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold block mb-1">
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full border-2 border-black p-3 text-xs font-bold uppercase tracking-wider focus:outline-hidden bg-white"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Address Checkbox */}
                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 accent-black rounded-none cursor-pointer"
                  />
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Make this my default shipping address
                  </span>
                </label>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-3 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border-2 border-neutral-300 hover:border-black text-black text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-black hover:bg-gold hover:text-black text-white text-xs font-black uppercase tracking-widest border-2 border-black transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {saving ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
