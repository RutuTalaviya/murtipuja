"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddComboButton({ combo, product }) {
  const { addItem, setCartDrawerOpen } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAddCombo() {
    setLoading(true);
    setSuccess(false);
    try {
      // 1. Add current product (using its first variant as default)
      const currentSku = product.variants?.[0]?.sku;
      if (!currentSku) throw new Error("No variants found for current product");
      await addItem(product._id, currentSku, 1);

      // 2. Add other products in the combo
      for (const op of combo.products) {
        if (op._id.toString() === product._id.toString()) continue;
        const otherSku = op.variants?.[0]?.sku;
        if (otherSku) {
          await addItem(op._id, otherSku, 1);
        }
      }

      setSuccess(true);
      setCartDrawerOpen(true);
    } catch (err) {
      console.error("Failed to add combo:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAddCombo}
      disabled={loading}
      className="w-full bg-maroon hover:bg-maroon-dark text-ivory text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
    >
      {loading ? (
        <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
      ) : success ? (
        "✓ Combo Added to Bag!"
      ) : (
        "Add Combo to Bag"
      )}
    </button>
  );
}
