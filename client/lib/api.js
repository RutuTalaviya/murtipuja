import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

/** Returns the persistent guest cart id, creating one if it doesn't exist yet. */
export function getGuestId() {
  if (typeof window === "undefined") return null;
  let guestId = localStorage.getItem("mp_guest_id");
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("mp_guest_id", guestId);
  }
  return guestId;
}

// Attach the JWT token (if present) to every request, and a guest cart id
// as a fallback so cart routes always have something to identify the cart with.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["x-guest-id"] = getGuestId();
  }
  return config;
});

export const sendOtp = (phone) => api.post("/api/auth/send-otp", { phone });
export const verifyOtp = (phone, otp) => api.post("/api/auth/verify-otp", { phone, otp });
export const getMe = () => api.get("/api/auth/me");
export const updateProfile = (data) => api.put("/api/auth/profile", data);


export const getCart = (couponCode) => api.get("/api/cart", { params: { couponCode } });
export const addToCart = (productId, variantSku, quantity = 1, couponCode) =>
  api.post("/api/cart/add", { productId, variantSku, quantity }, { params: { couponCode } });
export const updateCartItem = (itemId, quantity, couponCode) =>
  api.put(`/api/cart/item/${itemId}`, { quantity }, { params: { couponCode } });
export const removeCartItem = (itemId, couponCode) => api.delete(`/api/cart/item/${itemId}`, { params: { couponCode } });

// Orders & Returns
export const getMyOrders = () => api.get("/api/orders/my-orders");
export const getOrderById = (id) => api.get(`/api/orders/${id}`);
export const trackOrderPublic = (orderNumber, phone) => api.post("/api/orders/track-public", { orderNumber, phone });
export const submitReturnRequest = (id, payload) =>
  api.post(`/api/orders/${id}/return-request`, payload);

// Admin Control Panel
export const getAdminDashboard = () => api.get("/api/admin/dashboard");
export const getAdminOrders = () => api.get("/api/admin/orders");
export const confirmAllOrders = () => api.put("/api/admin/orders/confirm-all");
export const getAdminCombos = () => api.get("/api/admin/combos");
export const createAdminCombo = (data) => api.post("/api/admin/combos", data);
export const updateAdminCombo = (id, data) => api.put(`/api/admin/combos/${id}`, data);
export const updateOrderStatus = (id, payload) => {
  const data = typeof payload === "string" ? { status: payload } : payload;
  return api.put(`/api/orders/${id}/status`, data);
};
export const reviewReturnRequest = (id, status, unboxingVideoVerified) =>
  api.put(`/api/orders/${id}/return-request/review`, { status, unboxingVideoVerified });
export const deleteAdminCombo = (id) => api.delete(`/api/admin/combos/${id}`);
export const receiveReturnRequest = (id) =>
  api.put(`/api/orders/${id}/return-request/receive`);

// Offers, Combos & Coupons
export const getActiveCoupons = () => api.get("/api/admin/public/coupons");
export const getAdminCoupons = () => api.get("/api/admin/coupons");
export const createAdminCoupon = (data) => api.post("/api/admin/coupons", data);
export const updateAdminCoupon = (id, data) => api.put(`/api/admin/coupons/${id}`, data);
export const deleteAdminCoupon = (id) => api.delete(`/api/admin/coupons/${id}`);

export const getActiveOffers = () => api.get("/api/admin/public/offers");
export const getAdminOffers = () => api.get("/api/admin/offers");
export const createAdminOffer = (data) => api.post("/api/admin/offers", data);
export const updateAdminOffer = (id, data) => api.put(`/api/admin/offers/${id}`, data);
export const deleteAdminOffer = (id) => api.delete(`/api/admin/offers/${id}`);

// Shiprocket & Logistics Actions
export const syncOrderShipping = (id) => api.post(`/api/admin/orders/${id}/sync-shipping`);
export const pushOrderToShiprocket = (id) => api.post(`/api/admin/orders/${id}/push-shiprocket`);
export const generateShiprocketAwb = (id) => api.post(`/api/admin/orders/${id}/generate-awb`);
export const generateShiprocketLabel = (id) => api.post(`/api/admin/orders/${id}/generate-label`);

// Wishlist
export const toggleWishlist = (productId) => api.post("/api/auth/wishlist/toggle", { productId });

export const getCategories = (params) => api.get("/api/categories", { params });
export const createCategory = (data, slug) => {
  const payload = typeof data === "object" ? data : { name: data, slug };
  return api.post("/api/categories", payload);
};
export const updateCategory = (id, data) => api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/categories/${id}`);

export const getFinishes = () => api.get("/api/finishes");
export const createFinish = (name, slug, colorCode) => api.post("/api/finishes", { name, slug, colorCode });
export const updateFinish = (id, name, slug, colorCode) => api.put(`/api/finishes/${id}`, { name, slug, colorCode });
export const deleteFinish = (id) => api.delete(`/api/finishes/${id}`);

export const getProducts = (params) => api.get("/api/products", { params });
export const createProduct = (data) => api.post("/api/products", data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);

// Navigation Menu
export const getNavMenu = () => api.get("/api/nav-menu");
export const getAdminNavMenu = () => api.get("/api/admin/nav-menu");
export const createNavMenuItem = (data) => api.post("/api/admin/nav-menu", data);
export const updateNavMenuItem = (id, data) => api.put(`/api/admin/nav-menu/${id}`, data);
export const deleteNavMenuItem = (id) => api.delete(`/api/admin/nav-menu/${id}`);
export const reorderNavMenuItems = (items) => api.put("/api/admin/nav-menu/reorder", { items });

// Banners Management
export const getBanners = (params) => api.get("/api/banners", { params });
export const getAdminBanners = () => api.get("/api/admin/banners");
export const createBanner = (data) => api.post("/api/admin/banners", data);
export const updateBanner = (id, data) => api.put(`/api/admin/banners/${id}`, data);
export const deleteBanner = (id) => api.delete(`/api/admin/banners/${id}`);
export const reorderBanners = (items) => api.put("/api/admin/banners/reorder", { items });

// Video Reels Management
export const getVideos = () => api.get("/api/videos");
export const getAdminVideos = () => api.get("/api/admin/videos");
export const createVideo = (data) => api.post("/api/admin/videos", data);
export const updateVideo = (id, data) => api.put(`/api/admin/videos/${id}`, data);
export const deleteVideo = (id) => api.delete(`/api/admin/videos/${id}`);
export const reorderVideos = (items) => api.put("/api/admin/videos/reorder", { items });

export default api;


