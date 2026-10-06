"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import PagesCmsManager from "@/components/admin/PagesCmsManager";
import api, {
  getAdminDashboard,
  getAdminOrders,
  confirmAllOrders,
  updateOrderStatus,
  reviewReturnRequest,
  syncOrderShipping,
  pushOrderToShiprocket,
  generateShiprocketAwb,
  generateShiprocketLabel,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getFinishes,
  createFinish,
  updateFinish,
  deleteFinish,
  getProducts,
  getDeities,
  getProductTags,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getPurposes,
  createPurpose,
  updatePurpose,
  deletePurpose,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCombos,
  createAdminCombo,
  updateAdminCombo,
  deleteAdminCombo,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  getAdminOffers,
  createAdminOffer,
  updateAdminOffer,
  deleteAdminOffer,
  receiveReturnRequest,
  getAdminNavMenu,
  createNavMenuItem,
  updateNavMenuItem,
  deleteNavMenuItem,
  reorderNavMenuItems,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  getAdminVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  reorderVideos,
  formatImageUrl,
} from "@/lib/api";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Selected order for status update or return claim review
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [videoVerified, setVideoVerified] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "orders" | "claims" | "categories" | "products" | "combos" | "nav-menu" | "banners" | "videos"
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Tracking / AWB Shipping Modal State
  const [shippingModalOrder, setShippingModalOrder] = useState(null);
  const [shippingCourier, setShippingCourier] = useState("Delhivery");
  const [shippingCustomCourier, setShippingCustomCourier] = useState("");
  const [shippingAwb, setShippingAwb] = useState("");
  const [shippingStatus, setShippingStatus] = useState("shipped");
  const [shippingSaving, setShippingSaving] = useState(false);

  // Video Reels Management State
  const [videoReels, setVideoReels] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoTagline, setVideoTagline] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState("");
  const [videoBadge, setVideoBadge] = useState("4K REEL");
  const [videoProductLink, setVideoProductLink] = useState("/products");
  const [videoDuration, setVideoDuration] = useState("0:30");
  const [videoOrder, setVideoOrder] = useState("1");
  const [videoIsActive, setVideoIsActive] = useState(true);
  const [videoUploading, setVideoUploading] = useState(false);

  // Banner Management State
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerTagline, setBannerTagline] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerVideoUrl, setBannerVideoUrl] = useState("");
  const [bannerCtaText, setBannerCtaText] = useState("EXPLORE COLLECTION");
  const [bannerCtaLink, setBannerCtaLink] = useState("/shop");
  const [bannerSecCtaText, setBannerSecCtaText] = useState("VIEW ALL DEITIES");
  const [bannerSecCtaLink, setBannerSecCtaLink] = useState("/categories");
  const [bannerBadge, setBannerBadge] = useState("");
  const [bannerPosition, setBannerPosition] = useState("hero");
  const [bannerOrder, setBannerOrder] = useState("1");
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Navigation Menu Management State
  const [navMenuItems, setNavMenuItems] = useState([]);
  const [navLoading, setNavLoading] = useState(false);
  const [isAddingNavItem, setIsAddingNavItem] = useState(false);
  const [editingNavItem, setEditingNavItem] = useState(null);
  const [navTitle, setNavTitle] = useState("");
  const [navUrl, setNavUrl] = useState("");
  const [navOrder, setNavOrder] = useState("1");
  const [navBadge, setNavBadge] = useState("");
  const [navIsDropdown, setNavIsDropdown] = useState(false);
  const [navDropdownType, setNavDropdownType] = useState("custom");
  const [navIsActive, setNavIsActive] = useState(true);
  const [navSubItems, setNavSubItems] = useState([]);
  const [subTitle, setSubTitle] = useState("");
  const [subUrl, setSubUrl] = useState("");
  const [subBadge, setSubBadge] = useState("");
  const [subOrder, setSubOrder] = useState("1");

  // Combo Offers state
  const [combos, setCombos] = useState([]);
  const [comboLoading, setComboLoading] = useState(false);
  const [isAddingCombo, setIsAddingCombo] = useState(false);
  const [comboTitle, setComboTitle] = useState("");
  const [comboDesc, setComboDesc] = useState("");
  const [comboSelectedProds, setComboSelectedProds] = useState([]);
  const [comboDiscountType, setComboDiscountType] = useState("percentage");
  const [comboDiscountValue, setComboDiscountValue] = useState("");
  const [comboIsActive, setComboIsActive] = useState(true);

  // Coupon / Promo Code Management State
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscountType, setCouponDiscountType] = useState("percentage");
  const [couponDiscountValue, setCouponDiscountValue] = useState("");
  const [couponMinOrder, setCouponMinOrder] = useState("0");
  const [couponExpiry, setCouponExpiry] = useState("");
  const [couponUsageLimit, setCouponUsageLimit] = useState("");
  const [couponIsActive, setCouponIsActive] = useState(true);

  // Special / Automatic Offers State
  const [offers, setOffers] = useState([]);
  const [offerLoading, setOfferLoading] = useState(false);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerDiscountType, setOfferDiscountType] = useState("percentage");
  const [offerDiscountValue, setOfferDiscountValue] = useState("");
  const [offerMinOrder, setOfferMinOrder] = useState("0");
  const [offerDeity, setOfferDeity] = useState("");
  const [offerCategories, setOfferCategories] = useState([]);
  const [offerExpiry, setOfferExpiry] = useState("");
  const [offerIsActive, setOfferIsActive] = useState(true);

  // Category & Subcategory state
  const [categories, setCategories] = useState([]);
  const [categoryFormTab, setCategoryFormTab] = useState("main"); // "main" | "sub"
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatParent, setNewCatParent] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [catLoading, setCatLoading] = useState(false);

  // Finish state
  const [finishes, setFinishes] = useState([]);
  const [newFinishName, setNewFinishName] = useState("");
  const [newFinishSlug, setNewFinishSlug] = useState("");
  const [newFinishColor, setNewFinishColor] = useState("");
  const [editingFinish, setEditingFinish] = useState(null);
  const [finishLoading, setFinishLoading] = useState(false);

  // Product state
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deity, setDeity] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [selectedSubCatIds, setSelectedSubCatIds] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryVideos, setGalleryVideos] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [variantSize, setVariantSize] = useState("6 inch");
  const [variantFinish, setVariantFinish] = useState("Matte Black");
  const [variantStock, setVariantStock] = useState("10");
  const [variantSku, setVariantSku] = useState("");
  const [isOnSale, setIsOnSale] = useState(false);
  const [formVariants, setFormVariants] = useState([
    { size: "6 inch", finish: "Matte Black", price: "", discountPrice: "", stock: "10", sku: "", image: "", images: [] }
  ]);
  const [draggingVariantIndex, setDraggingVariantIndex] = useState(null);
  const [draggedImageInfo, setDraggedImageInfo] = useState(null); // { variantIndex, imageIndex }
  const [dragOverTarget, setDragOverTarget] = useState(null); // { variantIndex, imageIndex }
  // Product Details Accordion Tabs State
  const [productDetails, setProductDetails] = useState("");
  const [materialsAndCare, setMaterialsAndCare] = useState("");
  const [shippingReturns, setShippingReturns] = useState("");
  const [accordionSections, setAccordionSections] = useState([]);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");

  // Product Tags & Custom Badges State
  const [productTags, setProductTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableDeities, setAvailableDeities] = useState([
    "Ram",
    "Shiva",
    "Ganesh",
    "Krishna",
    "Hanuman",
    "Durga",
    "Laxmi",
    "Saraswati",
    "Vishnu",
    "Radha Krishna",
    "Khatu Shyam",
    "Balaji",
    "Mahadev",
  ]);
  const [customTagInput, setCustomTagInput] = useState("");

  // Tags Manager state in Categories & Tags Tab
  const [tagObjects, setTagObjects] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [newTagDesc, setNewTagDesc] = useState("");
  const [editingTag, setEditingTag] = useState(null);
  const [tagLoading, setTagLoading] = useState(false);

  // Occasions / Purposes state
  const [purposeObjects, setPurposeObjects] = useState([]);
  const [purposesList, setPurposesList] = useState([]);
  const [newPurposeName, setNewPurposeName] = useState("");
  const [newPurposeSlug, setNewPurposeSlug] = useState("");
  const [newPurposeDesc, setNewPurposeDesc] = useState("");
  const [editingPurpose, setEditingPurpose] = useState(null);
  const [purposeLoading, setPurposeLoading] = useState(false);

  // Quick Inline Category & Subcategory Creation in Product Modal
  const [quickCatOpen, setQuickCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState("");
  const [quickCatSlug, setQuickCatSlug] = useState("");
  const [quickCatDesc, setQuickCatDesc] = useState("");
  const [quickCatLoading, setQuickCatLoading] = useState(false);

  const [quickSubOpen, setQuickSubOpen] = useState(false);
  const [quickSubName, setQuickSubName] = useState("");
  const [quickSubSlug, setQuickSubSlug] = useState("");
  const [quickSubDesc, setQuickSubDesc] = useState("");
  const [quickSubParentId, setQuickSubParentId] = useState("");
  const [quickSubLoading, setQuickSubLoading] = useState(false);

  // Quick Inline Occasion Creation in Product Modal
  const [quickPurposeOpen, setQuickPurposeOpen] = useState(false);
  const [quickPurposeName, setQuickPurposeName] = useState("");
  const [quickPurposeSlug, setQuickPurposeSlug] = useState("");
  const [quickPurposeLoading, setQuickPurposeLoading] = useState(false);

  function fetchDashboardData() {
    setLoading(true);
    Promise.all([
      getAdminDashboard(),
      getAdminOrders(),
      getCategories(),
      getFinishes(),
      getProducts({ limit: 50 }),
      getAdminCombos(),
      getAdminCoupons(),
      getAdminOffers(),
      getAdminNavMenu(),
      getAdminBanners(),
      getAdminVideos(),
      getTags().catch(() => ({ data: [] })),
      getDeities().catch(() => ({ data: [] })),
      getPurposes().catch(() => ({ data: [] })),
    ])
      .then(([statsRes, ordersRes, catRes, finishRes, prodRes, comboRes, couponRes, offerRes, navRes, bannerRes, videoRes, tagsRes, deitiesRes, purposesRes]) => {
        setStats(statsRes.data);
        setOrders(ordersRes.data);
        setCategories(catRes.data || []);
        setFinishes(finishRes.data || []);
        setProducts(prodRes.data.products || []);
        setCombos(comboRes.data || []);
        setCoupons(couponRes.data || []);
        setOffers(offerRes.data || []);
        setNavMenuItems(navRes.data?.data || []);
        setBanners(bannerRes.data?.data || bannerRes.data || []);
        setVideoReels(videoRes.data?.data || videoRes.data || []);
        if (tagsRes?.data && Array.isArray(tagsRes.data) && tagsRes.data.length > 0) {
          setTagObjects(tagsRes.data);
          const names = tagsRes.data.map((t) => (typeof t === "string" ? t : t.name)).filter(Boolean);
          setAvailableTags(Array.from(new Set(names)));
        }
        if (deitiesRes?.data && Array.isArray(deitiesRes.data) && deitiesRes.data.length > 0) {
          setAvailableDeities(deitiesRes.data);
        }
        if (purposesRes?.data && Array.isArray(purposesRes.data) && purposesRes.data.length > 0) {
          setPurposeObjects(purposesRes.data);
          setPurposesList(purposesRes.data);
        }
      })
      .catch((err) => {
        setError("Failed to fetch admin dashboard data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [user, authLoading]);

  function openTrackingModal(order, defaultStatus) {
    setShippingModalOrder(order);
    setShippingStatus(defaultStatus || order.orderStatus || "shipped");
    setShippingAwb(order.trackingId || order.awbNumber || "");
    const existingCourier = order.courierPartner || "Delhivery";
    const COMMON_COURIERS = ["Delhivery", "BlueDart", "DTDC", "India Post (Speed Post)", "Maruti Courier", "Shadowfax", "Ekart", "Shiprocket"];
    if (COMMON_COURIERS.includes(existingCourier)) {
      setShippingCourier(existingCourier);
      setShippingCustomCourier("");
    } else {
      setShippingCourier("Other");
      setShippingCustomCourier(existingCourier);
    }
  }

  async function handleSaveTracking(e) {
    if (e) e.preventDefault();
    if (!shippingModalOrder) return;
    setActionError("");
    setShippingSaving(true);
    try {
      const finalCourier = shippingCourier === "Other" ? shippingCustomCourier.trim() : shippingCourier;
      const payload = {
        status: shippingStatus,
        trackingId: shippingAwb.trim(),
        awbNumber: shippingAwb.trim(),
        courierPartner: finalCourier,
      };
      const res = await updateOrderStatus(shippingModalOrder._id, payload);
      const updatedOrder = res.data;
      setOrders(orders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
      setShippingModalOrder(null);
      // Refresh dashboard analytics
      const statsRes = await getAdminDashboard();
      setStats(statsRes.data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update tracking details.");
    } finally {
      setShippingSaving(false);
    }
  }

  const [srLoadingId, setSrLoadingId] = useState(null);

  async function handlePushToShiprocket(orderId) {
    setActionError("");
    setActionSuccess("");
    setSrLoadingId(`push_${orderId}`);
    try {
      const res = await pushOrderToShiprocket(orderId);
      const updatedOrder = res.data.order;
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
      if (shippingModalOrder && shippingModalOrder._id === orderId) {
        setShippingModalOrder(updatedOrder);
      }
      setActionSuccess(res.data.message || "Order successfully synced to Shiprocket!");
      const statsRes = await getAdminDashboard();
      setStats(statsRes.data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to push order to Shiprocket.");
    } finally {
      setSrLoadingId(null);
    }
  }

  async function handleSyncShiprocket(orderId) {
    setActionError("");
    setActionSuccess("");
    setSrLoadingId(`sync_${orderId}`);
    try {
      const res = await syncOrderShipping(orderId);
      const updatedOrder = res.data.order;
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
      if (shippingModalOrder && shippingModalOrder._id === orderId) {
        setShippingModalOrder(updatedOrder);
        setShippingAwb(updatedOrder.awbNumber || updatedOrder.trackingId || "");
        setShippingStatus(updatedOrder.orderStatus || "shipped");
        if (updatedOrder.courierPartner) setShippingCourier(updatedOrder.courierPartner);
      }
      setActionSuccess(res.data.message || "Shipment tracking synced from Shiprocket!");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to sync shipment from Shiprocket.");
    } finally {
      setSrLoadingId(null);
    }
  }

  async function handleGenerateAwb(orderId) {
    setActionError("");
    setActionSuccess("");
    setSrLoadingId(`awb_${orderId}`);
    try {
      const res = await generateShiprocketAwb(orderId);
      const updatedOrder = res.data.order;
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
      if (shippingModalOrder && shippingModalOrder._id === orderId) {
        setShippingModalOrder(updatedOrder);
        setShippingAwb(updatedOrder.awbNumber || "");
        setShippingStatus("shipped");
        if (updatedOrder.courierPartner) setShippingCourier(updatedOrder.courierPartner);
      }
      setActionSuccess(res.data.message || "AWB generated successfully!");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to generate AWB via Shiprocket.");
    } finally {
      setSrLoadingId(null);
    }
  }

  async function handlePrintShiprocketLabel(orderId) {
    setActionError("");
    setActionSuccess("");
    setSrLoadingId(`label_${orderId}`);
    try {
      const res = await generateShiprocketLabel(orderId);
      if (res.data.labelUrl) {
        window.open(res.data.labelUrl, "_blank");
        setActionSuccess("Shiprocket Shipping Label opened in new tab!");
      } else {
        setActionError("Label URL not returned. Please check Shiprocket account.");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to generate Shiprocket label.");
    } finally {
      setSrLoadingId(null);
    }
  }

  // Handle status update
  async function handleStatusChange(orderId, newStatus) {
    const order = orders.find((o) => o._id === orderId);
    if (newStatus === "shipped" || newStatus === "out_for_delivery" || newStatus === "delivered") {
      if (order) {
        openTrackingModal(order, newStatus);
        return;
      }
    }
    setActionError("");
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: res.data.orderStatus, statusHistory: res.data.statusHistory } : o)));
      // Refresh dashboard analytics
      const statsRes = await getAdminDashboard();
      setStats(statsRes.data);
    } catch (err) {
      setActionError("Failed to update status. Please try again.");
    }
  }

  const [acceptAllLoading, setAcceptAllLoading] = useState(false);

  // Handle confirming all placed orders
  async function handleAcceptAllOrders() {
    if (!window.confirm("Are you sure you want to accept and confirm all placed orders?")) {
      return;
    }
    setActionError("");
    setAcceptAllLoading(true);
    try {
      await confirmAllOrders();
      // Fetch updated orders and stats
      const ordersRes = await getAdminOrders();
      setOrders(ordersRes.data);
      const statsRes = await getAdminDashboard();
      setStats(statsRes.data);
      alert("All placed orders have been confirmed successfully!");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to confirm all orders. Please try again.");
    } finally {
      setAcceptAllLoading(false);
    }
  }

  const [receiveLoading, setReceiveLoading] = useState(false);

  // Handle return request review (Approve/Reject)
  async function handleReturnReview(status) {
    if (!selectedOrder) return;
    setActionError("");

    if (status === "approved" && selectedOrder.returnRequest?.claimReasonType === "damage" && !videoVerified) {
      setActionError("You must verify that the unboxing video is valid before approving a damage-based claim.");
      return;
    }

    setReviewLoading(true);
    try {
      const res = await reviewReturnRequest(selectedOrder._id, status, videoVerified);
      setOrders(orders.map((o) => (o._id === selectedOrder._id ? res.data : o)));
      setSelectedOrder(res.data);
      setVideoVerified(false);

      // Refresh analytics
      const statsRes = await getAdminDashboard();
      setStats(statsRes.data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  }

  // Handle marking returning product as received at warehouse
  async function handleReturnReceive() {
    if (!selectedOrder) return;
    setActionError("");
    setReceiveLoading(true);
    try {
      const res = await receiveReturnRequest(selectedOrder._id);
      setOrders(orders.map((o) => (o._id === selectedOrder._id ? res.data : o)));
      setSelectedOrder(res.data);

      // Refresh analytics
      const statsRes = await getAdminDashboard();
      setStats(statsRes.data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to process returned items reception.");
    } finally {
      setReceiveLoading(false);
    }
  }

  function resetCategoryForm() {
    setEditingCategory(null);
    setNewCatName("");
    setNewCatSlug("");
    setNewCatParent("");
    setNewCatIcon("");
    setNewCatDesc("");
  }

  function handleEditCategory(cat) {
    setEditingCategory(cat);
    setNewCatName(cat.name || "");
    setNewCatSlug(cat.slug || "");
    const parentId = cat.parentCategory?._id || (typeof cat.parentCategory === "string" ? cat.parentCategory : "");
    setNewCatParent(parentId);
    setNewCatIcon(cat.icon || "");
    setNewCatDesc(cat.description || "");
    setCategoryFormTab(parentId ? "sub" : "main");
  }

  function handleQuickAddSubcategory(parentCatId) {
    resetCategoryForm();
    setNewCatParent(parentCatId);
    setCategoryFormTab("sub");
  }

  // Handle category creation or update
  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!newCatName) return;

    if (categoryFormTab === "sub" && !newCatParent) {
      setActionError("Please select a parent category for this subcategory.");
      return;
    }

    setActionError("");
    setCatLoading(true);
    try {
      const payload = {
        name: newCatName.trim(),
        slug: newCatSlug.trim(),
        parentCategory: categoryFormTab === "sub" && newCatParent && newCatParent !== "null" ? newCatParent : null,
        icon: newCatIcon.trim(),
        description: newCatDesc.trim(),
      };

      if (editingCategory) {
        const res = await updateCategory(editingCategory._id, payload);
        setCategories(categories.map((c) => (c._id === editingCategory._id ? res.data : c)));
      } else {
        const res = await createCategory(payload);
        setCategories([...categories, res.data]);
      }
      resetCategoryForm();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save category.");
    } finally {
      setCatLoading(false);
    }
  }

  // Handle category deletion
  async function handleDeleteCategory(id) {
    if (!window.confirm("Are you sure you want to delete this category/subcategory?")) return;
    setActionError("");
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
      if (editingCategory?._id === id) resetCategoryForm();
    } catch (err) {
      setActionError("Failed to delete category.");
    }
  }

  // Tag Form Reset
  function resetTagForm() {
    setNewTagName("");
    setNewTagSlug("");
    setNewTagDesc("");
    setEditingTag(null);
  }

  // Handle Tag creation or update
  async function handleCreateOrUpdateTag(e) {
    if (e) e.preventDefault();
    if (!newTagName.trim()) return;
    setActionError("");
    setTagLoading(true);
    try {
      const generatedSlug =
        newTagSlug.trim() ||
        newTagName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const payload = {
        name: newTagName.trim(),
        slug: generatedSlug,
        description: newTagDesc.trim(),
      };

      if (editingTag && editingTag._id && !editingTag._id.startsWith("prod-tag-")) {
        const res = await updateTag(editingTag._id, payload);
        const updated = res.data;
        setTagObjects((prev) => prev.map((t) => (t._id === editingTag._id ? updated : t)));
        setAvailableTags((prev) => prev.map((t) => (t === editingTag.name ? updated.name : t)));
        setActionSuccess(`Tag "${updated.name}" updated successfully!`);
      } else {
        const res = await createTag(payload);
        const created = res.data;
        setTagObjects((prev) => [...prev.filter((t) => t.name.toLowerCase() !== created.name.toLowerCase()), created]);
        if (!availableTags.includes(created.name)) {
          setAvailableTags((prev) => [...prev, created.name]);
        }
        setActionSuccess(`Tag "${created.name}" created successfully!`);
      }
      setTimeout(() => setActionSuccess(""), 3500);
      resetTagForm();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save tag.");
    } finally {
      setTagLoading(false);
    }
  }

  // Handle Tag deletion
  async function handleDeleteTag(tagItem) {
    if (!window.confirm(`Are you sure you want to delete tag "${tagItem.name}"?`)) return;
    setActionError("");
    try {
      if (tagItem._id && !tagItem._id.startsWith("prod-tag-")) {
        await deleteTag(tagItem._id);
      }
      setTagObjects((prev) => prev.filter((t) => t.name !== tagItem.name));
      setAvailableTags((prev) => prev.filter((t) => t !== tagItem.name));
      setProductTags((prev) => prev.filter((t) => t !== tagItem.name));
      setActionSuccess(`Tag "${tagItem.name}" deleted.`);
      setTimeout(() => setActionSuccess(""), 3500);
    } catch (err) {
      setActionError("Failed to delete tag.");
    }
  }

  function handleEditTag(tagItem) {
    setEditingTag(tagItem);
    setNewTagName(tagItem.name || "");
    setNewTagSlug(tagItem.slug || "");
    setNewTagDesc(tagItem.description || "");
    setCategoryFormTab("tag");
  }

  // Occasion / Purpose Form Reset & Handlers
  function resetPurposeForm() {
    setNewPurposeName("");
    setNewPurposeSlug("");
    setNewPurposeDesc("");
    setEditingPurpose(null);
  }

  // Handle Occasion / Purpose creation or update
  async function handleCreateOrUpdatePurpose(e) {
    if (e) e.preventDefault();
    if (!newPurposeName.trim()) return;
    setActionError("");
    setPurposeLoading(true);
    try {
      const generatedSlug =
        newPurposeSlug.trim() ||
        newPurposeName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const payload = {
        name: newPurposeName.trim(),
        slug: generatedSlug,
        description: newPurposeDesc.trim(),
      };

      if (editingPurpose && editingPurpose._id && !editingPurpose._id.startsWith("prod-purpose-")) {
        const res = await updatePurpose(editingPurpose._id, payload);
        const updated = res.data;
        setPurposeObjects((prev) => prev.map((p) => (p._id === editingPurpose._id ? updated : p)));
        setPurposesList((prev) => prev.map((p) => (p._id === editingPurpose._id ? updated : p)));
        setActionSuccess(`Occasion "${updated.name}" updated successfully!`);
      } else {
        const res = await createPurpose(payload);
        const created = res.data;
        setPurposeObjects((prev) => [...prev.filter((p) => (p.slug || p.name).toLowerCase() !== (created.slug || created.name).toLowerCase()), created]);
        setPurposesList((prev) => [...prev.filter((p) => (p.slug || p.name).toLowerCase() !== (created.slug || created.name).toLowerCase()), created]);
        setActionSuccess(`Occasion "${created.name}" created successfully!`);
      }
      setTimeout(() => setActionSuccess(""), 3500);
      resetPurposeForm();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save occasion / purpose.");
    } finally {
      setPurposeLoading(false);
    }
  }

  // Handle Occasion / Purpose deletion
  async function handleDeletePurpose(purposeItem) {
    if (!window.confirm(`Are you sure you want to delete occasion "${purposeItem.name}"?`)) return;
    setActionError("");
    try {
      if (purposeItem._id && !purposeItem._id.startsWith("prod-purpose-")) {
        await deletePurpose(purposeItem._id);
      }
      setPurposeObjects((prev) => prev.filter((p) => p.name !== purposeItem.name && p.slug !== purposeItem.slug));
      setPurposesList((prev) => prev.filter((p) => p.name !== purposeItem.name && p.slug !== purposeItem.slug));
      setPurposes((prev) => prev.filter((p) => p !== purposeItem.slug && p !== purposeItem.name));
      setActionSuccess(`Occasion "${purposeItem.name}" deleted.`);
      setTimeout(() => setActionSuccess(""), 3500);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete occasion.");
    }
  }

  function handleEditPurpose(purposeItem) {
    setEditingPurpose(purposeItem);
    setNewPurposeName(purposeItem.name || "");
    setNewPurposeSlug(purposeItem.slug || "");
    setNewPurposeDesc(purposeItem.description || "");
    setCategoryFormTab("purpose");
  }

  // Quick create occasion directly inside product modal
  async function handleQuickCreatePurpose(e) {
    if (e) e.preventDefault();
    if (!quickPurposeName.trim()) {
      setActionError("Please enter an occasion name.");
      return;
    }
    setQuickPurposeLoading(true);
    setActionError("");
    try {
      const slug =
        quickPurposeSlug.trim() ||
        quickPurposeName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const res = await createPurpose({
        name: quickPurposeName.trim(),
        slug,
      });

      const newPurpose = res.data;
      setPurposeObjects((prev) => [...prev.filter((p) => (p.slug || p.name).toLowerCase() !== (newPurpose.slug || newPurpose.name).toLowerCase()), newPurpose]);
      setPurposesList((prev) => [...prev.filter((p) => (p.slug || p.name).toLowerCase() !== (newPurpose.slug || newPurpose.name).toLowerCase()), newPurpose]);
      if (!purposes.includes(newPurpose.slug)) {
        setPurposes((prev) => [...prev, newPurpose.slug]);
      }
      setQuickPurposeName("");
      setQuickPurposeSlug("");
      setQuickPurposeOpen(false);
      setActionSuccess(`Occasion "${newPurpose.name}" created and assigned!`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to create occasion.");
    } finally {
      setQuickPurposeLoading(false);
    }
  }

  // Handle finish creation or update
  async function handleCreateFinish(e) {
    e.preventDefault();
    if (!newFinishName || !newFinishSlug) return;
    setActionError("");
    setFinishLoading(true);
    try {
      if (editingFinish) {
        // Update flow
        const res = await updateFinish(editingFinish._id, newFinishName, newFinishSlug, newFinishColor);
        setFinishes(finishes.map((f) => (f._id === editingFinish._id ? res.data : f)));
        setEditingFinish(null);
      } else {
        // Create flow
        const res = await createFinish(newFinishName, newFinishSlug, newFinishColor);
        setFinishes([...finishes, res.data]);
      }
      setNewFinishName("");
      setNewFinishSlug("");
      setNewFinishColor("");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save finish.");
    } finally {
      setFinishLoading(false);
    }
  }

  // Populate form with finish values for edit
  function handleEditFinish(f) {
    setEditingFinish(f);
    setNewFinishName(f.name);
    setNewFinishSlug(f.slug);
    setNewFinishColor(f.colorCode || "");
  }

  // Handle finish deletion
  async function handleDeleteFinish(id) {
    if (!window.confirm("Are you sure you want to delete this finish?")) return;
    setActionError("");
    try {
      await deleteFinish(id);
      setFinishes(finishes.filter((f) => f._id !== id));
    } catch (err) {
      setActionError("Failed to delete finish.");
    }
  }

  // Handle combo creation
  async function handleCreateCombo(e) {
    e.preventDefault();
    if (!comboTitle || comboSelectedProds.length < 2 || !comboDiscountValue) {
      setActionError("Please fill out all fields. A combo must contain at least 2 products.");
      return;
    }
    setActionError("");
    setComboLoading(true);
    try {
      const payload = {
        title: comboTitle,
        description: comboDesc,
        products: comboSelectedProds,
        discountType: comboDiscountType,
        discountValue: Number(comboDiscountValue),
        isActive: comboIsActive,
      };
      await createAdminCombo(payload);
      const combosRes = await getAdminCombos();
      setCombos(combosRes.data || []);

      // Reset form
      setComboTitle("");
      setComboDesc("");
      setComboSelectedProds([]);
      setComboDiscountType("percentage");
      setComboDiscountValue("");
      setComboIsActive(true);
      setIsAddingCombo(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to create combo offer.");
    } finally {
      setComboLoading(false);
    }
  }

  // Handle combo toggle status
  async function handleToggleCombo(combo) {
    setActionError("");
    const isExpired = combo.expiryDate && new Date(combo.expiryDate) < new Date();
    if (isExpired && !combo.isActive) {
      setActionError(`Combo offer '${combo.title}' has expired. Please edit and extend its expiry date first.`);
      return;
    }
    try {
      const res = await updateAdminCombo(combo._id, { isActive: !combo.isActive });
      setCombos(combos.map((c) => (c._id === combo._id ? { ...c, isActive: res.data.isActive } : c)));
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update combo status.");
    }
  }

  // Handle combo deletion
  async function handleDeleteCombo(id) {
    if (!window.confirm("Are you sure you want to delete this combo offer?")) return;
    setActionError("");
    try {
      await deleteAdminCombo(id);
      setCombos(combos.filter((c) => c._id !== id));
    } catch (err) {
      setActionError("Failed to delete combo offer.");
    }
  }

  // Coupon Helper Handlers
  function resetCouponForm() {
    setCouponCode("");
    setCouponDiscountType("percentage");
    setCouponDiscountValue("");
    setCouponMinOrder("0");
    setCouponExpiry("");
    setCouponUsageLimit("");
    setCouponIsActive(true);
    setEditingCoupon(null);
    setIsAddingCoupon(false);
  }

  function handleEditCoupon(c) {
    setEditingCoupon(c);
    setCouponCode(c.code || "");
    setCouponDiscountType(c.discountType || "percentage");
    setCouponDiscountValue(c.discountValue?.toString() || "");
    setCouponMinOrder(c.minOrderValue?.toString() || "0");
    setCouponExpiry(c.expiryDate ? new Date(c.expiryDate).toISOString().split("T")[0] : "");
    setCouponUsageLimit(c.usageLimit !== null && c.usageLimit !== undefined ? c.usageLimit.toString() : "");
    setCouponIsActive(c.isActive !== undefined ? c.isActive : true);
    setIsAddingCoupon(true);
  }

  async function handleSaveCoupon(e) {
    e.preventDefault();
    if (!couponCode.trim() || !couponDiscountValue) {
      setActionError("Coupon Code and Discount Value are required.");
      return;
    }
    setActionError("");
    setCouponLoading(true);

    const payload = {
      code: couponCode.trim().toUpperCase(),
      discountType: couponDiscountType,
      discountValue: Number(couponDiscountValue),
      minOrderValue: Number(couponMinOrder) || 0,
      expiryDate: couponExpiry ? new Date(couponExpiry) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: couponUsageLimit ? Number(couponUsageLimit) : null,
      isActive: couponIsActive,
    };

    try {
      if (editingCoupon) {
        const res = await updateAdminCoupon(editingCoupon._id, payload);
        setCoupons(coupons.map((c) => (c._id === editingCoupon._id ? res.data : c)));
      } else {
        const res = await createAdminCoupon(payload);
        setCoupons([res.data, ...coupons]);
      }
      resetCouponForm();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save coupon.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleToggleCoupon(coupon) {
    setActionError("");
    const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
    if (isExpired && !coupon.isActive) {
      setActionError(`Coupon code '${coupon.code}' has expired. Please edit and extend its expiry date first.`);
      return;
    }
    try {
      const res = await updateAdminCoupon(coupon._id, { isActive: !coupon.isActive });
      setCoupons(coupons.map((c) => (c._id === coupon._id ? res.data : c)));
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update coupon status.");
    }
  }

  async function handleDeleteCoupon(id) {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    setActionError("");
    try {
      await deleteAdminCoupon(id);
      setCoupons(coupons.filter((c) => c._id !== id));
    } catch (err) {
      setActionError("Failed to delete coupon.");
    }
  }

  // Offer Helper Handlers
  function resetOfferForm() {
    setOfferTitle("");
    setOfferDesc("");
    setOfferDiscountType("percentage");
    setOfferDiscountValue("");
    setOfferMinOrder("0");
    setOfferDeity("");
    setOfferCategories([]);
    setOfferExpiry("");
    setOfferIsActive(true);
    setEditingOffer(null);
    setIsAddingOffer(false);
  }

  function handleEditOffer(o) {
    setEditingOffer(o);
    setOfferTitle(o.title || "");
    setOfferDesc(o.description || "");
    setOfferDiscountType(o.discountType || "percentage");
    setOfferDiscountValue(o.discountValue?.toString() || "");
    setOfferMinOrder(o.minOrderValue?.toString() || "0");
    setOfferDeity(o.applicableDeity || "");
    setOfferCategories(o.applicableCategory ? o.applicableCategory.map(c => typeof c === "object" ? c._id : c) : []);
    setOfferExpiry(o.expiryDate ? new Date(o.expiryDate).toISOString().split("T")[0] : "");
    setOfferIsActive(o.isActive !== undefined ? o.isActive : true);
    setIsAddingOffer(true);
  }

  async function handleSaveOffer(e) {
    e.preventDefault();
    if (!offerTitle.trim() || !offerDiscountValue) {
      setActionError("Offer Title and Discount Value are required.");
      return;
    }
    setActionError("");
    setOfferLoading(true);

    const payload = {
      title: offerTitle.trim(),
      description: offerDesc.trim(),
      discountType: offerDiscountType,
      discountValue: Number(offerDiscountValue),
      minOrderValue: Number(offerMinOrder) || 0,
      applicableCategory: offerCategories,
      applicableDeity: offerDeity.trim(),
      expiryDate: offerExpiry ? new Date(offerExpiry) : null,
      isActive: offerIsActive,
    };

    try {
      if (editingOffer) {
        const res = await updateAdminOffer(editingOffer._id, payload);
        const offersRes = await getAdminOffers();
        setOffers(offersRes.data || []);
      } else {
        const res = await createAdminOffer(payload);
        const offersRes = await getAdminOffers();
        setOffers(offersRes.data || []);
      }
      resetOfferForm();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save offer.");
    } finally {
      setOfferLoading(false);
    }
  }

  async function handleToggleOffer(offer) {
    setActionError("");
    const isExpired = offer.expiryDate && new Date(offer.expiryDate) < new Date();
    if (isExpired && !offer.isActive) {
      setActionError(`Special offer '${offer.title}' has expired. Please edit and extend its expiry date first.`);
      return;
    }
    try {
      const res = await updateAdminOffer(offer._id, { isActive: !offer.isActive });
      const offersRes = await getAdminOffers();
      setOffers(offersRes.data || []);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update offer status.");
    }
  }

  async function handleDeleteOffer(id) {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    setActionError("");
    try {
      await deleteAdminOffer(id);
      setOffers(offers.filter((o) => o._id !== id));
    } catch (err) {
      setActionError("Failed to delete offer.");
    }
  }

  // Navigation Menu Helper Handlers
  function resetNavForm() {
    setNavTitle("");
    setNavUrl("");
    setNavOrder((navMenuItems.length + 1).toString());
    setNavBadge("");
    setNavIsDropdown(false);
    setNavDropdownType("custom");
    setNavIsActive(true);
    setNavSubItems([]);
    setSubTitle("");
    setSubUrl("");
    setSubBadge("");
    setSubOrder("1");
    setEditingNavItem(null);
    setIsAddingNavItem(false);
  }

  function handleEditNavItem(item) {
    setEditingNavItem(item);
    setNavTitle(item.title || "");
    setNavUrl(item.url || "");
    setNavOrder(item.order?.toString() || "1");
    setNavBadge(item.badge || "");
    setNavIsDropdown(Boolean(item.isDropdown));
    setNavDropdownType(item.dropdownType || "custom");
    setNavIsActive(item.isActive !== undefined ? item.isActive : true);
    setNavSubItems(item.subItems ? [...item.subItems] : []);
    setIsAddingNavItem(true);
  }

  function handleAddSubItem() {
    if (!subTitle.trim() || !subUrl.trim()) {
      setActionError("Sub-menu item requires both Title and URL.");
      return;
    }
    setActionError("");
    setNavSubItems([
      ...navSubItems,
      {
        title: subTitle.trim(),
        url: subUrl.trim(),
        badge: subBadge.trim(),
        order: Number(subOrder) || navSubItems.length + 1,
        isActive: true,
      },
    ]);
    setSubTitle("");
    setSubUrl("");
    setSubBadge("");
    setSubOrder((navSubItems.length + 2).toString());
  }

  function handleRemoveSubItem(index) {
    setNavSubItems(navSubItems.filter((_, i) => i !== index));
  }

  async function handleSaveNavItem(e) {
    e.preventDefault();
    if (!navTitle.trim()) {
      setActionError("Navigation Title is required.");
      return;
    }
    setActionError("");
    setNavLoading(true);

    const payload = {
      title: navTitle.trim(),
      url: navUrl.trim(),
      order: Number(navOrder) || 0,
      badge: navBadge.trim(),
      isDropdown: navIsDropdown,
      dropdownType: navDropdownType,
      subItems: navSubItems,
      isActive: navIsActive,
    };

    try {
      if (editingNavItem) {
        const res = await updateNavMenuItem(editingNavItem._id, payload);
        setNavMenuItems(navMenuItems.map((item) => (item._id === editingNavItem._id ? res.data.data : item)));
      } else {
        const res = await createNavMenuItem(payload);
        setNavMenuItems([...navMenuItems, res.data.data]);
      }
      resetNavForm();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save navigation item.");
    } finally {
      setNavLoading(false);
    }
  }

  async function handleToggleNavItemActive(item) {
    setActionError("");
    try {
      const res = await updateNavMenuItem(item._id, { ...item, isActive: !item.isActive });
      setNavMenuItems(navMenuItems.map((n) => (n._id === item._id ? res.data.data : n)));
    } catch (err) {
      setActionError("Failed to toggle navigation status.");
    }
  }

  async function handleDeleteNavItem(id) {
    if (!window.confirm("Are you sure you want to delete this navigation item?")) return;
    setActionError("");
    try {
      await deleteNavMenuItem(id);
      setNavMenuItems(navMenuItems.filter((item) => item._id !== id));
    } catch (err) {
      setActionError("Failed to delete navigation item.");
    }
  }

  // Banner Management Helpers
  function resetBannerForm() {
    setBannerTagline("");
    setBannerTitle("");
    setBannerSubtitle("");
    setBannerImageUrl("");
    setBannerVideoUrl("");
    setBannerCtaText("EXPLORE COLLECTION");
    setBannerCtaLink("/shop");
    setBannerSecCtaText("VIEW ALL DEITIES");
    setBannerSecCtaLink("/categories");
    setBannerBadge("");
    setBannerPosition("hero");
    setBannerOrder((banners.length + 1).toString());
    setBannerIsActive(true);
    setEditingBanner(null);
    setIsAddingBanner(false);
  }

  function handleEditBanner(banner) {
    setEditingBanner(banner);
    setBannerTagline(banner.tagline || "");
    setBannerTitle(banner.title || "");
    setBannerSubtitle(banner.subtitle || "");
    setBannerImageUrl(banner.imageUrl || "");
    setBannerVideoUrl(banner.videoUrl || "");
    setBannerCtaText(banner.ctaText || "EXPLORE COLLECTION");
    setBannerCtaLink(banner.ctaLink || "/shop");
    setBannerSecCtaText(banner.secondaryCtaText || "");
    setBannerSecCtaLink(banner.secondaryCtaLink || "");
    setBannerBadge(banner.badge || "");
    setBannerPosition(banner.position || "hero");
    setBannerOrder(banner.order?.toString() || "1");
    setBannerIsActive(banner.isActive !== undefined ? banner.isActive : true);
    setIsAddingBanner(true);
  }

  async function handleSaveBanner(e) {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImageUrl.trim()) {
      setActionError("Banner Title and Image are required.");
      return;
    }
    setActionError("");
    setBannerLoading(true);

    const payload = {
      tagline: bannerTagline.trim(),
      title: bannerTitle.trim(),
      subtitle: bannerSubtitle.trim(),
      imageUrl: bannerImageUrl.trim(),
      videoUrl: bannerVideoUrl.trim(),
      ctaText: bannerCtaText.trim() || "EXPLORE COLLECTION",
      ctaLink: bannerCtaLink.trim() || "/shop",
      secondaryCtaText: bannerSecCtaText.trim(),
      secondaryCtaLink: bannerSecCtaLink.trim(),
      badge: bannerBadge.trim(),
      position: bannerPosition || "hero",
      order: Number(bannerOrder) || 0,
      isActive: bannerIsActive,
    };

    try {
      if (editingBanner) {
        const res = await updateBanner(editingBanner._id, payload);
        const updated = res.data?.data || res.data;
        setBanners(banners.map((b) => (b._id === editingBanner._id ? updated : b)));
      } else {
        const res = await createBanner(payload);
        const created = res.data?.data || res.data;
        setBanners([...banners, created]);
      }
      resetBannerForm();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save banner.");
    } finally {
      setBannerLoading(false);
    }
  }

  async function handleToggleBannerActive(banner) {
    setActionError("");
    try {
      const res = await updateBanner(banner._id, { isActive: !banner.isActive });
      const updated = res.data?.data || res.data;
      setBanners(banners.map((b) => (b._id === banner._id ? updated : b)));
    } catch (err) {
      setActionError("Failed to update banner active status.");
    }
  }

  async function handleDeleteBanner(id) {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    setActionError("");
    try {
      await deleteBanner(id);
      setBanners(banners.filter((b) => b._id !== id));
    } catch (err) {
      setActionError("Failed to delete banner.");
    }
  }

  async function handleMoveBanner(index, direction) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    const reorderedItems = newBanners.map((b, idx) => ({
      id: b._id,
      order: idx + 1,
    }));

    setBanners(newBanners.map((b, idx) => ({ ...b, order: idx + 1 })));

    try {
      await reorderBanners(reorderedItems);
    } catch (err) {
      setActionError("Failed to persist banner reordering.");
      const bannerRes = await getAdminBanners();
      setBanners(bannerRes.data?.data || bannerRes.data || []);
    }
  }

  // Video Reels Management Helpers
  function resetVideoForm() {
    setVideoTitle("");
    setVideoTagline("");
    setVideoUrl("");
    setVideoThumbnailUrl("");
    setVideoBadge("4K REEL");
    setVideoProductLink("/products");
    setVideoDuration("0:30");
    setVideoOrder((videoReels.length + 1).toString());
    setVideoIsActive(true);
    setEditingVideo(null);
    setIsAddingVideo(false);
  }

  function handleEditVideo(video) {
    setEditingVideo(video);
    setVideoTitle(video.title || "");
    setVideoTagline(video.tagline || "");
    setVideoUrl(video.videoUrl || "");
    setVideoThumbnailUrl(video.thumbnailUrl || "");
    setVideoBadge(video.badge || "4K REEL");
    setVideoProductLink(video.productLink || "/products");
    setVideoDuration(video.duration || "0:30");
    setVideoOrder(video.order?.toString() || "1");
    setVideoIsActive(video.isActive !== undefined ? video.isActive : true);
    setIsAddingVideo(true);
  }

  async function handleSaveVideo(e) {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) {
      setActionError("Video Title and Video URL are required.");
      return;
    }
    setActionError("");
    setVideoLoading(true);

    const payload = {
      title: videoTitle.trim(),
      tagline: videoTagline.trim(),
      videoUrl: videoUrl.trim(),
      thumbnailUrl: videoThumbnailUrl.trim(),
      badge: videoBadge.trim() || "4K REEL",
      productLink: videoProductLink.trim() || "/products",
      duration: videoDuration.trim() || "0:30",
      order: Number(videoOrder) || 0,
      isActive: videoIsActive,
    };

    try {
      if (editingVideo) {
        const res = await updateVideo(editingVideo._id, payload);
        const updated = res.data?.data || res.data;
        setVideoReels(videoReels.map((v) => (v._id === editingVideo._id ? updated : v)));
      } else {
        const res = await createVideo(payload);
        const created = res.data?.data || res.data;
        setVideoReels([...videoReels, created]);
      }
      resetVideoForm();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save video reel.");
    } finally {
      setVideoLoading(false);
    }
  }

  async function handleToggleVideoActive(video) {
    setActionError("");
    try {
      const res = await updateVideo(video._id, { isActive: !video.isActive });
      const updated = res.data?.data || res.data;
      setVideoReels(videoReels.map((v) => (v._id === video._id ? updated : v)));
    } catch (err) {
      setActionError("Failed to update video active status.");
    }
  }

  async function handleDeleteVideo(id) {
    if (!window.confirm("Are you sure you want to delete this video reel?")) return;
    setActionError("");
    try {
      await deleteVideo(id);
      setVideoReels(videoReels.filter((v) => v._id !== id));
    } catch (err) {
      setActionError("Failed to delete video reel.");
    }
  }

  async function handleMoveVideo(index, direction) {
    const newVideos = [...videoReels];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newVideos.length) return;

    const [moved] = newVideos.splice(index, 1);
    newVideos.splice(targetIdx, 0, moved);

    const reorderedItems = newVideos.map((v, idx) => ({
      id: v._id,
      order: idx + 1,
    }));

    setVideoReels(newVideos.map((v, idx) => ({ ...v, order: idx + 1 })));

    try {
      await reorderVideos(reorderedItems);
    } catch (err) {
      setActionError("Failed to persist video reordering.");
      const videoRes = await getAdminVideos();
      setVideoReels(videoRes.data?.data || videoRes.data || []);
    }
  }

  async function handleVideoFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    setActionError("");
    try {
      const url = await handleImageUpload(file);
      setVideoUrl(url);
    } catch (err) {
      setActionError("Failed to upload video file.");
    } finally {
      setVideoUploading(false);
    }
  }

  // Helper to read file, pre-compress if image, and upload to backend
  async function handleImageUpload(file) {
    if (!file) return null;

    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|gif|bmp|tiff|svg)$/i.test(file.name);
    const isAnimatedOrSvg = /\.(gif|svg)$/i.test(file.name) || file.type === "image/gif" || file.type === "image/svg+xml";

    if (!isImage || isAnimatedOrSvg) {
      // Video, GIF, SVG or raw file: direct base64 upload
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64 = e.target.result.split(",")[1];
            const res = await api.post("/api/upload", {
              filename: file.name,
              base64: base64,
            });
            resolve(res.data.url);
          } catch (err) {
            console.error("Upload error:", err);
            reject(err);
          }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }

    // Pre-compress JPG/PNG/WebP image via Canvas in browser (max 1600px, 0.85 quality)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = async () => {
          try {
            const maxDim = 1600;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL("image/webp", 0.85);
            const base64 = compressedDataUrl.split(",")[1];

            const res = await api.post("/api/upload", {
              filename: file.name.replace(/\.[^/.]+$/, ".webp"),
              base64: base64,
            });
            resolve(res.data.url);
          } catch (err) {
            console.error("Image compression/upload error, falling back to direct upload:", err);
            try {
              const base64 = e.target.result.split(",")[1];
              const res = await api.post("/api/upload", {
                filename: file.name,
                base64: base64,
              });
              resolve(res.data.url);
            } catch (fallbackErr) {
              reject(fallbackErr);
            }
          }
        };
        img.onerror = () => {
          // Direct base64 fallback if image element fails
          api.post("/api/upload", {
            filename: file.name,
            base64: e.target.result.split(",")[1],
          })
            .then((res) => resolve(res.data.url))
            .catch(reject);
        };
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Helper to handle multiple image files for a specific variant (from multi-file picker or drag-and-drop)
  async function handleMultipleVariantImagesUpload(variantIndex, filesList) {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList).filter(
      (f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|gif|bmp|tiff|svg)$/i.test(f.name)
    );
    if (files.length === 0) {
      setActionError("Please select valid image files (JPG, PNG, WebP, AVIF, GIF).");
      return;
    }

    setActionError("");
    setProdLoading(true);
    setUploadProgressText(`Uploading 0 of ${files.length} images for variant #${variantIndex + 1}...`);

    const uploadedUrls = [];
    let completed = 0;

    for (const file of files) {
      try {
        setUploadProgressText(`⚡ Optimizing & uploading (${completed + 1}/${files.length}): ${file.name}`);
        const url = await handleImageUpload(file);
        if (url) {
          uploadedUrls.push(url);
        }
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
      }
      completed++;
    }

    if (uploadedUrls.length > 0) {
      setFormVariants((prev) => {
        const next = [...prev];
        const currentImages = next[variantIndex]?.images || (next[variantIndex]?.image ? [next[variantIndex].image] : []);
        const cleanCurrent = currentImages
          .map((img) => (typeof img === "object" ? img?.url : img))
          .filter((u) => u && typeof u === "string");
        const combined = [...cleanCurrent, ...uploadedUrls];
        next[variantIndex] = {
          ...next[variantIndex],
          images: combined,
          image: combined[0] || "",
        };
        return next;
      });
      setActionSuccess(`Uploaded ${uploadedUrls.length} image(s) for variant #${variantIndex + 1}!`);
      setTimeout(() => setActionSuccess(""), 3000);
    } else {
      setActionError("Failed to upload selected images. Please try again.");
    }

    setProdLoading(false);
    setUploadProgressText("");
    setDraggingVariantIndex(null);
  }

  // Helper to reorder image within a variant (used by drag-and-drop & direct position number selector)
  function handleReorderVariantImage(variantIndex, fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setFormVariants((prev) => {
      const next = [...prev];
      const currentImages = [...(next[variantIndex]?.images || (next[variantIndex]?.image ? [next[variantIndex].image] : []))]
        .map((img) => (typeof img === "object" ? img?.url : img))
        .filter((u) => u && typeof u === "string");

      if (fromIndex >= currentImages.length || toIndex >= currentImages.length) return prev;

      const [movedItem] = currentImages.splice(fromIndex, 1);
      currentImages.splice(toIndex, 0, movedItem);

      next[variantIndex] = {
        ...next[variantIndex],
        images: currentImages,
        image: currentImages[0] || "",
      };
      return next;
    });
  }

  function handleMakeCoverVariantImage(variantIndex, imageIndex) {
    handleReorderVariantImage(variantIndex, imageIndex, 0);
  }

  function handleMoveVariantImage(variantIndex, imageIndex, direction) {
    setFormVariants((prev) => {
      const next = [...prev];
      const currentImages = [...(next[variantIndex]?.images || (next[variantIndex]?.image ? [next[variantIndex].image] : []))]
        .map((img) => (typeof img === "object" ? img?.url : img))
        .filter((u) => u && typeof u === "string");
      const targetIndex = direction === "left" ? imageIndex - 1 : imageIndex + 1;
      if (targetIndex < 0 || targetIndex >= currentImages.length) return prev;
      const temp = currentImages[imageIndex];
      currentImages[imageIndex] = currentImages[targetIndex];
      currentImages[targetIndex] = temp;
      next[variantIndex] = {
        ...next[variantIndex],
        images: currentImages,
        image: currentImages[0] || "",
      };
      return next;
    });
  }

  function handleDeleteVariantImage(variantIndex, imageIndex) {
    setFormVariants((prev) => {
      const next = [...prev];
      const currentImages = (next[variantIndex]?.images || (next[variantIndex]?.image ? [next[variantIndex].image] : []))
        .map((img) => (typeof img === "object" ? img?.url : img))
        .filter((_, i) => i !== imageIndex)
        .filter((u) => u && typeof u === "string");
      next[variantIndex] = {
        ...next[variantIndex],
        images: currentImages,
        image: currentImages[0] || "",
      };
      return next;
    });
  }

  // Helper to sanitize SKU tokens
  function cleanSkuToken(str) {
    if (!str) return "";
    return str
      .toString()
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function cleanSizeToken(str) {
    if (!str) return "6INCH";
    return str
      .toString()
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/[^A-Z0-9-]/g, "");
  }

  // Compute Auto SKU in format: [Main Category]-[SubCategory]-[Size]-[Finish / Color]
  function computeVariantSku(sizeVal, finishVal, catIdVal = selectedCatId, subCatIdsVal = selectedSubCatIds) {
    // 1. Main Category
    const cleanCat = typeof catIdVal === "object" ? catIdVal?._id : catIdVal;
    const mainCat = (categories || []).find((c) => {
      const cId = typeof c === "object" ? c._id : c;
      return cId && cleanCat && cId.toString() === cleanCat.toString();
    });
    const mainCatName = mainCat?.name || (typeof cleanCat === "string" && !cleanCat.match(/^[0-9a-fA-F]{24}$/) ? cleanCat : "");
    const mainCatToken = cleanSkuToken(mainCatName) || cleanSkuToken(deity) || "MURTI";

    // 2. Subcategory
    let subCatName = "";
    const firstSubId = Array.isArray(subCatIdsVal) && subCatIdsVal.length > 0 ? subCatIdsVal[0] : null;
    const cleanSub = typeof firstSubId === "object" ? firstSubId?._id : firstSubId;
    if (cleanSub) {
      const subCat = (categories || []).find((c) => {
        const cId = typeof c === "object" ? c._id : c;
        return cId && cId.toString() === cleanSub.toString();
      });
      subCatName = subCat?.name || (typeof cleanSub === "string" && !cleanSub.match(/^[0-9a-fA-F]{24}$/) ? cleanSub : "");
    }
    const subCatToken = cleanSkuToken(subCatName) || cleanSkuToken(deity) || cleanSkuToken(title?.slice(0, 4)) || "GEN";

    // 3. Size
    const sizeToken = cleanSizeToken(sizeVal || "6 inch");

    // 4. Finish / Color
    const finishToken = cleanSkuToken(finishVal || "Matte Black");

    return `${mainCatToken}-${subCatToken}-${sizeToken}-${finishToken}`;
  }

  // Helper to reset product form state variables
  function resetProductForm() {
    setTitle("");
    setDescription("");
    setDeity("");
    setBasePrice("");
    setSelectedCatId("");
    setSelectedSubCatIds([]);
    setGalleryImages([]);
    setGalleryVideos([]);
    setPurposes([]);
    setIsOnSale(false);
    setVariantSize("6 inch");
    setVariantFinish("Matte Black");
    setVariantStock("10");
    setVariantSku("");
    setFormVariants([{ size: "6 inch", finish: finishes[0]?.name || "Matte Black", price: "", discountPrice: "", stock: "10", sku: "", isCustomSku: false, image: "", images: [] }]);
    setProductTags([]);
    setCustomTagInput("");
    setProductDetails("");
    setMaterialsAndCare("");
    setShippingReturns("");
    setAccordionSections([]);
    setIsDraggingImages(false);
    setDraggingVariantIndex(null);
    setDraggedImageInfo(null);
    setDragOverTarget(null);
    setUploadProgressText("");
    setQuickCatOpen(false);
    setQuickSubOpen(false);
    setEditingProduct(null);
    setIsAddingProduct(false);
  }

  // Tag Manager Helpers
  function handleAddProductTag(tag) {
    const cleanTag = (tag || "").trim();
    if (!cleanTag) return;
    if (!productTags.includes(cleanTag)) {
      setProductTags((prev) => [...prev, cleanTag]);
    }
    if (!availableTags.includes(cleanTag)) {
      setAvailableTags((prev) => [...prev, cleanTag]);
    }
    setCustomTagInput("");
  }

  function handleRemoveProductTag(tagToRemove) {
    setProductTags((prev) => prev.filter((t) => t !== tagToRemove));
  }

  // Quick create main category directly inside product modal
  async function handleQuickCreateCategory(e) {
    if (e) e.preventDefault();
    if (!quickCatName.trim()) {
      setActionError("Please enter a category name.");
      return;
    }
    setQuickCatLoading(true);
    setActionError("");
    try {
      const slug =
        quickCatSlug.trim() ||
        quickCatName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const res = await createCategory({
        name: quickCatName.trim(),
        slug,
        description: quickCatDesc.trim(),
        parentCategory: null,
      });

      const newCat = res.data;
      setCategories((prev) => [...prev, newCat]);
      setSelectedCatId(newCat._id);
      if (!deity || deity === "General") {
        setDeity(newCat.name);
      }
      setFormVariants((prev) =>
        prev.map((v) => ({
          ...v,
          sku: v.isCustomSku ? v.sku : computeVariantSku(v.size, v.finish, newCat._id, selectedSubCatIds),
        }))
      );
      setQuickCatName("");
      setQuickCatSlug("");
      setQuickCatDesc("");
      setQuickCatOpen(false);
      setActionSuccess(`Main Category "${newCat.name}" created and assigned!`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to create category.");
    } finally {
      setQuickCatLoading(false);
    }
  }

  // Quick create subcategory directly inside product modal
  async function handleQuickCreateSubcategory(e) {
    if (e) e.preventDefault();
    const parentId = quickSubParentId || selectedCatId;
    if (!quickSubName.trim()) {
      setActionError("Please enter a subcategory name.");
      return;
    }
    if (!parentId) {
      setActionError("Please select a parent category first.");
      return;
    }
    setQuickSubLoading(true);
    setActionError("");
    try {
      const parentCat = categories.find((c) => c._id === parentId);
      const prefix = parentCat ? `${parentCat.slug}-` : "";
      const slug =
        quickSubSlug.trim() ||
        `${prefix}${quickSubName}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const res = await createCategory({
        name: quickSubName.trim(),
        slug,
        description: quickSubDesc.trim(),
        parentCategory: parentId,
      });

      const newSub = res.data;
      setCategories((prev) => [...prev, newSub]);
      const newSubIds = selectedSubCatIds.includes(newSub._id) ? selectedSubCatIds : [...selectedSubCatIds, newSub._id];
      setSelectedSubCatIds(newSubIds);
      setFormVariants((prev) =>
        prev.map((v) => ({
          ...v,
          sku: v.isCustomSku ? v.sku : computeVariantSku(v.size, v.finish, selectedCatId, newSubIds),
        }))
      );
      setQuickSubName("");
      setQuickSubSlug("");
      setQuickSubDesc("");
      setQuickSubOpen(false);
      setActionSuccess(`Subcategory "${newSub.name}" created and assigned!`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to create subcategory.");
    } finally {
      setQuickSubLoading(false);
    }
  }

  // Move image left/right to adjust Primary / Hover order
  function handleMoveImage(index, direction) {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;
    const nextImages = [...galleryImages];
    const temp = nextImages[index];
    nextImages[index] = nextImages[targetIndex];
    nextImages[targetIndex] = temp;
    setGalleryImages(nextImages);
  }

  // Populate form with product values for edit
  async function handleEditProduct(p) {
    setProdLoading(true);
    setActionError("");
    try {
      let fullProduct = p;
      // Prefer slug first for cleaner URLs and immediate backward/forward compatibility
      const preferredKey = p.slug || p._id || p.id;
      const fallbackKey = p._id || p.id;

      let fetched = false;
      if (preferredKey) {
        try {
          const res = await api.get(`/api/products/${encodeURIComponent(preferredKey)}`);
          if (res?.data) {
            fullProduct = res.data;
            fetched = true;
          }
        } catch (prefErr) {
          // Preferred key fetch failed, will try fallback key
        }
      }

      if (!fetched && fallbackKey && fallbackKey !== preferredKey) {
        try {
          const res = await api.get(`/api/products/${encodeURIComponent(fallbackKey)}`);
          if (res?.data) {
            fullProduct = res.data;
            fetched = true;
          }
        } catch (fallbackErr) {
          // Fallback key fetch failed
        }
      }

      setEditingProduct(fullProduct);
      setTitle(fullProduct.title || "");
      setDescription(fullProduct.description || "");
      setDeity(fullProduct.deity || "");
      setBasePrice(fullProduct.basePrice?.toString() || "");

      // Robust Category extraction (handles array of objects, array of IDs, or single object)
      let catId = "";
      if (Array.isArray(fullProduct.category) && fullProduct.category.length > 0) {
        catId = fullProduct.category[0]?._id || fullProduct.category[0] || "";
      } else if (fullProduct.category) {
        catId = fullProduct.category._id || fullProduct.category || "";
      }
      setSelectedCatId(catId ? catId.toString() : "");

      // Robust Subcategories extraction
      const rawSub = fullProduct.subCategory;
      let subCatIds = [];
      if (Array.isArray(rawSub)) {
        subCatIds = rawSub.map((s) => (s && s._id ? s._id : s)).filter(Boolean);
      } else if (rawSub) {
        subCatIds = [rawSub._id || rawSub].filter(Boolean);
      }
      setSelectedSubCatIds(subCatIds);

      // Robust Gallery Images extraction (handles { url: "..." } and string URLs)
      const rawImages = Array.isArray(fullProduct.images) ? fullProduct.images : [];
      const imageList = rawImages
        .map((img) => (typeof img === "object" ? img?.url : img))
        .filter((url) => url && typeof url === "string");
      setGalleryImages(imageList);

      // Robust Videos extraction
      const rawVideos = Array.isArray(fullProduct.videos) ? fullProduct.videos : [];
      const videoList = rawVideos
        .map((v) => (typeof v === "string" ? { url: v } : v))
        .filter((v) => v && v.url);
      setGalleryVideos(videoList);

      setPurposes(Array.isArray(fullProduct.purpose) ? fullProduct.purpose : []);
      setIsOnSale(Boolean(fullProduct.isOnSale));
      setProductTags(Array.isArray(fullProduct.tags) ? fullProduct.tags : []);
      setProductDetails(fullProduct.productDetails || "");
      setMaterialsAndCare(fullProduct.materialsAndCare || "");
      setShippingReturns(fullProduct.shippingReturns || "");
      setAccordionSections(Array.isArray(fullProduct.accordionSections) ? fullProduct.accordionSections : []);

      if (fullProduct.variants && fullProduct.variants.length > 0) {
        setFormVariants(
          fullProduct.variants.map((v, vIdx) => {
            let vImages = [];
            // 1. If variant has multiple images array, load them
            if (Array.isArray(v.images) && v.images.length > 1) {
              vImages = v.images
                .map((img) => (typeof img === "object" ? img?.url : img))
                .filter((url) => url && typeof url === "string");
            } else if (Array.isArray(v.images) && v.images.length === 1) {
              const single = typeof v.images[0] === "object" ? v.images[0]?.url : v.images[0];
              if (single) vImages = [single];
            } else if (v.image) {
              const singleUrl = typeof v.image === "object" ? v.image?.url : v.image;
              if (singleUrl && typeof singleUrl === "string") {
                vImages = [singleUrl];
              }
            }

            // 2. If variant only has <= 1 image, but fullProduct.images (imageList) has multiple photos:
            // Partition imageList among variants so NO images are lost when editing!
            if (vImages.length <= 1 && imageList.length > 0) {
              if (fullProduct.variants.length === 1) {
                // Single variant product gets all images
                vImages = Array.from(new Set([...vImages, ...imageList])).filter(Boolean);
              } else {
                // Multi-variant partitioning by variant cover markers
                const currentVarUrl = (vImages[0] || (typeof v.image === "object" ? v.image?.url : v.image) || "").trim();
                const startIdx = imageList.findIndex(
                  (u) => u === currentVarUrl || u.endsWith(currentVarUrl) || currentVarUrl.endsWith(u)
                );

                if (startIdx !== -1) {
                  let endIdx = imageList.length;
                  for (let oIdx = 0; oIdx < fullProduct.variants.length; oIdx++) {
                    if (oIdx === vIdx) continue;
                    const otherV = fullProduct.variants[oIdx];
                    const otherUrl = (typeof otherV?.image === "object" ? otherV?.image?.url : otherV?.image || "").trim();
                    if (otherUrl && otherUrl !== currentVarUrl) {
                      const otherPos = imageList.findIndex(
                        (u) => u === otherUrl || u.endsWith(otherUrl) || otherUrl.endsWith(u)
                      );
                      if (otherPos > startIdx && otherPos < endIdx) {
                        endIdx = otherPos;
                      }
                    }
                  }
                  const partitioned = imageList.slice(startIdx, endIdx);
                  if (partitioned.length > 0) {
                    vImages = partitioned;
                  }
                }
              }
            }

            return {
              _id: v._id,
              size: v.size || "6 inch",
              finish: v.finish || (finishes[0]?.name || "Matte Black"),
              price: v.price !== undefined && v.price !== null ? v.price.toString() : "",
              discountPrice: v.discountPrice !== undefined && v.discountPrice !== null ? v.discountPrice.toString() : "",
              stock: v.stock !== undefined && v.stock !== null ? v.stock.toString() : "10",
              sku: v.sku || "",
              isCustomSku: !!v.sku,
              image: vImages[0] || "",
              images: vImages,
            };
          })
        );
        setVariantSize(fullProduct.variants[0].size || "6 inch");
        setVariantFinish(fullProduct.variants[0].finish || "Matte Black");
        const totalStock = fullProduct.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
        setVariantStock(totalStock.toString());
        setVariantSku(fullProduct.variants[0].sku || "");
      } else {
        const initialImgs = imageList.length > 0 ? [...imageList] : [];
        setFormVariants([{ size: "6 inch", finish: finishes[0]?.name || "Matte Black", price: "", discountPrice: "", stock: "10", sku: "", isCustomSku: false, image: initialImgs[0] || "", images: initialImgs }]);
        setVariantSize("6 inch");
        setVariantFinish(finishes[0]?.name || "Matte Black");
        setVariantStock("10");
        setVariantSku("");
      }

      setIsAddingProduct(true);
    } catch (err) {
      console.error("handleEditProduct error:", err);
      setActionError("Failed to fetch product details. Please try again.");
    } finally {
      setProdLoading(false);
    }
  }

  // Handle product creation or update submission
  async function handleCreateProduct(e) {
    e.preventDefault();
    if (!title?.trim() || !description?.trim() || !basePrice || !selectedCatId) {
      setActionError("Please fill out all required fields (Title, Description, Base Price, Main Category).");
      return;
    }

    // Extract all images from variants
    const allVariantImages = [];
    formVariants.forEach((v) => {
      const vImgs = Array.isArray(v.images) && v.images.length > 0 ? v.images : (v.image ? [v.image] : []);
      vImgs.forEach((imgUrl) => {
        const cleanUrl = typeof imgUrl === "object" ? imgUrl?.url : imgUrl;
        if (cleanUrl && typeof cleanUrl === "string" && !allVariantImages.includes(cleanUrl)) {
          allVariantImages.push(cleanUrl);
        }
      });
    });

    if (allVariantImages.length === 0) {
      setActionError("Product Variants must have at least 1 image! Please upload an image for your variants before saving.");
      return;
    }
    setActionError("");
    setProdLoading(true);

    const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Clean categories and subcategories
    const cleanCatId = typeof selectedCatId === "object" ? selectedCatId?._id : selectedCatId;
    const cleanSubCatIds = (selectedSubCatIds || [])
      .map((s) => (typeof s === "object" ? s?._id : s))
      .filter((id) => id && typeof id === "string");

    const updatedVariants = formVariants.map((v, idx) => {
      const autoSku = computeVariantSku(v.size, v.finish, cleanCatId, cleanSubCatIds);
      const sku = v.sku?.trim() || autoSku;
      const vImgs = Array.isArray(v.images) && v.images.length > 0 ? v.images : (v.image ? [v.image] : []);
      const cleanImgStrings = vImgs
        .map((img) => (typeof img === "object" ? img?.url : img))
        .filter((url) => url && typeof url === "string");

      const variantObj = {
        size: v.size,
        finish: v.finish,
        price: Number(v.price) || Number(basePrice),
        discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
        stock: Number(v.stock) || 0,
        sku: sku,
        weight: "500g",
        image: cleanImgStrings[0] || "",
        images: cleanImgStrings.map((url) => ({
          url,
          alt: `${title.trim()} - ${v.finish} - ${v.size}`,
        })),
      };
      if (v._id) {
        variantObj._id = v._id;
      }
      return variantObj;
    });

    const productPayload = {
      title: title.trim(),
      slug: editingProduct ? (editingProduct.slug || generatedSlug) : generatedSlug,
      description: description.trim(),
      deity: deity?.trim() || "General",
      basePrice: Number(basePrice),
      category: cleanCatId ? [cleanCatId] : [],
      subCategory: cleanSubCatIds,
      purpose: purposes,
      tags: productTags,
      isOnSale,
      images: allVariantImages.map((imgUrl) => ({
        url: typeof imgUrl === "object" ? imgUrl.url : imgUrl,
        alt: title.trim(),
      })).filter((img) => img.url),
      videos: (galleryVideos || []).map((v) => (typeof v === "object" ? v : { url: v })).filter((v) => v && v.url),
      productDetails: productDetails.trim(),
      materialsAndCare: materialsAndCare.trim(),
      shippingReturns: shippingReturns.trim(),
      accordionSections: accordionSections.filter((s) => s.title?.trim() && s.content?.trim()),
      variants: updatedVariants,
    };

    try {
      const editId = editingProduct?._id || editingProduct?.id;
      if (editId) {
        // Update flow
        const res = await updateProduct(editId, productPayload);
        const updatedDoc = res.data;
        setProducts((prevProducts) =>
          prevProducts.map((p) => (String(p._id || p.id) === String(editId) ? updatedDoc : p))
        );
        setActionSuccess(`Product "${title}" updated successfully!`);
      } else {
        // Create flow
        const res = await createProduct(productPayload);
        const createdDoc = res.data;
        setProducts((prevProducts) => [createdDoc, ...prevProducts]);
        setActionSuccess(`Product "${title}" created successfully!`);
      }
      resetProductForm();
      // Re-fetch products fresh from server to ensure complete sync
      try {
        const prodRes = await getProducts({ limit: 50 });
        if (prodRes?.data?.products) {
          setProducts(prodRes.data.products);
        }
      } catch (refetchErr) {
        console.warn("Product list refresh error:", refetchErr);
      }
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error("Save product error:", err);
      setActionError(err.response?.data?.message || err.message || "Failed to save product.");
    } finally {
      setProdLoading(false);
    }
  }

  // Handle product deletion
  async function handleDeleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setActionError("");
    try {
      await deleteProduct(id);
      setProducts((prevProducts) => prevProducts.filter((p) => String(p._id || p.id) !== String(id)));
    } catch (err) {
      setActionError("Failed to delete product. Please try again.");
    }
  }

  // Toggle purpose helper
  function togglePurpose(value) {
    if (purposes.includes(value)) {
      setPurposes(purposes.filter((p) => p !== value));
    } else {
      setPurposes([...purposes, value]);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-charcoal/50">Loading Admin Dashboard...</p>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-2xl text-maroon mb-2">Access Denied</h1>
        <p className="text-charcoal/60 mb-6">You do not have administrative permissions to view this page.</p>
        <Link href="/" className="bg-maroon text-ivory px-8 py-3 rounded-full hover:bg-maroon-dark">
          Back to Homepage
        </Link>
      </main>
    );
  }

  const claimOrders = orders.filter((o) => o.returnRequest?.isRequested);

  return (
    <div className="min-h-screen bg-slate-50 font-display flex flex-col lg:flex-row w-full text-charcoal selection:bg-gold selection:text-black">
      {/* 1. Mobile Top Header Bar (White Theme) */}
      <div className="lg:hidden flex items-center justify-between bg-white text-charcoal px-4 py-3 border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-charcoal transition-colors border border-slate-200"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <span className="font-black text-sm tracking-wider uppercase text-maroon">MurtiPuja</span>
            <span className="text-[10px] text-charcoal/50 ml-1.5 uppercase font-bold">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="text-[10px] bg-maroon hover:bg-maroon-dark text-white font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider transition-transform active:scale-95 shadow-xs"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* 2. Vertical Left Sidebar Navigation (White Background) */}
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white text-charcoal flex flex-col justify-between z-50 transition-transform duration-300 border-r border-slate-200 shadow-sm shrink-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-widest text-maroon uppercase">MurtiPuja</span>
              <span className="text-[9px] bg-amber-50 text-amber-900 border border-amber-200 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            <p className="text-[11px] text-charcoal/50 mt-1 truncate max-w-[190px] font-medium">
              {user.name || user.phone} (Admin)
            </p>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-charcoal/50 hover:text-black p-1 text-base font-bold"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Navigation Items (White background with crisp cards) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-5 no-scrollbar bg-white">
          {/* Section 1: Core & Analytics */}
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase font-black tracking-widest text-charcoal/40 px-3 pb-0.5">
              Core & Analytics
            </p>

            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedOrder(null); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "dashboard"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "dashboard" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">📊</span>
                <span>Dashboard Analytics</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab("orders"); setSelectedOrder(null); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "orders"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "orders" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">📦</span>
                <span>Manage Orders</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "orders"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("claims"); setSelectedOrder(null); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "claims"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "claims" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">🛡️</span>
                <span>Damage Claims</span>
              </div>
              {claimOrders.filter((o) => o.returnRequest?.status === "requested").length > 0 ? (
                <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                  {claimOrders.filter((o) => o.returnRequest?.status === "requested").length}
                </span>
              ) : (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    activeTab === "claims"
                      ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                      : "bg-slate-100 text-charcoal/70 border-slate-200"
                  }`}
                >
                  0
                </span>
              )}
            </button>
          </div>

          {/* Section 2: Catalog Management */}
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase font-black tracking-widest text-charcoal/40 px-3 pb-0.5">
              Catalog Management
            </p>

            <button
              onClick={() => { setActiveTab("categories"); setSelectedOrder(null); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "categories"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "categories" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">📁</span>
                <span>Categories, Sub & Tags</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "categories"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("products"); setSelectedOrder(null); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "products"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "products" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">🛕</span>
                <span>Product Catalog</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "products"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                {products.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("finishes"); setSelectedOrder(null); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "finishes"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "finishes" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">🎨</span>
                <span>Manage Finishes</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "finishes"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                {finishes.length}
              </span>
            </button>
          </div>

          {/* Section 3: Marketing & Sales */}
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase font-black tracking-widest text-charcoal/40 px-3 pb-0.5">
              Marketing & Offers
            </p>

            <button
              onClick={() => { setActiveTab("combos"); setSelectedOrder(null); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "combos"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "combos" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">🎁</span>
                <span>Combo Offers</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "combos"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                {combos.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("coupons"); setSelectedOrder(null); resetCouponForm(); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "coupons"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "coupons" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">🎟️</span>
                <span>Coupons & Codes</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "coupons"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                {coupons.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("offers"); setSelectedOrder(null); resetOfferForm(); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "offers"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "offers" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">⚡</span>
                <span>Special Offers</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "offers"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                {offers.length}
              </span>
            </button>
          </div>

          {/* Section 4: Storefront CMS & Content */}
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase font-black tracking-widest text-charcoal/40 px-3 pb-0.5">
              Storefront CMS
            </p>

            <button
              onClick={() => { setActiveTab("nav-menu"); setSelectedOrder(null); resetNavForm(); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "nav-menu"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "nav-menu" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">🧭</span>
                <span>Navigation Menu</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "nav-menu"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                {navMenuItems.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("banners"); setSelectedOrder(null); resetBannerForm(); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "banners"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "banners" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">🖼️</span>
                <span>Hero Banners</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "banners"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                {banners.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("videos"); setSelectedOrder(null); resetVideoForm(); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "videos"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "videos" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">🎬</span>
                <span>Video Reels</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "videos"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                {videoReels.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("pages"); setSelectedOrder(null); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all bg-white ${
                activeTab === "pages"
                  ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                  : "text-charcoal/80 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-black shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {activeTab === "pages" && <span className="w-1.5 h-4 bg-maroon rounded-full shrink-0"></span>}
                <span className="text-sm">📄</span>
                <span>Pages CMS</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTab === "pages"
                    ? "bg-maroon/10 text-maroon border-maroon/20 font-black"
                    : "bg-slate-100 text-charcoal/70 border-slate-200"
                }`}
              >
                6
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2 shrink-0 bg-white">
          <button
            onClick={fetchDashboardData}
            className="w-full bg-maroon hover:bg-maroon-dark text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
          >
            <span>🔄</span> Refresh Data
          </button>
          <Link
            href="/"
            className="w-full bg-white hover:bg-slate-50 text-charcoal text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-200 shadow-2xs"
          >
            <span>←</span> Back to Storefront
          </Link>
        </div>
      </aside>

      {/* 3. Main Content Panel */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 overflow-y-auto">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-charcoal/10 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-charcoal/40 mb-1">
              <span>Control Panel</span>
              <span>/</span>
              <span className="text-maroon capitalize font-extrabold">{activeTab.replace(/-/g, " ")}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight capitalize">
              {activeTab === "dashboard"
                ? "Dashboard Analytics & Overview"
                : activeTab === "categories"
                ? "Categories, Subcategories & Tags Management"
                : activeTab === "nav-menu"
                ? "Navigation Menu Bar CMS"
                : activeTab.replace(/-/g, " ")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-charcoal/60 hidden sm:inline-block">
              Logged in as <strong className="text-black">{user.name || user.phone}</strong>
            </span>
            <button
              onClick={fetchDashboardData}
              className="text-xs bg-charcoal/5 hover:bg-charcoal/10 text-charcoal font-bold px-3 py-1.5 rounded-xl transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200">{error}</p>}
        {actionError && <p className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200">{actionError}</p>}
        {actionSuccess && <p className="text-green-700 text-sm bg-green-50 p-4 rounded-xl border border-green-200">{actionSuccess}</p>}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm">
                <p className="text-xs text-charcoal/50 uppercase font-semibold">Total Revenue</p>
                <p className="text-2xl font-bold text-maroon mt-2">₹{stats.totalRevenue}</p>
              </div>
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm">
                <p className="text-xs text-charcoal/50 uppercase font-semibold">Confirmed Orders</p>
                <p className="text-2xl font-bold text-charcoal mt-2">{stats.totalOrders}</p>
              </div>
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm">
                <p className="text-xs text-charcoal/50 uppercase font-semibold">Active Claims</p>
                <p className={`text-2xl font-bold mt-2 ${stats.activeReturnRequests > 0 ? "text-red-600" : "text-charcoal"}`}>
                  {stats.activeReturnRequests}
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm">
                <p className="text-xs text-charcoal/50 uppercase font-semibold">Low Stock Items</p>
                <p className={`text-2xl font-bold mt-2 ${stats.lowStockProducts.length > 0 ? "text-yellow-600" : "text-charcoal"}`}>
                  {stats.lowStockProducts.length}
                </p>
              </div>
            </div>

            {/* Alert Lists */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Low Stock Panel */}
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm space-y-4">
                <h3 className="font-display text-lg text-maroon font-bold flex items-center gap-2">
                  ⚠️ Inventory Stock Alerts
                </h3>
                {stats.lowStockProducts.length === 0 ? (
                  <p className="text-xs text-green-700">✓ All product stocks are in healthy levels.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-charcoal/5 pr-2">
                    {stats.lowStockProducts.map((p) => (
                      <div key={p.sku} className="py-2 text-xs flex justify-between">
                        <div>
                          <p className="font-semibold">{p.title}</p>
                          <p className="text-[10px] text-charcoal/50">SKU: {p.sku} ({p.size} / {p.finish})</p>
                        </div>
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                          {p.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm space-y-4">
                <h3 className="font-display text-lg text-maroon font-bold">📋 Store Administration Shortcuts</h3>
                <div className="grid grid-cols-2 gap-3 text-center text-xs font-semibold">
                  <button onClick={() => setActiveTab("orders")} className="p-4 bg-maroon/5 text-maroon border border-maroon/10 rounded-xl hover:bg-maroon/10 transition-all">
                    View Orders
                  </button>
                  <button onClick={() => setActiveTab("claims")} className="p-4 bg-gold/5 text-gold border border-gold/10 rounded-xl hover:bg-gold/10 transition-all">
                    Claims Inbox ({stats.activeReturnRequests})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-charcoal/10 bg-charcoal/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="font-display text-lg text-maroon font-bold">Orders Management</h2>
              {orders.some((o) => o.orderStatus === "placed") && (
                <button
                  onClick={handleAcceptAllOrders}
                  disabled={acceptAllLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {acceptAllLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Accepting Orders...
                    </>
                  ) : (
                    "✓ Accept All Placed Orders"
                  )}
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <p className="text-charcoal/50 p-8 text-center text-sm">No orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal/50 uppercase font-semibold">
                      <th className="p-4">Order No</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Shipment Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-charcoal/5 transition-colors">
                        <td className="p-4 font-mono font-medium">{o.orderNumber}</td>
                        <td className="p-4">
                          <p className="font-semibold">{o.user?.name || "Guest User"}</p>
                          <p className="text-[10px] text-charcoal/50">{o.user?.phone}</p>
                        </td>
                        <td className="p-4 font-semibold">₹{o.totalAmount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${o.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${o.orderStatus === "delivered"
                                ? "bg-blue-100 text-blue-800"
                                : o.orderStatus === "shipped"
                                  ? "bg-purple-100 text-purple-800"
                                  : o.orderStatus === "out_for_delivery"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}>
                                {o.orderStatus?.replace(/_/g, " ")}
                              </span>
                              {o.shiprocketOrderId && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200" title={`Shiprocket Shipment ID: ${o.shiprocketShipmentId || "N/A"}`}>
                                  SR #{o.shiprocketOrderId}
                                </span>
                              )}
                            </div>
                            {(o.trackingId || o.awbNumber) ? (
                              <button
                                onClick={() => openTrackingModal(o, o.orderStatus)}
                                className="text-[10px] text-neutral-800 font-mono flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded border border-neutral-300 transition-colors text-left w-full group"
                                title="Click to edit Courier or AWB Number"
                              >
                                <span>📦</span>
                                <span className="font-semibold text-neutral-600">{o.courierPartner || "Courier"}:</span>
                                <span className="font-bold text-black">{o.trackingId || o.awbNumber}</span>
                                <span className="text-[9px] text-neutral-400 group-hover:text-black font-sans ml-auto">✏️</span>
                              </button>
                            ) : (
                              (o.orderStatus === "shipped" || o.orderStatus === "out_for_delivery" || o.orderStatus === "confirmed" || o.orderStatus === "delivered") && (
                                <button
                                  onClick={() => openTrackingModal(o, o.orderStatus === "confirmed" ? "shipped" : o.orderStatus)}
                                  className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold px-2 py-1 rounded flex items-center gap-1 transition-all shadow-sm w-full"
                                  title="Add AWB number so customer can track on website"
                                >
                                  <span>🚚 + Add AWB Number</span>
                                </button>
                              )
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {o.orderStatus !== "delivered" && o.orderStatus !== "cancelled" && o.orderStatus !== "returned" && (
                              <select
                                value={o.orderStatus}
                                onChange={(e) => handleStatusChange(o._id, e.target.value)}
                                className="bg-white border border-charcoal/20 px-2 py-1 rounded text-[10px] outline-none font-semibold cursor-pointer"
                              >
                                <option value="placed">Placed</option>
                                <option value="confirmed">Confirm Order</option>
                                <option value="shipped">Mark Shipped 🚚 (Add AWB)</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Deliver Order</option>
                              </select>
                            )}
                            <button
                              onClick={() => openTrackingModal(o, o.orderStatus === "confirmed" ? "shipped" : o.orderStatus)}
                              className="px-2.5 py-1 bg-black hover:bg-gold hover:text-black text-white font-bold rounded text-[10px] transition-all flex items-center gap-1 shadow-sm"
                              title="Enter / Edit Courier & AWB Tracking Number"
                            >
                              🚚 AWB / Logistics
                            </button>
                            {o.shiprocketOrderId && (
                              <button
                                onClick={() => handleSyncShiprocket(o._id)}
                                disabled={srLoadingId === `sync_${o._id}`}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 font-bold rounded text-[10px] transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                                title="Sync live status and AWB from Shiprocket API"
                              >
                                {srLoadingId === `sync_${o._id}` ? "..." : "🔄 Sync SR"}
                              </button>
                            )}
                            <button
                              onClick={() => window.open(`/admin/print-label/${o._id}`, "_blank")}
                              className="px-2.5 py-1 bg-maroon text-white font-semibold rounded text-[10px] hover:bg-maroon/90 transition-all flex items-center gap-1 shadow-sm"
                              title="Print Shipping Label"
                            >
                              🖨️ Label
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tracking & AWB Shipment Modal */}
        {shippingModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border-2 border-black max-w-xl w-full p-6 space-y-5 animate-fadeIn shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-neutral-200 pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-gold text-black px-2 py-0.5 rounded">
                    Logistics & Dispatch
                  </span>
                  <h3 className="font-display text-lg font-extrabold uppercase tracking-wide text-neutral-900 mt-1">
                    Shipment & AWB Tracking
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Order #{shippingModalOrder.orderNumber} · Customer: {shippingModalOrder.user?.name || "Customer"} ({shippingModalOrder.shippingAddress?.city || "India"})
                  </p>
                </div>
                <button
                  onClick={() => setShippingModalOrder(null)}
                  className="text-neutral-400 hover:text-black text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Shiprocket 1-Click Dispatch Section */}
              <div className="border border-purple-200 bg-purple-50/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <span>🚀</span> Shiprocket Automated Integration
                  </span>
                  {shippingModalOrder.shiprocketOrderId ? (
                    <span className="text-[11px] font-mono font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                      SR #{shippingModalOrder.shiprocketOrderId}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded">
                      Not Synced Yet
                    </span>
                  )}
                </div>

                {shippingModalOrder.shiprocketOrderId ? (
                  <div className="space-y-3">
                    <p className="text-xs text-purple-800">
                      Shipment ID: <strong className="font-mono">{shippingModalOrder.shiprocketShipmentId || "N/A"}</strong> · Courier: <strong className="font-semibold">{shippingModalOrder.courierPartner || "Auto-assigned by Shiprocket"}</strong> · AWB: <strong className="font-mono">{shippingModalOrder.awbNumber || "Pending"}</strong>
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSyncShiprocket(shippingModalOrder._id)}
                        disabled={srLoadingId === `sync_${shippingModalOrder._id}`}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {srLoadingId === `sync_${shippingModalOrder._id}` ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Syncing...
                          </>
                        ) : (
                          "🔄 Sync Live Status & AWB"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateAwb(shippingModalOrder._id)}
                        disabled={srLoadingId === `awb_${shippingModalOrder._id}`}
                        className="px-3 py-1.5 bg-white border border-purple-300 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {srLoadingId === `awb_${shippingModalOrder._id}` ? "Generating..." : "🏷️ Auto Assign AWB"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrintShiprocketLabel(shippingModalOrder._id)}
                        disabled={srLoadingId === `label_${shippingModalOrder._id}`}
                        className="px-3 py-1.5 bg-white border border-purple-300 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {srLoadingId === `label_${shippingModalOrder._id}` ? "Fetching..." : "📄 Official Shiprocket Label"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-purple-800">
                      Push this order to Shiprocket with 1-click for automated courier pickup, label printing, and live tracking.
                    </p>
                    <button
                      type="button"
                      onClick={() => handlePushToShiprocket(shippingModalOrder._id)}
                      disabled={srLoadingId === `push_${shippingModalOrder._id}`}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all shadow-md whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {srLoadingId === `push_${shippingModalOrder._id}` ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Pushing...
                        </>
                      ) : (
                        "🚀 Push to Shiprocket"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Manual Courier / Offline Dispatch Entry Form */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px bg-neutral-200 flex-1"></div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Or Enter Courier / AWB Manually
                  </span>
                  <div className="h-px bg-neutral-200 flex-1"></div>
                </div>

                <form onSubmit={handleSaveTracking} className="space-y-4 font-sans">
                  {/* Status selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Shipment Milestone Status*
                    </label>
                    <select
                      value={shippingStatus}
                      onChange={(e) => setShippingStatus(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-bold text-neutral-800 outline-none focus:border-black"
                    >
                      <option value="confirmed">Confirmed (Packed in Studio)</option>
                      <option value="shipped">Shipped (Handed to Courier)</option>
                      <option value="out_for_delivery">Out for Delivery (Reaching Customer Today)</option>
                      <option value="delivered">Delivered (Completed)</option>
                    </select>
                  </div>

                  {/* Courier Partner */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Courier Partner*
                    </label>
                    <select
                      value={shippingCourier}
                      onChange={(e) => setShippingCourier(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-semibold text-neutral-800 outline-none focus:border-black"
                    >
                      <option value="Delhivery">Delhivery</option>
                      <option value="BlueDart">Blue Dart Express</option>
                      <option value="DTDC">DTDC Courier</option>
                      <option value="India Post (Speed Post)">India Post (Speed Post)</option>
                      <option value="Maruti Courier">Shree Maruti Courier</option>
                      <option value="Shadowfax">Shadowfax</option>
                      <option value="Ekart">Ekart Logistics</option>
                      <option value="Shiprocket">Shiprocket (Integrated)</option>
                      <option value="Other">Other Courier...</option>
                    </select>

                    {shippingCourier === "Other" && (
                      <input
                        type="text"
                        placeholder="Enter Courier Name (e.g. Professional Courier)"
                        value={shippingCustomCourier}
                        onChange={(e) => setShippingCustomCourier(e.target.value)}
                        className="mt-2 w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-medium text-neutral-800 outline-none focus:border-black"
                        required
                      />
                    )}
                  </div>

                  {/* AWB / Tracking ID */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      AWB Tracking Number / Barcode Number*
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 142389102837 or BLU9827103"
                      value={shippingAwb}
                      onChange={(e) => setShippingAwb(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-mono font-bold text-neutral-900 outline-none focus:border-black"
                      required
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Customer can track this live on the MurtiPuja Track Order page using their phone number or Order ID.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setShippingModalOrder(null)}
                      className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={shippingSaving}
                      className="px-5 py-2 bg-black hover:bg-gold hover:text-black text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 shadow-md flex items-center gap-1.5"
                    >
                      {shippingSaving ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Saving...
                        </>
                      ) : (
                        "✓ Save & Update Tracking"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === "claims" && (
          <div className="grid md:grid-cols-12 gap-8 animate-fade-in">
            {/* List (Left) */}
            <div className="md:col-span-5 bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden h-[500px] overflow-y-auto">
              <div className="p-6 border-b border-charcoal/10 bg-charcoal/5">
                <h2 className="font-display text-base text-maroon font-bold">Claims Inbox</h2>
              </div>
              <div className="divide-y divide-charcoal/5">
                {claimOrders.length === 0 ? (
                  <p className="text-charcoal/50 p-6 text-center text-xs">No claims received.</p>
                ) : (
                  claimOrders.map((o) => (
                    <button
                      key={o._id}
                      onClick={() => { setSelectedOrder(o); setVideoVerified(o.returnRequest.unboxingVideoVerified); }}
                      className={`w-full text-left p-4 hover:bg-charcoal/5 transition-colors flex flex-col gap-1 text-xs border-l-4 ${selectedOrder?._id === o._id ? "bg-maroon/5 border-maroon" : "border-transparent"
                        } ${o.returnRequest.status === "requested" ? "font-semibold bg-yellow-50/50" : "opacity-60"}`}
                    >
                      <div className="flex justify-between w-full">
                        <span className="font-mono">{o.orderNumber}</span>
                        <span className="uppercase text-[9px] font-bold px-1.5 rounded bg-charcoal/10">
                          {o.returnRequest.requestType === "return" ? "Return" : "Exchange"} - {o.returnRequest.status}
                        </span>
                      </div>
                      <p className="text-charcoal/70 truncate">{o.returnRequest.reason}</p>
                      <p className="text-[10px] text-charcoal/40 mt-1">Requested: {new Date(o.returnRequest.requestedAt).toLocaleDateString("en-IN")}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Claims Review Panel (Right) */}
            <div className="md:col-span-7 bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm p-6 flex flex-col justify-between min-h-[500px]">
              {selectedOrder ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-lg text-maroon font-bold">Review Claim: {selectedOrder.orderNumber}</h3>
                    <p className="text-[10px] text-charcoal/40">Filed by customer (+91 {selectedOrder.user?.phone || selectedOrder.phone})</p>
                  </div>

                  <div className="bg-charcoal/5 p-4 rounded-xl text-xs space-y-3 leading-relaxed text-charcoal/80">
                    <p><strong>Claim Type:</strong> <span className="font-semibold uppercase text-maroon">{selectedOrder.returnRequest.requestType === "return" ? "Return & Refund" : "Exchange / Replacement"}</span></p>
                    <p><strong>Reason Category:</strong> <span className="font-semibold capitalize text-charcoal">{selectedOrder.returnRequest.claimReasonType || "Damage"}</span></p>
                    <p><strong>Customer Explanation:</strong> {selectedOrder.returnRequest.reason}</p>

                    {selectedOrder.returnRequest.requestType === "exchange" && selectedOrder.returnRequest.exchangeVariantSku && (
                      <p className="bg-white p-2 rounded border border-charcoal/10">
                        <strong>Requested Replacement SKU:</strong> <span className="font-mono text-maroon font-semibold">{selectedOrder.returnRequest.exchangeVariantSku}</span>
                      </p>
                    )}

                    {selectedOrder.returnRequest.claimReasonType === "damage" ? (
                      <div>
                        <strong>Compulsory Unboxing Video:</strong>
                        <div className="mt-2 p-3 bg-white rounded-lg border border-charcoal/15 flex items-center justify-between">
                          <a
                            href={selectedOrder.returnRequest.unboxingVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-maroon font-medium hover:underline truncate mr-2 text-[10px] block"
                          >
                            {selectedOrder.returnRequest.unboxingVideoUrl} ↗
                          </a>
                          <span className="text-[9px] bg-gold/15 text-gold font-bold px-2 py-0.5 rounded flex-shrink-0 uppercase">External Video Link</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-green-700 font-semibold bg-green-50 p-2 rounded">
                        ✓ No unboxing video required for size/color exchanges.
                      </p>
                    )}
                  </div>

                  {selectedOrder.returnRequest.status === "requested" ? (
                    <div className="space-y-4">
                      {/* Video Verification Checkbox (Only for damages) */}
                      {selectedOrder.returnRequest.claimReasonType === "damage" ? (
                        <label className="flex items-start gap-3 cursor-pointer select-none bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                          <input
                            type="checkbox"
                            checked={videoVerified}
                            onChange={(e) => setVideoVerified(e.target.checked)}
                            className="w-5 h-5 mt-0.5 accent-maroon border-charcoal/30 rounded focus:ring-maroon"
                          />
                          <div>
                            <p className="text-xs font-semibold text-yellow-800">Verify Unboxing Video Quality</p>
                            <p className="text-[10px] text-yellow-700/80 mt-0.5">
                              I verify that I have viewed the customer&apos;s unboxing video, verified that it is unedited, starts from a sealed package, and confirms transit damage.
                            </p>
                          </div>
                        </label>
                      ) : null}

                      {/* Approval/Rejection triggers */}
                      <div className="flex gap-3 justify-end pt-4">
                        <button
                          type="button"
                          disabled={reviewLoading}
                          onClick={() => handleReturnReview("rejected")}
                          className="px-5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold disabled:opacity-50"
                        >
                          Reject Claim
                        </button>
                        <button
                          type="button"
                          disabled={reviewLoading || (selectedOrder.returnRequest.claimReasonType === "damage" && !videoVerified)}
                          onClick={() => handleReturnReview("approved")}
                          className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 text-xs font-semibold disabled:opacity-50"
                        >
                          {reviewLoading ? "Reviewing..." : "Approve Return Request"}
                        </button>
                      </div>
                    </div>
                  ) : selectedOrder.returnRequest.status === "approved" ? (
                    <div className="space-y-4 bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-center">
                      <p className="text-xs font-semibold text-yellow-800">
                        📦 Claim is Approved (Pickup Initiated)
                      </p>
                      <p className="text-[10px] text-yellow-700 leading-relaxed">
                        The claim has been approved. Once the return product has physically arrived back at your warehouse, click the button below to verify receipt and complete the claim.
                      </p>
                      {selectedOrder.returnRequest.requestType === "return" ? (
                        <p className="text-[10px] font-semibold text-red-700">
                          ⚠️ This will automatically trigger the customer refund back to their bank card via Razorpay.
                        </p>
                      ) : (
                        <p className="text-[10px] font-semibold text-green-700">
                          ✓ This will complete the exchange and decrement 1 quantity from the replacement item's stock levels.
                        </p>
                      )}

                      <button
                        type="button"
                        disabled={receiveLoading}
                        onClick={handleReturnReceive}
                        className="mt-3 w-full bg-maroon text-white text-xs font-semibold py-3 rounded-xl hover:bg-maroon-dark shadow transition-all disabled:opacity-50"
                      >
                        {receiveLoading ? "Processing Reception..." : "Mark Returned Product Received at Warehouse"}
                      </button>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-xl text-center text-xs space-y-2 ${selectedOrder.returnRequest.status === "completed"
                      ? "bg-green-50 text-green-800"
                      : selectedOrder.returnRequest.status === "rejected"
                        ? "bg-red-50 text-red-800"
                        : "bg-blue-50 text-blue-800"
                      }`}>
                      <p>This claim has been processed and is marked as <strong>{selectedOrder.returnRequest.status.toUpperCase()}</strong>.</p>
                      {selectedOrder.paymentInfo?.razorpayRefundId && (
                        <p className="text-[10px] font-mono text-charcoal/50">Refund ID: {selectedOrder.paymentInfo.razorpayRefundId}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full text-charcoal/40 py-20">
                  <p className="text-sm">Select an order from the list to review the unboxing video and process return claims.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories & Subcategories Tab */}
        {activeTab === "categories" && (
          <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
            {/* Create / Edit Forms Column */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm space-y-5 h-fit">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-lg text-maroon font-bold">
                  {editingCategory
                    ? editingCategory.parentCategory
                      ? "✏️ Edit Subcategory"
                      : "✏️ Edit Main Category"
                    : "Category & Subcategory Manager"}
                </h3>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="text-[10px] text-charcoal/60 hover:text-black font-bold uppercase underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {/* Form Selector Tabs (Main Category Form vs Subcategory Form vs Product Tag Form vs Occasions Form) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl p-1 bg-white border border-slate-200 gap-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    if (!editingCategory) {
                      setNewCatParent("");
                    }
                    setCategoryFormTab("main");
                  }}
                  className={`py-1.5 px-2 text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 bg-white ${categoryFormTab === "main"
                    ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                    : "text-charcoal/70 border border-slate-200 hover:text-black hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <span>Main Cat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!editingCategory && !newCatParent) {
                      const firstMain = categories.find((c) => !c.parentCategory);
                      if (firstMain) setNewCatParent(firstMain._id);
                    }
                    setCategoryFormTab("sub");
                  }}
                  className={`py-1.5 px-2 text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 bg-white ${categoryFormTab === "sub"
                    ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                    : "text-charcoal/70 border border-slate-200 hover:text-black hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <span>Subcategory</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFormTab("tag");
                  }}
                  className={`py-1.5 px-2 text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 bg-white ${categoryFormTab === "tag"
                    ? "text-maroon font-black border-2 border-maroon shadow-xs ring-2 ring-maroon/10"
                    : "text-charcoal/70 border border-slate-200 hover:text-black hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <span>Product Tag</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFormTab("purpose");
                  }}
                  className={`py-1.5 px-2 text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 bg-white ${categoryFormTab === "purpose"
                    ? "text-purple-900 font-black border-2 border-purple-800 shadow-xs ring-2 ring-purple-500/10"
                    : "text-charcoal/70 border border-slate-200 hover:text-black hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <span>Occasion</span>
                </button>
              </div>

              {/* FORM 1: MAIN CATEGORY FORM */}
              {categoryFormTab === "main" ? (
                <form onSubmit={handleCreateCategory} className="space-y-3.5 animate-fade-in">
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-amber-950">Main Category Form</p>
                    <p className="text-[10.5px] text-amber-800 leading-snug">
                      Use this to create top-level categories like <strong>Car Desk Idol</strong>, <strong>Ram</strong>, <strong>Shiva</strong>, <strong>Ganesh</strong>, <strong>Krishna</strong>, <strong>Hanuman</strong>.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Main Category Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Car Desk Idol or Ram"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        if (!editingCategory) {
                          setNewCatSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "")
                          );
                        }
                      }}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">URL Slug *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. car-desk-idol"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value.toLowerCase())}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-mono text-charcoal/80"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Description (Optional)</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Premium devotional idols for car dashboard & desks"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={catLoading}
                    className="w-full bg-maroon hover:bg-maroon-dark text-white text-[11px] uppercase tracking-wider font-bold py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    {catLoading ? "Saving..." : editingCategory ? "Update Main Category" : "Create Main Category"}
                  </button>
                </form>
              ) : categoryFormTab === "sub" ? (
                /* FORM 2: SUBCATEGORY FORM */
                <form onSubmit={handleCreateCategory} className="space-y-3.5 animate-fade-in">
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-blue-950">Subcategory / Deity Murti Form</p>
                    <p className="text-[10.5px] text-blue-800 leading-snug">
                      Use this to add specific subcategories (e.g. <strong>Shiv</strong> under <strong>Car Desk Idol</strong>, or <strong>Lighting Murti</strong>).
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">
                      Parent Category * (Under which Main Category?)
                    </label>
                    <select
                      required
                      value={newCatParent}
                      onChange={(e) => {
                        const parentId = e.target.value;
                        setNewCatParent(parentId);
                        const parentCat = categories.find((c) => c._id === parentId);
                        if (parentCat && !editingCategory && newCatName) {
                          setNewCatSlug(
                            `${parentCat.slug}-${newCatName}`
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "")
                          );
                        }
                      }}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-1 focus:ring-gold text-xs font-bold text-charcoal"
                    >
                      <option value="">-- Select Parent Category (e.g. Car Desk Idol) --</option>
                      {categories
                        .filter((c) => !c.parentCategory && (!editingCategory || c._id !== editingCategory._id))
                        .map((parent) => (
                          <option key={parent._id} value={parent._id}>
                            {parent.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Subcategory Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shiv or Lighting Murti"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        if (!editingCategory) {
                          const parentCat = categories.find((c) => c._id === newCatParent);
                          const prefix = parentCat ? `${parentCat.slug}-` : "";
                          setNewCatSlug(
                            `${prefix}${e.target.value}`
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "")
                          );
                        }
                      }}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">URL Slug *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. car-desk-shiv or shiv"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value.toLowerCase())}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-mono text-charcoal/80"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Description (Optional)</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Lord Shiva idols designed for car dashboards & desks"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={catLoading}
                    className="w-full bg-blue-900 hover:bg-blue-950 text-white text-[11px] uppercase tracking-wider font-bold py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    {catLoading ? "Saving..." : editingCategory ? "Update Subcategory" : "Create Subcategory"}
                  </button>
                </form>
              ) : categoryFormTab === "tag" ? (
                /* FORM 3: PRODUCT TAG FORM */
                <form onSubmit={handleCreateOrUpdateTag} className="space-y-3.5 animate-fade-in">
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-emerald-950">
                      {editingTag ? "Edit Product Tag" : "Product Tag Form"}
                    </p>
                    <p className="text-[10.5px] text-emerald-800 leading-snug">
                      Use this to add searchable tags like <strong>Lighting Shiv</strong>, <strong>Bestseller</strong>, <strong>Limited Edition</strong>.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Tag Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lighting Shiv"
                      value={newTagName}
                      onChange={(e) => {
                        setNewTagName(e.target.value);
                        if (!editingTag) {
                          setNewTagSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "")
                          );
                        }
                      }}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Tag Slug *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. lighting-shiv"
                      value={newTagSlug}
                      onChange={(e) => setNewTagSlug(e.target.value.toLowerCase())}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-mono text-charcoal/80"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Description (Optional)</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Backlit halo and illuminated Shiv idols"
                      value={newTagDesc}
                      onChange={(e) => setNewTagDesc(e.target.value)}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={tagLoading || !newTagName.trim()}
                      className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] uppercase tracking-wider font-bold py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                    >
                      {tagLoading ? "Saving..." : editingTag ? "Update Tag" : "Create Product Tag"}
                    </button>
                    {editingTag && (
                      <button
                        type="button"
                        onClick={resetTagForm}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-charcoal text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                /* FORM 4: OCCASION / PURPOSE FORM */
                <form onSubmit={handleCreateOrUpdatePurpose} className="space-y-3.5 animate-fade-in">
                  <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-purple-950">
                      {editingPurpose ? "Edit Occasion / Purpose" : "Occasion / Purpose Form"}
                    </p>
                    <p className="text-[10.5px] text-purple-800 leading-snug">
                      Use this to add <strong>Shop by Occasions</strong> like <strong>Pooja Room</strong>, <strong>Car Dashboard</strong>, <strong>Griha Pravesh</strong>, <strong>Festive Puja</strong>, <strong>Corporate Gifting</strong>.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Occasion / Purpose Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Car Dashboard or Housewarming"
                      value={newPurposeName}
                      onChange={(e) => {
                        setNewPurposeName(e.target.value);
                        if (!editingPurpose) {
                          setNewPurposeSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "")
                          );
                        }
                      }}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Occasion Slug *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. car-dashboard or griha-pravesh"
                      value={newPurposeSlug}
                      onChange={(e) => setNewPurposeSlug(e.target.value.toLowerCase())}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-mono text-charcoal/80"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Description (Optional)</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Compact and auspicious idols suited for automobile dashboards and journeys"
                      value={newPurposeDesc}
                      onChange={(e) => setNewPurposeDesc(e.target.value)}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={purposeLoading || !newPurposeName.trim()}
                      className="flex-1 bg-purple-900 hover:bg-purple-950 text-white text-[11px] uppercase tracking-wider font-bold py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {purposeLoading ? "Saving..." : editingPurpose ? "Update Occasion" : "Create Occasion"}
                    </button>
                    {editingPurpose && (
                      <button
                        type="button"
                        onClick={resetPurposeForm}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-charcoal text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Categories & Subcategories List Table */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden md:col-span-2">
              <div className="p-6 border-b border-charcoal/10 bg-charcoal/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="font-display text-lg text-maroon font-bold">Categories & Subcategories</h2>
                  <p className="text-[10px] text-charcoal/50">Manage main deity categories and their specific product types (Lighting, Temple, Wall).</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-lg">
                    {categories.filter((c) => !c.parentCategory).length} Main Categories
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-900 border border-blue-300 font-bold px-2.5 py-1 rounded-lg">
                    {categories.filter((c) => c.parentCategory).length} Subcategories
                  </span>
                </div>
              </div>

              {categories.length === 0 ? (
                <p className="text-charcoal/50 p-8 text-center text-sm">No categories found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal/50 font-semibold">
                        <th className="p-4">Name</th>
                        <th className="p-4">Type / Hierarchy</th>
                        <th className="p-4">Slug</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/5">
                      {/* First display Main Categories and their nested subcategories directly underneath */}
                      {categories
                        .filter((c) => !c.parentCategory)
                        .map((mainCat) => {
                          const childSubCats = categories.filter(
                            (c) => c.parentCategory && (c.parentCategory._id === mainCat._id || c.parentCategory === mainCat._id)
                          );

                          return (
                            <div key={mainCat._id} style={{ display: "contents" }}>
                              {/* Main Category Row */}
                              <tr className="bg-amber-50/40 hover:bg-amber-50/80 transition-colors">
                                <td className="p-4 font-extrabold text-charcoal">
                                  <span className="text-sm text-maroon font-bold">{mainCat.name}</span>
                                </td>
                                <td className="p-4">
                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                    Main Category ({childSubCats.length} sub)
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-charcoal/60">/{mainCat.slug}</td>
                                <td className="p-4 text-right space-x-2">
                                  <button
                                    onClick={() => handleQuickAddSubcategory(mainCat._id)}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-900 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all"
                                    title={`Add Subcategory under ${mainCat.name}`}
                                  >
                                    + Add Sub
                                  </button>
                                  <button
                                    onClick={() => handleEditCategory(mainCat)}
                                    className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[10px]"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(mainCat._id)}
                                    className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px]"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>

                              {/* Child Subcategories Rows */}
                              {childSubCats.map((sub) => (
                                <tr key={sub._id} className="hover:bg-charcoal/5 transition-colors bg-white">
                                  <td className="p-4 font-medium text-charcoal pl-10 flex items-center gap-2">
                                    <span className="text-charcoal/30">↳</span>
                                    <span className="font-semibold text-xs text-charcoal/90">{sub.name}</span>
                                  </td>
                                  <td className="p-4">
                                    <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
                                      Sub under {mainCat.name}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-charcoal/50 text-[11px]">/{sub.slug}</td>
                                  <td className="p-4 text-right space-x-3">
                                    <button
                                      onClick={() => handleEditCategory(sub)}
                                      className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[10px]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(sub._id)}
                                      className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px]"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </div>
                          );
                        })}

                      {/* Orphan or Uncategorized Subcategories */}
                      {categories
                        .filter((c) => c.parentCategory && !categories.some((m) => !m.parentCategory && (m._id === c.parentCategory._id || m._id === c.parentCategory)))
                        .map((otherSub) => (
                          <tr key={otherSub._id} className="hover:bg-charcoal/5 transition-colors">
                            <td className="p-4 font-semibold text-charcoal">
                              <span>{otherSub.name}</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-neutral-100 text-neutral-800 border border-neutral-300">
                                Subcategory
                              </span>
                            </td>
                            <td className="p-4 font-mono text-charcoal/60">/{otherSub.slug}</td>
                            <td className="p-4 text-right space-x-3">
                              <button
                                onClick={() => handleEditCategory(otherSub)}
                                className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[10px]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(otherSub._id)}
                                className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px]"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Product Tags & Filter Badges Overview & Manager */}
              <div className="p-5 border-t border-charcoal/10 bg-amber-50/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <span>🏷️ Product Filter Tags & Badges Library</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                        {availableTags.length} Tags Active
                      </span>
                    </h4>
                    <p className="text-[10.5px] text-amber-800">
                      Manage tags like <strong>Lighting Shiv</strong>, <strong>Bestseller</strong>, <strong>Pooja Room</strong>, <strong>Car Dashboard</strong>. Used in Product Form, Navbar & Filters.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetTagForm();
                      setCategoryFormTab("tag");
                    }}
                    className="text-[10px] bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider self-start sm:self-auto cursor-pointer"
                  >
                    ➕ Add New Tag
                  </button>
                </div>

                {availableTags.length === 0 ? (
                  <div className="bg-white p-4 rounded-xl border border-dashed border-amber-300 text-center text-xs text-charcoal/60">
                    No custom tags created yet. Click "➕ Add New Tag" or use the Product Tag form on the left to create your first tag.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                    {availableTags.map((tagName) => {
                      const tagObj = tagObjects.find((t) => (typeof t === "string" ? t : t.name) === tagName) || {
                        name: tagName,
                        slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                      };

                      return (
                        <div
                          key={tagName}
                          className="bg-white p-3 rounded-xl border border-amber-300/80 shadow-2xs flex flex-col justify-between space-y-2 hover:border-amber-400 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-charcoal truncate">{tagName}</span>
                            <span className="text-[9px] font-mono text-charcoal/50 bg-amber-50 px-1.5 py-0.5 rounded">
                              /{tagObj.slug}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-charcoal/5 text-[10px]">
                            <Link
                              href={`/products?tag=${encodeURIComponent(tagName)}`}
                              target="_blank"
                              className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1"
                            >
                              <span>Live Filter</span>
                              <span className="text-[9px]">↗</span>
                            </Link>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditTag(tagObj)}
                                className="text-gold hover:text-gold/80 font-bold uppercase cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTag(tagObj)}
                                className="text-red-600 hover:text-red-800 font-bold uppercase cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Occasions & Purposes Overview & Manager */}
              <div className="p-5 border-t border-charcoal/10 bg-purple-50/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                      <span>🕉️ Shop by Occasions & Purpose Library</span>
                      <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">
                        {purposesList.length} Occasions Active
                      </span>
                    </h4>
                    <p className="text-[10.5px] text-purple-800">
                      Manage sacred placement occasions like <strong>Pooja Room</strong>, <strong>Mandir & Sanctum</strong>, <strong>Car Dashboard</strong>, <strong>Griha Pravesh</strong>, <strong>Diwali Puja</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetPurposeForm();
                      setCategoryFormTab("purpose");
                    }}
                    className="text-[10px] bg-purple-900 hover:bg-purple-950 text-white font-bold px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider self-start sm:self-auto cursor-pointer"
                  >
                    ➕ Add New Occasion
                  </button>
                </div>

                {purposesList.length === 0 ? (
                  <div className="bg-white p-4 rounded-xl border border-dashed border-purple-300 text-center text-xs text-charcoal/60">
                    No custom occasions created yet. Click "➕ Add New Occasion" or use the Occasions form on the left to create your first occasion.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                    {purposesList.map((p) => {
                      const pName = typeof p === "string" ? p : p.name;
                      const pSlug = typeof p === "string" ? p.toLowerCase().replace(/\s+/g, "-") : (p.slug || pName.toLowerCase().replace(/\s+/g, "-"));
                      const pObj = typeof p === "object" ? p : { name: pName, slug: pSlug, description: "" };

                      return (
                        <div
                          key={pObj._id || pSlug}
                          className="bg-white p-3 rounded-xl border border-purple-300/80 shadow-2xs flex flex-col justify-between space-y-2 hover:border-purple-400 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-charcoal truncate">{pName}</span>
                            <span className="text-[9px] font-mono text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded">
                              /{pSlug}
                            </span>
                          </div>

                          {pObj.description && (
                            <p className="text-[10px] text-neutral-500 line-clamp-2">{pObj.description}</p>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-charcoal/5 text-[10px]">
                            <Link
                              href={`/products?purpose=${encodeURIComponent(pSlug)}`}
                              target="_blank"
                              className="text-purple-800 hover:text-purple-950 font-bold flex items-center gap-1"
                            >
                              <span>Live Filter</span>
                              <span className="text-[9px]">↗</span>
                            </Link>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditPurpose(pObj)}
                                className="text-gold hover:text-gold/80 font-bold uppercase cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePurpose(pObj)}
                                className="text-red-600 hover:text-red-800 font-bold uppercase cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Finishes Tab */}
        {activeTab === "finishes" && (
          <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
            {/* Create / Edit Finish Form */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm space-y-4 h-fit">
              <h3 className="font-display text-lg text-maroon font-bold">
                {editingFinish ? "✏️ Edit Finish" : "➕ Create Finish"}
              </h3>
              <form onSubmit={handleCreateFinish} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60 block">Finish/Color Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Matte Black"
                    value={newFinishName}
                    onChange={(e) => {
                      setNewFinishName(e.target.value);
                      if (!editingFinish) {
                        setNewFinishSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                      }
                    }}
                    className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60 block">URL Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. matte-black"
                    value={newFinishSlug}
                    onChange={(e) => setNewFinishSlug(e.target.value.toLowerCase())}
                    className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60 block">Hex Color Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. #000000"
                      value={newFinishColor}
                      onChange={(e) => setNewFinishColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-mono"
                    />
                    <input
                      type="color"
                      value={newFinishColor.startsWith("#") && newFinishColor.length === 7 ? newFinishColor : "#ffffff"}
                      onChange={(e) => setNewFinishColor(e.target.value)}
                      className="w-10 h-8 rounded-xl border border-charcoal/15 p-0.5 cursor-pointer bg-transparent"
                    />
                  </div>
                  <p className="text-[9px] text-charcoal/40">Used for rendering premium storefront swatches.</p>
                </div>
                <div className="flex gap-2 pt-2">
                  {editingFinish && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFinish(null);
                        setNewFinishName("");
                        setNewFinishSlug("");
                        setNewFinishColor("");
                      }}
                      className="flex-1 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/80 text-[11px] uppercase tracking-wider font-bold py-2.5 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={finishLoading}
                    className="flex-2 w-full bg-maroon hover:bg-maroon-dark text-white text-[11px] uppercase tracking-wider font-bold py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    {finishLoading ? "Saving..." : editingFinish ? "Update Finish" : "Create Finish"}
                  </button>
                </div>
              </form>
            </div>

            {/* Finishes List Table */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden md:col-span-2">
              <div className="p-6 border-b border-charcoal/10 bg-charcoal/5">
                <h2 className="font-display text-lg text-maroon font-bold">All Finishes</h2>
              </div>
              {finishes.length === 0 ? (
                <p className="text-charcoal/50 p-8 text-center text-sm">No finishes configured.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal/50 font-semibold">
                        <th className="p-4">Name</th>
                        <th className="p-4">Slug</th>
                        <th className="p-4">Swatch</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/5">
                      {finishes.map((f) => (
                        <tr key={f._id} className="hover:bg-charcoal/5 transition-colors">
                          <td className="p-4 font-semibold text-charcoal">{f.name}</td>
                          <td className="p-4 font-mono text-charcoal/60">{f.slug}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block w-5 h-5 rounded-full border border-charcoal/10 shadow-sm"
                                style={{ backgroundColor: f.colorCode || "#eee" }}
                              />
                              <span className="font-mono text-[10px] text-charcoal/50">{f.colorCode || "N/A"}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right space-x-3">
                            <button
                              onClick={() => handleEditFinish(f)}
                              className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[10px]"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFinish(f._id)}
                              className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px]"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header controls for products */}
            <div className="flex justify-between items-center bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-charcoal/10 shadow-sm">
              <h3 className="font-display text-lg text-maroon font-bold">Product Catalog Management</h3>
              <button
                onClick={() => {
                  if (isAddingProduct) {
                    resetProductForm();
                  } else {
                    setIsAddingProduct(true);
                  }
                }}
                className="bg-maroon hover:bg-maroon-dark text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md"
              >
                {isAddingProduct ? "← View Product List" : "➕ Add New Product"}
              </button>
            </div>

            {isAddingProduct ? (
              /* Add/Edit Product Form */
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm w-full space-y-6">
                <div>
                  <h4 className="font-display text-base text-maroon font-bold">
                    {editingProduct ? `Edit Product: ${editingProduct.title}` : "Create New Spiritual Murti"}
                  </h4>
                  <p className="text-[10px] text-charcoal/50">
                    {editingProduct ? "Modify the product details and save changes." : "Enter the details of the murti and assign it to a category."}
                  </p>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-6">
                  {/* Grid fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Product Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Durga Maa Murti"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Deity / God (Series) *</label>
                        <span className="text-[9px] text-amber-700 font-bold">Powers Global Series Filtering</span>
                      </div>
                      <input
                        type="text"
                        required
                        list="deities-suggestions"
                        placeholder="e.g. Ram, Shiva, Ganesh, Krishna, Hanuman"
                        value={deity}
                        onChange={(e) => setDeity(e.target.value)}
                        className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-semibold"
                      />
                      <datalist id="deities-suggestions">
                        {availableDeities.map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Base Price (INR) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 1999"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Main Category *</label>
                        <button
                          type="button"
                          onClick={() => setQuickCatOpen(!quickCatOpen)}
                          className="text-[9.5px] bg-maroon/10 hover:bg-maroon hover:text-white text-maroon font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1"
                        >
                          <span>{quickCatOpen ? "✕ Close" : "➕ Quick Add Category"}</span>
                        </button>
                      </div>

                      {/* Quick Add Main Category Inline Box */}
                      {quickCatOpen && (
                        <div className="p-3 bg-amber-50/90 border-2 border-amber-300 rounded-xl space-y-2.5 my-1.5 shadow-sm animate-fade-in">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider">
                              ✨ New Deity / Main Category
                            </span>
                            <span className="text-[9px] text-amber-800 font-semibold">Instantly creates & selects</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Category Name (e.g. Ram, Shiva, Durga)"
                              value={quickCatName}
                              onChange={(e) => {
                                setQuickCatName(e.target.value);
                                setQuickCatSlug(
                                  e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/(^-|-$)/g, "")
                                );
                              }}
                              className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-gold text-xs font-semibold"
                            />
                            <input
                              type="text"
                              placeholder="Slug (e.g. ram, shiva)"
                              value={quickCatSlug}
                              onChange={(e) => setQuickCatSlug(e.target.value.toLowerCase())}
                              className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-gold text-xs font-mono"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={quickCatLoading || !quickCatName.trim()}
                              onClick={handleQuickCreateCategory}
                              className="bg-maroon hover:bg-maroon-dark text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all shadow disabled:opacity-50"
                            >
                              {quickCatLoading ? "Creating..." : "✓ Create & Assign Category"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setQuickCatOpen(false);
                                setQuickCatName("");
                                setQuickCatSlug("");
                              }}
                              className="text-[10px] text-charcoal/60 hover:text-black font-semibold underline px-2 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <select
                        required
                        value={selectedCatId}
                        onChange={(e) => {
                          const catId = e.target.value;
                          setSelectedCatId(catId);
                          const matchedCat = categories.find((c) => c._id === catId);
                          if (matchedCat && (!deity || deity === "General")) {
                            setDeity(matchedCat.name);
                          }
                          setFormVariants((prev) =>
                            prev.map((v) => ({
                              ...v,
                              sku: v.isCustomSku ? v.sku : computeVariantSku(v.size, v.finish, catId, selectedSubCatIds),
                            }))
                          );
                        }}
                        className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-semibold"
                      >
                        <option value="">Select Main Category...</option>
                        {categories
                          .filter((cat) => !cat.parentCategory)
                          .map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Subcategories & Murti Type Assignment */}
                  <div className="space-y-2 bg-charcoal/5 p-4 rounded-xl border border-charcoal/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/80 block">
                          Subcategory / Murti Types (Lighting, Temple, Wall, etc.)
                        </label>
                        <p className="text-[10px] text-charcoal/50">
                          Assign dynamic subcategories (e.g. <strong>Lighting Ram Murti</strong>, <strong>Temple / Mandir</strong>, <strong>Wall Murti</strong>).
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQuickSubParentId(selectedCatId);
                            setQuickSubOpen(!quickSubOpen);
                          }}
                          className="text-[9.5px] bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-900 font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1"
                        >
                          <span>{quickSubOpen ? "✕ Close" : "➕ Quick Add Subcategory"}</span>
                        </button>
                        <span className="text-[10px] bg-gold/15 text-gold font-bold px-2 py-0.5 rounded">
                          {selectedSubCatIds.length} Selected
                        </span>
                      </div>
                    </div>

                    {/* Quick Add Subcategory Inline Box */}
                    {quickSubOpen && (
                      <div className="p-3 bg-blue-50/90 border-2 border-blue-300 rounded-xl space-y-2.5 my-1.5 shadow-sm animate-fade-in">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black text-blue-950 uppercase tracking-wider">
                            ✨ New Subcategory / Murti Type
                          </span>
                          <span className="text-[9px] text-blue-800 font-semibold">Links under selected Category</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <select
                            value={quickSubParentId || selectedCatId}
                            onChange={(e) => setQuickSubParentId(e.target.value)}
                            className="w-full px-3 py-1.5 border border-blue-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-gold text-xs font-semibold"
                          >
                            <option value="">-- Parent Category --</option>
                            {categories
                              .filter((c) => !c.parentCategory)
                              .map((parent) => (
                                <option key={parent._id} value={parent._id}>
                                  {parent.name}
                                </option>
                              ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Subcategory Name (e.g. Lighting Murti)"
                            value={quickSubName}
                            onChange={(e) => {
                              setQuickSubName(e.target.value);
                              const pId = quickSubParentId || selectedCatId;
                              const parentCat = categories.find((c) => c._id === pId);
                              const prefix = parentCat ? `${parentCat.slug}-` : "";
                              setQuickSubSlug(
                                `${prefix}${e.target.value}`
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/(^-|-$)/g, "")
                              );
                            }}
                            className="w-full px-3 py-1.5 border border-blue-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-gold text-xs font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Slug (e.g. ram-lighting-murti)"
                            value={quickSubSlug}
                            onChange={(e) => setQuickSubSlug(e.target.value.toLowerCase())}
                            className="w-full px-3 py-1.5 border border-blue-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-gold text-xs font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={quickSubLoading || !quickSubName.trim() || !(quickSubParentId || selectedCatId)}
                            onClick={handleQuickCreateSubcategory}
                            className="bg-blue-900 hover:bg-blue-950 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all shadow disabled:opacity-50"
                          >
                            {quickSubLoading ? "Creating..." : "✓ Create & Assign Subcategory"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickSubOpen(false);
                              setQuickSubName("");
                              setQuickSubSlug("");
                            }}
                            className="text-[10px] text-charcoal/60 hover:text-black font-semibold underline px-2 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {categories
                        .filter((c) => c.parentCategory && (!selectedCatId || c.parentCategory._id === selectedCatId || c.parentCategory === selectedCatId))
                        .map((sub) => {
                          const isSelected = selectedSubCatIds.includes(sub._id);
                          return (
                            <button
                              key={sub._id}
                              type="button"
                              onClick={() => {
                                let newSubIds;
                                if (isSelected) {
                                  newSubIds = selectedSubCatIds.filter((id) => id !== sub._id);
                                } else {
                                  newSubIds = [...selectedSubCatIds, sub._id];
                                }
                                setSelectedSubCatIds(newSubIds);
                                setFormVariants((prev) =>
                                  prev.map((v) => ({
                                    ...v,
                                    sku: v.isCustomSku ? v.sku : computeVariantSku(v.size, v.finish, selectedCatId, newSubIds),
                                  }))
                                );
                              }}
                              className={`text-xs py-1.5 px-3 rounded-xl border font-semibold transition-all flex items-center gap-1.5 ${isSelected
                                ? "bg-maroon text-white border-maroon shadow-xs"
                                : "bg-white text-charcoal border-charcoal/15 hover:border-gold hover:text-gold"
                                }`}
                            >
                              <span>{sub.name}</span>
                              {isSelected ? <span>✓</span> : <span className="text-charcoal/30">+</span>}
                            </button>
                          );
                        })}
                      {categories.filter((c) => c.parentCategory).length === 0 && (
                        <p className="text-xs text-charcoal/40 italic">
                          No subcategories available. Click "+ Quick Add Subcategory" above to create one.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Description *</label>
                    <textarea
                      required
                      rows="3"
                      placeholder="Enter description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs"
                    />
                  </div>

                  {/* Product Gallery Videos Manager (Optional) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/80 block">
                        Product Videos (Optional - Spiritual Reels / 3D Views)
                      </label>
                      <span className="text-[10px] text-charcoal/50">
                        Optional · Showcased in dedicated grid on product details page
                      </span>
                    </div>
                    <div className="bg-charcoal/5 p-4 rounded-xl space-y-4">
                      {/* Video Upload Trigger */}
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="video/*"
                          id="product-video-upload"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setActionError("");
                              setProdLoading(true);
                              const uploadedUrl = await handleImageUpload(file);
                              if (uploadedUrl) {
                                setGalleryVideos((prev) => [...prev, { url: uploadedUrl }]);
                              }
                            } catch (err) {
                              setActionError("Failed to upload video. Please try again.");
                            } finally {
                              setProdLoading(false);
                              e.target.value = ""; // reset input
                            }
                          }}
                        />
                        <label
                          htmlFor="product-video-upload"
                          className="bg-maroon hover:bg-maroon-dark text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md inline-block"
                        >
                          🎥 Upload Video
                        </label>
                        <span className="text-[10px] text-charcoal/55">
                          Supports MP4, WebM, MOV. Max size recommended: 15MB.
                        </span>
                      </div>

                      {/* Videos Grid */}
                      {galleryVideos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {galleryVideos.map((vid, idx) => (
                            <div key={idx} className="relative aspect-video rounded-lg border border-charcoal/15 bg-white overflow-hidden group shadow-sm flex items-center justify-center">
                              <video src={vid.url} className="object-cover w-full h-full" muted playsInline />

                              {/* Play Icon Badge */}
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                                  <svg className="w-4 h-4 text-maroon fill-current translate-x-[1px]" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>

                              {/* Delete Overlay */}
                              <button
                                type="button"
                                onClick={() => setGalleryVideos((prev) => prev.filter((_, i) => i !== idx))}
                                className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow transition-opacity z-10"
                                title="Delete Video"
                              >
                                &times;
                              </button>

                              {/* Index overlay */}
                              <div className="absolute bottom-1 right-1 bg-black/40 text-white text-[9px] px-1 rounded z-10">
                                Video #{idx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-charcoal/40 text-xs border border-dashed border-charcoal/20 rounded-lg">
                          No videos uploaded yet. (Optional)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Default Variant SKU (Optional)</label>
                      <input
                        type="text"
                        placeholder="Auto-generated if left empty"
                        value={variantSku}
                        onChange={(e) => setVariantSku(e.target.value)}
                        className="w-full px-4 py-2 border border-charcoal/15 rounded-xl bg-transparent outline-none focus:ring-1 focus:ring-gold text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Product Badges & Tags Manager */}
                  <div className="space-y-3 bg-charcoal/5 p-4 rounded-xl border border-charcoal/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/80 block">
                          🏷️ Product Badges & Tags (Filters, Navbar & Highlights)
                        </label>
                        <p className="text-[10px] text-charcoal/50">
                          Select from popular spiritual tags or create custom tags (e.g. <strong>Bestseller</strong>, <strong>New Launch</strong>, <strong>Pooja Room</strong>, <strong>Car Dashboard</strong>, <strong>Gift Hamper</strong>).
                        </p>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded self-start sm:self-auto">
                        {productTags.length} Tags Selected
                      </span>
                    </div>

                    {/* Active Selected Tags Pills */}
                    {productTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-white rounded-lg border border-charcoal/10 shadow-2xs">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-charcoal/40">Active:</span>
                        {productTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 bg-black text-gold text-xs font-bold px-2.5 py-1 rounded shadow-xs"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProductTag(tag)}
                              className="text-white hover:text-red-400 font-black text-xs leading-none cursor-pointer"
                              title={`Remove ${tag}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Suggestion Pills */}
                    {availableTags.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9.5px] uppercase font-bold tracking-wider text-charcoal/60">
                          Click to add existing tags:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {availableTags.map((tag) => {
                            const isSelected = productTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    handleRemoveProductTag(tag);
                                  } else {
                                    handleAddProductTag(tag);
                                  }
                                }}
                                className={`text-xs py-1 px-2.5 rounded-lg border font-semibold transition-all flex items-center gap-1 ${
                                  isSelected
                                    ? "bg-black text-gold border-black shadow-xs font-bold"
                                    : "bg-white text-charcoal/80 border-charcoal/15 hover:border-black hover:text-black"
                                }`}
                              >
                                <span>{tag}</span>
                                {isSelected ? <span>✓</span> : <span className="text-charcoal/30">+</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Custom Tag Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Type custom tag (e.g. Ayodhya Ram, Diwali Gift, Marble Look)..."
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddProductTag(customTagInput);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 border border-charcoal/20 rounded-lg bg-white outline-none focus:ring-1 focus:ring-gold text-xs font-medium"
                      />
                      <button
                        type="button"
                        disabled={!customTagInput.trim()}
                        onClick={() => handleAddProductTag(customTagInput)}
                        className="bg-maroon hover:bg-maroon-dark text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all shadow disabled:opacity-40 shrink-0 cursor-pointer"
                      >
                        ＋ Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Promotion status */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60 block">Promotion Status</label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={isOnSale}
                        onChange={(e) => setIsOnSale(e.target.checked)}
                        className="accent-maroon rounded w-4 h-4"
                      />
                      <span className="text-maroon">Mark as On Sale (Pushes to "On Sale" collection)</span>
                    </label>
                  </div>

                  {/* Occasions & Purposes Dynamic Selector + Quick Add */}
                  <div className="space-y-3 bg-purple-50/40 p-4 rounded-xl border border-purple-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-wider text-purple-950 block">
                          🕉️ Shop by Occasions & Purpose
                        </label>
                        <p className="text-[10px] text-purple-800">
                          Select which placement and gifting purposes this idol fits into (used in drawer filters & shop-by-occasion).
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-300 font-bold px-2 py-0.5 rounded">
                          {purposes.length} Selected
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuickPurposeOpen(!quickPurposeOpen)}
                          className="text-[10px] font-bold text-purple-900 hover:text-purple-950 bg-white border border-purple-300 px-2 py-0.5 rounded shadow-2xs cursor-pointer"
                        >
                          {quickPurposeOpen ? "✕ Close" : "➕ Quick Add Occasion"}
                        </button>
                      </div>
                    </div>

                    {/* Quick Inline Occasion Creation Form */}
                    {quickPurposeOpen && (
                      <div className="p-3 bg-white rounded-lg border border-purple-300 space-y-2.5 animate-fade-in shadow-xs">
                        <p className="text-[11px] font-extrabold text-purple-950 uppercase tracking-wide">
                          ➕ Create New Occasion / Purpose
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Occasion Name (e.g. Diwali & Festive Puja)"
                            value={quickPurposeName}
                            onChange={(e) => {
                              setQuickPurposeName(e.target.value);
                              setQuickPurposeSlug(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/(^-|-$)/g, "")
                              );
                            }}
                            className="px-2.5 py-1.5 border border-purple-300 rounded text-xs outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                          />
                          <input
                            type="text"
                            placeholder="Slug (e.g. festive-puja)"
                            value={quickPurposeSlug}
                            onChange={(e) => setQuickPurposeSlug(e.target.value.toLowerCase())}
                            className="px-2.5 py-1.5 border border-purple-300 rounded text-xs outline-none focus:ring-1 focus:ring-purple-500 font-mono text-charcoal/70"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickPurposeOpen(false);
                              setQuickPurposeName("");
                              setQuickPurposeSlug("");
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold text-charcoal/60 hover:text-black uppercase"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleQuickCreatePurpose}
                            disabled={quickPurposeLoading || !quickPurposeName.trim()}
                            className="px-3 py-1 bg-purple-900 hover:bg-purple-950 text-white rounded text-[10.5px] font-bold uppercase tracking-wider shadow disabled:opacity-50"
                          >
                            {quickPurposeLoading ? "Saving..." : "✓ Create & Assign"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Purpose Checkboxes Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                      {purposesList.map((p) => {
                        const pName = typeof p === "string" ? p : p.name;
                        const pSlug = typeof p === "string" ? p.toLowerCase().replace(/\s+/g, "-") : (p.slug || pName.toLowerCase().replace(/\s+/g, "-"));
                        const isChecked = purposes.includes(pSlug) || purposes.includes(pName);

                        return (
                          <label
                            key={p._id || pSlug}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                              isChecked
                                ? "bg-purple-900 text-white border-purple-900 font-bold shadow-2xs"
                                : "bg-white text-charcoal/80 border-purple-200 hover:border-purple-400"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePurpose(pSlug)}
                              className="accent-purple-700 rounded"
                            />
                            <span className="truncate">{pName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Multiple Variants Manager with Per-Variant Multi-Image Upload */}
                  <div className="bg-charcoal/5 p-4 rounded-xl space-y-4 border border-charcoal/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal/10 pb-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-maroon flex items-center gap-1.5">
                          <span>🎨</span> Product Variants (Colors / Sizes & Multi-Images) *
                        </p>
                        <p className="text-[10px] text-charcoal/60 font-medium">
                          Upload specific photos for each variant with drag & drop or multi-selection. On the website, selecting a variant will show only its images.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const defSize = "6 inch";
                          const defFinish = finishes[0]?.name || "Matte Black";
                          const defSku = computeVariantSku(defSize, defFinish, selectedCatId, selectedSubCatIds);
                          setFormVariants([
                            ...formVariants,
                            {
                              size: defSize,
                              finish: defFinish,
                              price: "",
                              discountPrice: "",
                              stock: "10",
                              sku: defSku,
                              isCustomSku: false,
                              image: "",
                              images: [],
                            },
                          ]);
                        }}
                        className="bg-maroon hover:bg-maroon-dark text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <span>＋</span> Add Variant
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formVariants.map((v, index) => {
                        const vImages = Array.isArray(v.images) && v.images.length > 0 ? v.images : (v.image ? [v.image] : []);
                        const isDragging = draggingVariantIndex === index;

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-xl border transition-all space-y-3 bg-white shadow-xs ${
                              isDragging ? "border-amber-600 ring-2 ring-amber-400 bg-amber-50/40" : "border-charcoal/15"
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                              <span className="text-[11px] font-black uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-maroon text-white flex items-center justify-center text-[10px] font-bold">
                                  {index + 1}
                                </span>
                                Variant #{index + 1} {v.finish ? `(${v.finish} · ${v.size})` : ""}
                              </span>
                              {formVariants.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setFormVariants(formVariants.filter((_, idx) => idx !== index))}
                                  className="text-red-600 hover:text-red-800 text-[10.5px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                                  title="Remove Variant"
                                >
                                  ✕ Remove Variant
                                </button>
                              )}
                            </div>

                            {/* Row 1: Variant Specs */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 items-end">
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60 block">Size *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. 6 inch"
                                  value={v.size}
                                  onChange={(e) => {
                                    const newSize = e.target.value;
                                    const updated = [...formVariants];
                                    updated[index].size = newSize;
                                    if (!updated[index].isCustomSku) {
                                      updated[index].sku = computeVariantSku(newSize, updated[index].finish, selectedCatId, selectedSubCatIds);
                                    }
                                    setFormVariants(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-charcoal/15 rounded-lg bg-neutral-50/50 outline-none focus:bg-white text-xs font-semibold"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60 block">Finish / Color *</label>
                                <select
                                  required
                                  value={v.finish}
                                  onChange={(e) => {
                                    const newFinish = e.target.value;
                                    const updated = [...formVariants];
                                    updated[index].finish = newFinish;
                                    if (!updated[index].isCustomSku) {
                                      updated[index].sku = computeVariantSku(updated[index].size, newFinish, selectedCatId, selectedSubCatIds);
                                    }
                                    setFormVariants(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-charcoal/15 rounded-lg bg-neutral-50/50 outline-none focus:bg-white text-xs font-semibold"
                                >
                                  <option value="">Select Finish...</option>
                                  {finishes.map((f) => (
                                    <option key={f._id} value={f.name}>{f.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60 block">Price (₹)</label>
                                <input
                                  type="number"
                                  placeholder={basePrice || "Price"}
                                  value={v.price}
                                  onChange={(e) => {
                                    const updated = [...formVariants];
                                    updated[index].price = e.target.value;
                                    setFormVariants(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-charcoal/15 rounded-lg bg-neutral-50/50 outline-none focus:bg-white text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60 block">Sale Price (₹)</label>
                                <input
                                  type="number"
                                  placeholder="Discount"
                                  value={v.discountPrice || ""}
                                  onChange={(e) => {
                                    const updated = [...formVariants];
                                    updated[index].discountPrice = e.target.value;
                                    setFormVariants(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-charcoal/15 rounded-lg bg-neutral-50/50 outline-none focus:bg-white text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60 block">Stock *</label>
                                <input
                                  type="number"
                                  required
                                  value={v.stock}
                                  onChange={(e) => {
                                    const updated = [...formVariants];
                                    updated[index].stock = e.target.value;
                                    setFormVariants(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-charcoal/15 rounded-lg bg-neutral-50/50 outline-none focus:bg-white text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60 block">SKU (Auto)</label>
                                <input
                                  type="text"
                                  placeholder={computeVariantSku(v.size, v.finish, selectedCatId, selectedSubCatIds)}
                                  value={v.sku}
                                  onChange={(e) => {
                                    const updated = [...formVariants];
                                    updated[index].sku = e.target.value;
                                    updated[index].isCustomSku = !!e.target.value.trim();
                                    setFormVariants(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-charcoal/15 rounded-lg bg-neutral-50/50 outline-none focus:bg-white text-xs font-mono"
                                />
                              </div>
                            </div>

                            {/* Row 2: Per-Variant Multi-Image Upload Area & Drag & Drop */}
                            <div className="space-y-2 pt-1 border-t border-dashed border-charcoal/15">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <label className="text-[9.5px] uppercase font-black tracking-wider text-charcoal/80 flex items-center gap-1">
                                  <span>📸</span> Variant Images ({vImages.length} uploaded) *
                                </label>
                                <span className="text-[9px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                  Image #1 = Variant Primary Cover · Image #2 = Variant Hover
                                </span>
                              </div>

                              {/* Drag & Drop Dropzone for Variant */}
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDraggingVariantIndex(index);
                                }}
                                onDragEnter={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDraggingVariantIndex(index);
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDraggingVariantIndex(null);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDraggingVariantIndex(null);
                                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                    handleMultipleVariantImagesUpload(index, e.dataTransfer.files);
                                  }
                                }}
                                onClick={() => document.getElementById(`variant-multi-upload-${index}`)?.click()}
                                className={`p-4 border-2 border-dashed rounded-xl transition-all text-center flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer select-none ${
                                  isDragging
                                    ? "border-amber-600 bg-amber-50 ring-2 ring-amber-400"
                                    : "border-charcoal/20 bg-neutral-50/60 hover:border-black hover:bg-white"
                                }`}
                              >
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  id={`variant-multi-upload-${index}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      handleMultipleVariantImagesUpload(index, e.target.files);
                                    }
                                    e.target.value = "";
                                  }}
                                />

                                <div className="flex items-center gap-3 text-left">
                                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg text-amber-900 shrink-0">
                                    {isDragging ? "📥" : "📷"}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-black">
                                      {isDragging ? "Drop images here to upload!" : "Drag & Drop Multiple Images for this Variant"}
                                    </p>
                                    <p className="text-[10px] text-neutral-500 font-medium">
                                      or <span className="text-amber-800 font-bold underline">Click to Select Multiple Photos</span> at once
                                    </p>
                                  </div>
                                </div>

                                <span className="bg-maroon hover:bg-maroon-dark text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all shadow-xs shrink-0">
                                  Browse Images
                                </span>
                              </div>

                              {/* Thumbnails list for this variant */}
                              {vImages.length > 0 && (
                                <div className="space-y-2 pt-1">
                                  {/* Instructions banner */}
                                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-[9.5px] text-charcoal/70 bg-amber-50/80 border border-amber-200 rounded-lg p-2">
                                    <span className="flex items-center gap-1 font-bold text-amber-950">
                                      <span>⠿</span> <strong>Drag & Drop images</strong> to reorder, or use the <strong>Pos: #1 - #{vImages.length}</strong> dropdown on each photo to shift its position instantly.
                                    </span>
                                    <span className="text-[9px] text-amber-900 font-bold bg-amber-100/90 px-2 py-0.5 rounded">
                                      {vImages.length} Photos Uploaded
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {vImages.map((imgUrl, imgIdx) => {
                                      const src = typeof imgUrl === "object" ? imgUrl?.url : imgUrl;
                                      const isThisDragged = draggedImageInfo?.variantIndex === index && draggedImageInfo?.imageIndex === imgIdx;
                                      const isThisDragOver = dragOverTarget?.variantIndex === index && dragOverTarget?.imageIndex === imgIdx;

                                      return (
                                        <div
                                          key={imgIdx}
                                          draggable
                                          onDragStart={(e) => {
                                            e.dataTransfer.setData("text/plain", `${index}_${imgIdx}`);
                                            e.dataTransfer.effectAllowed = "move";
                                            setDraggedImageInfo({ variantIndex: index, imageIndex: imgIdx });
                                          }}
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            e.dataTransfer.dropEffect = "move";
                                            if (dragOverTarget?.variantIndex !== index || dragOverTarget?.imageIndex !== imgIdx) {
                                              setDragOverTarget({ variantIndex: index, imageIndex: imgIdx });
                                            }
                                          }}
                                          onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (dragOverTarget?.variantIndex === index && dragOverTarget?.imageIndex === imgIdx) {
                                              setDragOverTarget(null);
                                            }
                                          }}
                                          onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (draggedImageInfo && draggedImageInfo.variantIndex === index) {
                                              handleReorderVariantImage(index, draggedImageInfo.imageIndex, imgIdx);
                                            }
                                            setDraggedImageInfo(null);
                                            setDragOverTarget(null);
                                          }}
                                          onDragEnd={() => {
                                            setDraggedImageInfo(null);
                                            setDragOverTarget(null);
                                          }}
                                          className={`relative aspect-square rounded-xl border-2 bg-neutral-900 overflow-hidden group shadow-xs flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all select-none ${
                                            isThisDragOver
                                              ? "border-amber-600 ring-4 ring-gold bg-amber-100 scale-105 shadow-lg z-20"
                                              : isThisDragged
                                              ? "opacity-30 scale-95 border-dashed border-amber-600"
                                              : imgIdx === 0
                                              ? "border-black ring-2 ring-gold shadow-sm"
                                              : imgIdx === 1
                                              ? "border-amber-600 shadow-2xs"
                                              : "border-charcoal/20 hover:border-black/50"
                                          }`}
                                        >
                                          <img
                                            src={formatImageUrl(src)}
                                            alt={`Variant ${index + 1} Image ${imgIdx + 1}`}
                                            className="object-cover w-full h-full pointer-events-none"
                                          />

                                          {/* Top Floating Badges & Action Buttons */}
                                          <div className="absolute top-1 inset-x-1 flex items-center justify-between gap-1 z-10 pointer-events-auto">
                                            {/* Status Badge */}
                                            <div>
                                              {imgIdx === 0 ? (
                                                <span className="bg-black/90 text-gold text-[7.5px] font-black px-1.5 py-0.5 shadow uppercase border border-gold tracking-wider flex items-center gap-0.5 rounded">
                                                  🌟 1. Cover
                                                </span>
                                              ) : imgIdx === 1 ? (
                                                <span className="bg-amber-600 text-white text-[7.5px] font-black px-1.5 py-0.5 shadow uppercase tracking-wider rounded">
                                                  🔄 2. Hover
                                                </span>
                                              ) : (
                                                <span className="bg-black/80 text-white text-[8px] font-extrabold px-1.5 py-0.5 shadow rounded font-mono">
                                                  #{imgIdx + 1}
                                                </span>
                                              )}
                                            </div>

                                            <div className="flex items-center gap-1">
                                              {/* Quick Make Cover Button */}
                                              {imgIdx !== 0 && (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMakeCoverVariantImage(index, imgIdx);
                                                  }}
                                                  className="bg-black/80 hover:bg-gold hover:text-black text-gold text-[7.5px] font-black px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer uppercase"
                                                  title="Make this the primary cover image"
                                                >
                                                  ★ Cover
                                                </button>
                                              )}

                                              {/* Delete Button */}
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteVariantImage(index, imgIdx);
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shadow transition-transform active:scale-90 cursor-pointer"
                                                title="Delete Image"
                                              >
                                                &times;
                                              </button>
                                            </div>
                                          </div>

                                          {/* Drag Drop Target Overlay Badge */}
                                          {isThisDragOver && (
                                            <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center z-15 pointer-events-none">
                                              <span className="bg-black text-gold text-[9.5px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg border border-gold animate-bounce">
                                                📥 Drop Here (#{imgIdx + 1})
                                              </span>
                                            </div>
                                          )}

                                          {/* Bottom Position Number Changer & Arrows */}
                                          <div className="absolute bottom-0 inset-x-0 bg-black/90 backdrop-blur-xs px-1.5 py-1 z-10 text-white flex items-center justify-between gap-1 pointer-events-auto">
                                            {/* Move Left */}
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleMoveVariantImage(index, imgIdx, "left");
                                              }}
                                              disabled={imgIdx === 0}
                                              className="hover:text-gold disabled:opacity-20 text-[9px] font-black px-1 py-0.5 cursor-pointer"
                                              title="Move Left (Shift Position Earlier)"
                                            >
                                              ◀
                                            </button>

                                            {/* Position Selector Dropdown */}
                                            <div className="flex items-center gap-1">
                                              <span className="text-[7.5px] font-bold text-neutral-400 uppercase tracking-widest">Pos:</span>
                                              <select
                                                value={imgIdx + 1}
                                                onChange={(e) => {
                                                  const targetPos = parseInt(e.target.value, 10) - 1;
                                                  handleReorderVariantImage(index, imgIdx, targetPos);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="bg-white text-black text-[9px] font-black px-1 py-0.5 rounded border border-gold outline-none cursor-pointer"
                                                title="Change Position Number (e.g. make #1 into #3, or drag to last)"
                                              >
                                                {vImages.map((_, pIdx) => (
                                                  <option key={pIdx} value={pIdx + 1}>
                                                    #{pIdx + 1} {pIdx === 0 ? "(Cover)" : pIdx === 1 ? "(Hover)" : ""}
                                                  </option>
                                                ))}
                                              </select>
                                            </div>

                                            {/* Move Right */}
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleMoveVariantImage(index, imgIdx, "right");
                                              }}
                                              disabled={imgIdx === vImages.length - 1}
                                              className="hover:text-gold disabled:opacity-20 text-[9px] font-black px-1 py-0.5 cursor-pointer"
                                              title="Move Right (Shift Position Later)"
                                            >
                                              ▶
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Product Details Accordion Sections (Expandable drawers on Website) */}
                  <div className="space-y-4 bg-amber-50/50 p-5 rounded-xl border border-amber-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-200 pb-3">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                          <span>📑</span> Product Details Accordion Sections (Product Page Tabs)
                        </h4>
                        <p className="text-[10px] text-amber-800 font-medium">
                          These will show as interactive <strong>+ / − collapsible accordions</strong> on the website product details page.
                        </p>
                      </div>
                      <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded">
                        Live Preview Mode
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Section 1: Product Details */}
                      <div className="bg-white p-3.5 rounded-lg border border-amber-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-extrabold uppercase tracking-wide text-charcoal flex items-center gap-1">
                            <span>🔹</span> 1. Product Details / Specifications
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setProductDetails(`• Precision 3D Printed with 0.1mm micro-layer detail
• Deity: ${deity || "Sacred Series"}
• Intricate handcrafted finish inspected by skilled artisans
• Ideal for Home Mandir, Office Desk, Car Dashboard & Sacred Gifting
• Premium weighted base for absolute stability`);
                            }}
                            className="text-[9px] font-bold text-amber-900 hover:text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            ⚡ Auto-Fill Template
                          </button>
                        </div>
                        <textarea
                          rows="4"
                          placeholder={`Enter bullet points (start each line with • or -):\n• Precision 3D Printed with 0.1mm detail\n• Hand-inspected finish\n• Perfect for Mandir or Car Dashboard`}
                          value={productDetails}
                          onChange={(e) => setProductDetails(e.target.value)}
                          className="w-full px-3 py-2 border border-charcoal/15 rounded-lg bg-neutral-50 text-xs font-mono outline-none focus:ring-1 focus:ring-gold"
                        />
                      </div>

                      {/* Section 2: Materials & Care */}
                      <div className="bg-white p-3.5 rounded-lg border border-amber-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-extrabold uppercase tracking-wide text-charcoal flex items-center gap-1">
                            <span>🧼</span> 2. Materials & Care Instructions
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialsAndCare(`• Material: High-Density Premium Eco-Resin / Composite
• Finish: Protective Matte / Antique Hand-Applied Coat
• Care Instructions: Wipe gently with a soft, clean dry cloth
• Avoid using harsh chemical cleaners, alcohol, or direct prolonged water submersion
• Keep away from open flames or extreme direct heat`);
                            }}
                            className="text-[9px] font-bold text-amber-900 hover:text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            ⚡ Auto-Fill Template
                          </button>
                        </div>
                        <textarea
                          rows="4"
                          placeholder={`Enter care instructions:\n• Material: High-Density Eco-Resin\n• Wipe with clean dry cloth\n• Avoid direct water immersion`}
                          value={materialsAndCare}
                          onChange={(e) => setMaterialsAndCare(e.target.value)}
                          className="w-full px-3 py-2 border border-charcoal/15 rounded-lg bg-neutral-50 text-xs font-mono outline-none focus:ring-1 focus:ring-gold"
                        />
                      </div>

                      {/* Section 3: Shipping, Returns & Exchanges */}
                      <div className="bg-white p-3.5 rounded-lg border border-amber-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-extrabold uppercase tracking-wide text-charcoal flex items-center gap-1">
                            <span>📦</span> 3. Shipping, Returns & Exchanges
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setShippingReturns(`• Dispatch: Ships within 24 to 48 hours in shock-proof custom packaging
• Free Shipping: 100% Free insured express shipping across all India
• Delivery Timeline: Usually arrives within 3–5 business days
• 7-Day Replacement Policy: Easy replacement in case of transit damage or manufacturing defect
• Support: Dedicated WhatsApp support for instant order tracking and assistance`);
                            }}
                            className="text-[9px] font-bold text-amber-900 hover:text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            ⚡ Auto-Fill Template
                          </button>
                        </div>
                        <textarea
                          rows="4"
                          placeholder={`Enter shipping & return policy:\n• Dispatches in 24-48 hours\n• 100% Free Insured Delivery\n• 7-Day Replacement policy`}
                          value={shippingReturns}
                          onChange={(e) => setShippingReturns(e.target.value)}
                          className="w-full px-3 py-2 border border-charcoal/15 rounded-lg bg-neutral-50 text-xs font-mono outline-none focus:ring-1 focus:ring-gold"
                        />
                      </div>

                      {/* Custom Additional Accordion Tabs */}
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black uppercase tracking-wide text-amber-950">
                            ➕ Custom Additional Accordion Tabs
                          </span>
                          <button
                            type="button"
                            onClick={() => setAccordionSections([...accordionSections, { title: "", content: "" }])}
                            className="text-[10px] bg-amber-900 hover:bg-amber-950 text-white font-bold px-3 py-1 rounded shadow cursor-pointer transition-all"
                          >
                            ＋ Add Custom Tab
                          </button>
                        </div>

                        {accordionSections.map((sec, sIdx) => (
                          <div key={sIdx} className="bg-white p-3.5 rounded-lg border border-amber-300 space-y-2 relative shadow-xs">
                            <div className="flex justify-between items-center gap-2">
                              <input
                                type="text"
                                placeholder={`Tab Title (e.g. Sthapana Vidhi / Placement Guide)`}
                                value={sec.title}
                                onChange={(e) => {
                                  const updated = [...accordionSections];
                                  updated[sIdx].title = e.target.value;
                                  setAccordionSections(updated);
                                }}
                                className="flex-1 px-3 py-1.5 border border-amber-200 rounded text-xs font-bold uppercase tracking-wider outline-none focus:ring-1 focus:ring-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => setAccordionSections(accordionSections.filter((_, idx) => idx !== sIdx))}
                                className="text-red-500 hover:text-red-700 font-bold text-xs p-1"
                                title="Remove Tab"
                              >
                                ✕
                              </button>
                            </div>
                            <textarea
                              rows="3"
                              placeholder="Tab Content (bullet points or description)"
                              value={sec.content}
                              onChange={(e) => {
                                const updated = [...accordionSections];
                                updated[sIdx].content = e.target.value;
                                setAccordionSections(updated);
                              }}
                              className="w-full px-3 py-2 border border-charcoal/15 rounded-lg bg-neutral-50 text-xs font-mono outline-none focus:ring-1 focus:ring-gold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => resetProductForm()}
                      className="flex-1 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/80 text-[11px] uppercase tracking-wider font-bold py-3 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={prodLoading}
                      className="flex-2 w-full bg-maroon hover:bg-maroon-dark text-white text-[11px] uppercase tracking-wider font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                    >
                      {editingProduct ? (prodLoading ? "Updating Product..." : "Update Product") : (prodLoading ? "Saving Product..." : "Create Product")}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Products List Table */
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-charcoal/10 bg-charcoal/5">
                  <h2 className="font-display text-lg text-maroon font-bold">All Products</h2>
                </div>
                {products.length === 0 ? (
                  <p className="text-charcoal/50 p-8 text-center text-sm">No products found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal/50 font-semibold">
                          <th className="p-4">Murti Title</th>
                          <th className="p-4">Category & Subcategories</th>
                          <th className="p-4">Base Price</th>
                          <th className="p-4">Stock Levels</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal/5">
                        {products.map((p) => {
                          const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                          return (
                            <tr key={p._id} className="hover:bg-charcoal/5 transition-colors">
                              <td className="p-4 font-semibold text-charcoal">
                                <div>{p.title}</div>
                                {p.deity && <div className="text-[10px] text-charcoal/50 font-normal">{p.deity} Series</div>}
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1 items-center">
                                  {p.category && p.category.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                      📁 {typeof p.category[0] === "object" ? p.category[0].name : p.deity || "Category"}
                                    </span>
                                  )}
                                  {p.subCategory && p.subCategory.length > 0 ? (
                                    p.subCategory.map((sub, sIdx) => {
                                      const name = typeof sub === "object" ? sub.name : sub;
                                      const icon = typeof sub === "object" ? sub.icon : "";
                                      return (
                                        <span
                                          key={sIdx}
                                          className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200"
                                        >
                                          {icon ? `${icon} ` : ""}{name}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="text-[10px] text-charcoal/40 italic">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 font-semibold text-maroon">₹{p.basePrice}</td>
                              <td className="p-4 font-medium text-charcoal/60">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${totalStock === 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                  }`}>
                                  {totalStock} in stock
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-3">
                                <button
                                  onClick={() => handleEditProduct(p)}
                                  className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[10px]"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p._id)}
                                  className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px]"
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Combos Tab */}
        {activeTab === "combos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-charcoal/10 backdrop-blur-sm shadow-sm">
              <div>
                <h2 className="font-display text-xl text-maroon font-bold">Combo Offers</h2>
                <p className="text-xs text-charcoal/50">Manage dynamic product bundles and discounts.</p>
              </div>
              <button
                onClick={() => setIsAddingCombo(!isAddingCombo)}
                className="bg-maroon hover:bg-maroon-dark text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all uppercase tracking-wider"
              >
                {isAddingCombo ? "View Combos" : "＋ Create Combo Offer"}
              </button>
            </div>

            {isAddingCombo ? (
              /* Create Combo Form */
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-charcoal/10 shadow-sm w-full">
                <h3 className="font-display text-lg text-maroon font-bold mb-4">Create New Combo Offer</h3>
                <form onSubmit={handleCreateCombo} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal/60 mb-1">Combo Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shiva & Ganesh Divine Combo"
                      value={comboTitle}
                      onChange={(e) => setComboTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-charcoal/15 rounded-lg bg-white outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal/60 mb-1">Description</label>
                    <textarea
                      placeholder="e.g. Buy both murtis together and save 15%!"
                      value={comboDesc}
                      onChange={(e) => setComboDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-charcoal/15 rounded-lg bg-white outline-none text-xs h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal/60 mb-1">Select Products (At least 2) *</label>
                    <div className="border border-charcoal/15 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-white">
                      {products.map((p) => {
                        const isChecked = comboSelectedProds.includes(p._id);
                        return (
                          <label key={p._id} className="flex items-center gap-2 text-xs text-charcoal cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setComboSelectedProds(comboSelectedProds.filter((id) => id !== p._id));
                                } else {
                                  setComboSelectedProds([...comboSelectedProds, p._id]);
                                }
                              }}
                              className="rounded border-charcoal/15 text-maroon focus:ring-maroon"
                            />
                            <span>{p.title} (₹{p.basePrice})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">Discount Type *</label>
                      <select
                        value={comboDiscountType}
                        onChange={(e) => setComboDiscountType(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-lg bg-white outline-none text-xs"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">Discount Value *</label>
                      <input
                        type="number"
                        required
                        placeholder={comboDiscountType === "percentage" ? "e.g. 15" : "e.g. 300"}
                        value={comboDiscountValue}
                        onChange={(e) => setComboDiscountValue(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-lg bg-white outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="comboIsActive"
                      checked={comboIsActive}
                      onChange={(e) => setComboIsActive(e.target.checked)}
                      className="rounded border-charcoal/15 text-maroon focus:ring-maroon"
                    />
                    <label htmlFor="comboIsActive" className="text-xs font-semibold text-charcoal/60 cursor-pointer">
                      Activate this combo offer immediately
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCombo(false);
                        setComboSelectedProds([]);
                      }}
                      className="flex-1 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/80 text-[11px] uppercase tracking-wider font-bold py-3 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={comboLoading}
                      className="flex-2 w-full bg-maroon hover:bg-maroon-dark text-white text-[11px] uppercase tracking-wider font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                    >
                      {comboLoading ? "Creating Combo..." : "Create Combo"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Combo Offers List Table */
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-charcoal/10 bg-charcoal/5">
                  <h2 className="font-display text-lg text-maroon font-bold">Active Combos</h2>
                </div>
                {combos.length === 0 ? (
                  <p className="text-charcoal/50 p-8 text-center text-sm">No combo offers found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal/50 font-semibold">
                          <th className="p-4">Combo Title</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Included Products</th>
                          <th className="p-4">Discount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal/5">
                        {combos.map((combo) => (
                          <tr key={combo._id} className="hover:bg-charcoal/5 transition-colors">
                            <td className="p-4 font-semibold text-charcoal">{combo.title}</td>
                            <td className="p-4 text-charcoal/60 italic">{combo.description || "N/A"}</td>
                            <td className="p-4 text-charcoal/70">
                              <ul className="list-disc list-inside space-y-0.5">
                                {combo.products?.map((p) => (
                                  <li key={p._id} className="truncate max-w-[200px]" title={p.title}>
                                    {p.title}
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="p-4 font-semibold text-maroon">
                              {combo.discountType === "percentage" ? `${combo.discountValue}% Off` : `₹${combo.discountValue} Off`}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${combo.isActive ? "bg-green-100 text-green-800" : "bg-charcoal/10 text-charcoal/50"
                                }`}>
                                {combo.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-3">
                              <button
                                onClick={() => handleToggleCombo(combo)}
                                className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[10px]"
                              >
                                {combo.isActive ? "⏸ Pause" : "▶ Activate"}
                              </button>
                              <button
                                onClick={() => handleDeleteCombo(combo._id)}
                                className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px]"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Coupons / Promo Codes Management Tab */}
        {activeTab === "coupons" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm">
              <div>
                <h2 className="font-display text-xl text-maroon font-bold flex items-center gap-2">
                  <span>Coupons & Promo Codes</span>
                </h2>
                <p className="text-xs text-charcoal/60 mt-1">
                  Create and manage customer promo codes, discount percentages, flat ₹ savings, min cart value, and limits.
                </p>
              </div>
              {!isAddingCoupon && (
                <button
                  onClick={() => {
                    resetCouponForm();
                    setIsAddingCoupon(true);
                  }}
                  className="bg-maroon hover:bg-maroon-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>➕ Create New Coupon</span>
                </button>
              )}
            </div>

            {/* Add / Edit Coupon Form */}
            {isAddingCoupon ? (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm p-6 md:p-8 space-y-6">
                <div className="border-b border-charcoal/10 pb-3 flex justify-between items-center">
                  <h3 className="font-display text-base text-maroon font-bold">
                    {editingCoupon ? `Edit Coupon Code: ${editingCoupon.code}` : "Create New Coupon Code"}
                  </h3>
                  <button
                    onClick={resetCouponForm}
                    className="text-xs text-charcoal/50 hover:text-charcoal font-bold uppercase"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleSaveCoupon} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Coupon Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. FESTIVE10, MURTI500"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs font-mono font-bold uppercase"
                      />
                      <p className="text-[10px] text-charcoal/40 mt-1">Uppercase alphanumeric characters only.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Discount Type *
                      </label>
                      <select
                        value={couponDiscountType}
                        onChange={(e) => setCouponDiscountType(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      >
                        <option value="percentage">Percentage Discount (%)</option>
                        <option value="flat">Flat Discount (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder={couponDiscountType === "percentage" ? "e.g. 10 (for 10%)" : "e.g. 500 (for ₹500)"}
                        value={couponDiscountValue}
                        onChange={(e) => setCouponDiscountValue(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs font-bold text-maroon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Minimum Cart Value (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 999 (0 for no limit)"
                        value={couponMinOrder}
                        onChange={(e) => setCouponMinOrder(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      />
                      <p className="text-[10px] text-charcoal/40 mt-1">Cart value required before discount applies.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={couponExpiry}
                        onChange={(e) => setCouponExpiry(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Max Usage Limit (Optional)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 100 (leave blank for unlimited)"
                        value={couponUsageLimit}
                        onChange={(e) => setCouponUsageLimit(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-charcoal/80">
                      <input
                        type="checkbox"
                        checked={couponIsActive}
                        onChange={(e) => setCouponIsActive(e.target.checked)}
                        className="rounded text-maroon focus:ring-maroon w-4 h-4"
                      />
                      <span>Active / Available for Customer Checkout</span>
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-charcoal/10">
                    <button
                      type="button"
                      onClick={resetCouponForm}
                      className="flex-1 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/80 text-[11px] uppercase tracking-wider font-bold py-3 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="flex-2 w-full bg-maroon hover:bg-maroon-dark text-white text-[11px] uppercase tracking-wider font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                    >
                      {couponLoading ? "Saving Coupon..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Coupons List Table */
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-charcoal/10 bg-charcoal/5 flex justify-between items-center">
                  <h2 className="font-display text-lg text-maroon font-bold">All Promo Coupons</h2>
                  <span className="text-xs font-semibold text-charcoal/50">{coupons.length} total codes</span>
                </div>
                {coupons.length === 0 ? (
                  <p className="text-charcoal/50 p-8 text-center text-sm">No coupons found. Create your first promo code above!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal/50 font-semibold">
                          <th className="p-4">Coupon Code</th>
                          <th className="p-4">Discount Value</th>
                          <th className="p-4">Min. Cart Value</th>
                          <th className="p-4">Expiry Date</th>
                          <th className="p-4">Usage Stats</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal/5">
                        {coupons.map((c) => {
                          const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();
                          return (
                            <tr key={c._id} className="hover:bg-charcoal/5 transition-colors">
                              <td className="p-4">
                                <span className="font-mono font-bold bg-neutral-100 text-charcoal px-2.5 py-1 rounded text-xs border border-charcoal/15 tracking-wider">
                                  {c.code}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-maroon">
                                {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                              </td>
                              <td className="p-4 text-charcoal/70">
                                {c.minOrderValue > 0 ? `₹${c.minOrderValue}` : "No Minimum"}
                              </td>
                              <td className="p-4">
                                {c.expiryDate ? (
                                  <span className={isExpired ? "text-red-600 font-bold" : "text-charcoal/70"}>
                                    {new Date(c.expiryDate).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                    {isExpired && " (Expired)"}
                                  </span>
                                ) : (
                                  <span className="text-charcoal/50">Never</span>
                                )}
                              </td>
                              <td className="p-4 text-charcoal/70">
                                {c.usedCount || 0} / {c.usageLimit !== null && c.usageLimit !== undefined ? `${c.usageLimit} uses` : "Unlimited"}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${isExpired
                                    ? "bg-red-100 text-red-800 border border-red-200"
                                    : c.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-charcoal/10 text-charcoal/50"
                                    }`}
                                >
                                  {isExpired ? "Expired (Paused)" : c.isActive ? "Active" : "Paused"}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-3">
                                <button
                                  onClick={() => handleEditCoupon(c)}
                                  className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[10px]"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleToggleCoupon(c)}
                                  className="text-charcoal hover:text-charcoal/80 font-bold uppercase tracking-wider text-[10px]"
                                >
                                  {isExpired ? "⚠️ Expired" : c.isActive ? "⏸ Pause" : "▶ Activate"}
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(c._id)}
                                  className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px]"
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Special & Automatic Offers Management Tab */}
        {activeTab === "offers" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm">
              <div>
                <h2 className="font-display text-xl text-maroon font-bold flex items-center gap-2">
                  <span>🎉 Special & Automatic Store Offers</span>
                </h2>
                <p className="text-xs text-charcoal/60 mt-1">
                  Create automatic cart offers that trigger without needing a code (Store-wide, Category-based, or Deity-based).
                </p>
              </div>
              {!isAddingOffer && (
                <button
                  onClick={() => {
                    resetOfferForm();
                    setIsAddingOffer(true);
                  }}
                  className="bg-maroon hover:bg-maroon-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>➕ Create Special Offer</span>
                </button>
              )}
            </div>

            {/* Add / Edit Offer Form */}
            {isAddingOffer ? (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm p-6 md:p-8 space-y-6">
                <div className="border-b border-charcoal/10 pb-3 flex justify-between items-center">
                  <h3 className="font-display text-base text-maroon font-bold">
                    {editingOffer ? `Edit Offer: ${editingOffer.title}` : "Create New Special Offer"}
                  </h3>
                  <button
                    onClick={resetOfferForm}
                    className="text-xs text-charcoal/50 hover:text-charcoal font-bold uppercase"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleSaveOffer} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Offer Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Festive Ganesh Chaturthi Offer"
                        value={offerTitle}
                        onChange={(e) => setOfferTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Offer Description / Tagline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10% off automatically applied on checkout above ₹1999"
                        value={offerDesc}
                        onChange={(e) => setOfferDesc(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Discount Type *
                      </label>
                      <select
                        value={offerDiscountType}
                        onChange={(e) => setOfferDiscountType(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      >
                        <option value="percentage">Percentage Discount (%)</option>
                        <option value="flat">Flat Discount (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder={offerDiscountType === "percentage" ? "e.g. 15 (for 15%)" : "e.g. 300 (for ₹300)"}
                        value={offerDiscountValue}
                        onChange={(e) => setOfferDiscountValue(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs font-bold text-maroon"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Minimum Cart Value (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1999 (0 for any cart)"
                        value={offerMinOrder}
                        onChange={(e) => setOfferMinOrder(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Target Deity (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ganesha, Shiva, Krishna (leave blank for all deities)"
                        value={offerDeity}
                        onChange={(e) => setOfferDeity(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      />
                      <p className="text-[10px] text-charcoal/40 mt-1">If specified, applies only to items of this deity.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Expiry Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={offerExpiry}
                        onChange={(e) => setOfferExpiry(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-charcoal/80">
                      <input
                        type="checkbox"
                        checked={offerIsActive}
                        onChange={(e) => setOfferIsActive(e.target.checked)}
                        className="rounded text-maroon focus:ring-maroon w-4 h-4"
                      />
                      <span>Active / Automatically Trigger in Cart & Checkout</span>
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-charcoal/10">
                    <button
                      type="button"
                      onClick={resetOfferForm}
                      className="flex-1 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/80 text-[11px] uppercase tracking-wider font-bold py-3 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={offerLoading}
                      className="flex-2 w-full bg-maroon hover:bg-maroon-dark text-white text-[11px] uppercase tracking-wider font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                    >
                      {offerLoading ? "Saving Offer..." : editingOffer ? "Update Offer" : "Create Offer"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Offers List Table */
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-charcoal/10 bg-charcoal/5 flex justify-between items-center">
                  <h2 className="font-display text-lg text-maroon font-bold">All Special Offers</h2>
                  <span className="text-xs font-semibold text-charcoal/50">{offers.length} total offers</span>
                </div>
                {offers.length === 0 ? (
                  <p className="text-charcoal/50 p-8 text-center text-sm">No special offers found. Create your first automatic offer above!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal/50 font-semibold">
                          <th className="p-4">Offer Title & Info</th>
                          <th className="p-4">Discount</th>
                          <th className="p-4">Conditions</th>
                          <th className="p-4">Expiry Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal/5">
                        {offers.map((o) => {
                          const isExpired = o.expiryDate && new Date(o.expiryDate) < new Date();
                          return (
                            <tr key={o._id} className="hover:bg-charcoal/5 transition-colors">
                              <td className="p-4">
                                <p className="font-bold text-charcoal">{o.title}</p>
                                {o.description && <p className="text-[11px] text-charcoal/50 mt-0.5">{o.description}</p>}
                              </td>
                              <td className="p-4 font-bold text-maroon">
                                {o.discountType === "percentage" ? `${o.discountValue}% OFF` : `₹${o.discountValue} FLAT OFF`}
                              </td>
                              <td className="p-4 text-charcoal/70">
                                <p>Min: {o.minOrderValue > 0 ? `₹${o.minOrderValue}` : "None"}</p>
                                {o.applicableDeity && (
                                  <span className="inline-block mt-0.5 text-[10px] bg-charcoal/5 border border-charcoal/10 px-1.5 py-0.5 rounded text-charcoal/70">
                                    Deity: {o.applicableDeity}
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                {o.expiryDate ? (
                                  <span className={isExpired ? "text-red-600 font-bold" : "text-charcoal/70"}>
                                    {new Date(o.expiryDate).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                    {isExpired && " (Expired)"}
                                  </span>
                                ) : (
                                  <span className="text-charcoal/50">Ongoing</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${isExpired
                                    ? "bg-red-100 text-red-800 border border-red-200"
                                    : o.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-charcoal/10 text-charcoal/50"
                                    }`}
                                >
                                  {isExpired ? "Expired (Paused)" : o.isActive ? "Active" : "Paused"}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-3">
                                <button
                                  onClick={() => handleEditOffer(o)}
                                  className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[10px]"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleToggleOffer(o)}
                                  className="text-charcoal hover:text-charcoal/80 font-bold uppercase tracking-wider text-[10px]"
                                >
                                  {isExpired ? "⚠️ Expired" : o.isActive ? "⏸ Pause" : "▶ Activate"}
                                </button>
                                <button
                                  onClick={() => handleDeleteOffer(o._id)}
                                  className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px]"
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Bar Management Tab */}
        {activeTab === "nav-menu" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm">
              <div>
                <h2 className="font-display text-xl text-maroon font-bold flex items-center gap-2">
                  <span>🧭 Navigation Bar & Sub-Menus</span>
                </h2>
                <p className="text-xs text-charcoal/60 mt-1">
                  Manage main header links, badges, categories dropdown, and custom sub-menus dynamically.
                </p>
              </div>
              {!isAddingNavItem && (
                <button
                  onClick={() => {
                    resetNavForm();
                    setIsAddingNavItem(true);
                  }}
                  className="bg-maroon hover:bg-maroon-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>➕ Add Nav Item</span>
                </button>
              )}
            </div>

            {/* Add / Edit Form */}
            {isAddingNavItem ? (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm p-6 md:p-8 space-y-6">
                <div className="border-b border-charcoal/10 pb-3 flex justify-between items-center">
                  <h3 className="font-display text-base text-maroon font-bold">
                    {editingNavItem ? `Edit Navigation Item: ${editingNavItem.title}` : "Add New Navigation Item"}
                  </h3>
                  <button
                    onClick={resetNavForm}
                    className="text-xs text-charcoal/50 hover:text-charcoal font-bold uppercase"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleSaveNavItem} className="space-y-6">
                  {/* Basic Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shop by God, Brass Idols"
                        value={navTitle}
                        onChange={(e) => setNavTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Target URL / Route
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /products, /wishlist"
                        value={navUrl}
                        onChange={(e) => setNavUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      />
                      <p className="text-[10px] text-charcoal/40 mt-1">Leave empty if purely a parent dropdown menu</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Display Order (Sort)
                      </label>
                      <input
                        type="number"
                        value={navOrder}
                        onChange={(e) => setNavOrder(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal/60 mb-1">
                        Highlight Badge (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HOT, NEW, DROP, SALE"
                        value={navBadge}
                        onChange={(e) => setNavBadge(e.target.value)}
                        className="w-full px-3 py-2 border border-charcoal/15 rounded-xl bg-white outline-none focus:ring-2 focus:ring-gold text-xs uppercase"
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-charcoal/80">
                        <input
                          type="checkbox"
                          checked={navIsActive}
                          onChange={(e) => setNavIsActive(e.target.checked)}
                          className="rounded text-maroon focus:ring-maroon w-4 h-4"
                        />
                        <span>Active / Visible in Header</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-charcoal/80">
                        <input
                          type="checkbox"
                          checked={navIsDropdown}
                          onChange={(e) => setNavIsDropdown(e.target.checked)}
                          className="rounded text-maroon focus:ring-maroon w-4 h-4"
                        />
                        <span>Enable Sub-Menu Dropdown</span>
                      </label>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  {navIsDropdown && (
                    <div className="p-5 bg-charcoal/5 rounded-2xl border border-charcoal/10 space-y-5">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-maroon uppercase tracking-wider">
                          Dropdown Type
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                            <input
                              type="radio"
                              name="dropdownType"
                              value="categories"
                              checked={navDropdownType === "categories"}
                              onChange={() => setNavDropdownType("categories")}
                              className="text-maroon focus:ring-maroon"
                            />
                            <span>Automatic Categories (Fetches live deities/gods from database)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                            <input
                              type="radio"
                              name="dropdownType"
                              value="custom"
                              checked={navDropdownType === "custom"}
                              onChange={() => setNavDropdownType("custom")}
                              className="text-maroon focus:ring-maroon"
                            />
                            <span>Custom Sub-Menu Links</span>
                          </label>
                        </div>
                      </div>

                      {/* Custom Sub-Items Builder */}
                      {navDropdownType === "custom" && (
                        <div className="space-y-4 pt-2">
                          <div className="border-t border-charcoal/10 pt-4">
                            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                              Sub-Menu Items ({navSubItems.length})
                            </h4>

                            {navSubItems.length === 0 ? (
                              <p className="text-[11px] text-charcoal/40 italic mb-4">
                                No sub-menu links added yet. Use the inputs below to add sub-items.
                              </p>
                            ) : (
                              <div className="space-y-2 mb-4">
                                {navSubItems.map((sub, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-charcoal/10 text-xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="font-bold text-charcoal/40 w-5">#{index + 1}</span>
                                      <span className="font-bold text-charcoal">{sub.title}</span>
                                      <span className="text-charcoal/50 text-[11px]">→ {sub.url}</span>
                                      {sub.badge && (
                                        <span className="bg-gold text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                                          {sub.badge}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSubItem(index)}
                                      className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                                    >
                                      ✕ Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Sub-Item Row */}
                            <div className="p-4 bg-white rounded-xl border border-charcoal/10 space-y-3">
                              <p className="text-[11px] font-bold text-charcoal uppercase">Add a Sub-Menu Link</p>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                <input
                                  type="text"
                                  placeholder="Sub-menu Title (e.g. Daily Pooja)"
                                  value={subTitle}
                                  onChange={(e) => setSubTitle(e.target.value)}
                                  className="px-3 py-2 border border-charcoal/15 rounded-lg text-xs outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Sub-menu URL (e.g. /products?purpose=daily)"
                                  value={subUrl}
                                  onChange={(e) => setSubUrl(e.target.value)}
                                  className="px-3 py-2 border border-charcoal/15 rounded-lg text-xs outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Badge (optional)"
                                  value={subBadge}
                                  onChange={(e) => setSubBadge(e.target.value)}
                                  className="px-3 py-2 border border-charcoal/15 rounded-lg text-xs outline-none uppercase"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddSubItem}
                                  className="bg-black hover:bg-gold hover:text-black text-white text-xs font-bold uppercase rounded-lg px-4 py-2 transition-all"
                                >
                                  ➕ Add Sub-Item
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex gap-4 pt-4 border-t border-charcoal/10">
                    <button
                      type="button"
                      onClick={resetNavForm}
                      className="px-6 py-2.5 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/80 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={navLoading}
                      className="px-8 py-2.5 bg-maroon hover:bg-maroon-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
                    >
                      {navLoading ? "Saving..." : editingNavItem ? "Update Navigation Item" : "Save Navigation Item"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Navigation Items List Table */
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-charcoal/10 bg-charcoal/5 flex justify-between items-center">
                  <h3 className="font-display text-sm md:text-base text-maroon font-bold">
                    Active Header Navigation Structure
                  </h3>
                  <span className="text-xs text-charcoal/50 font-semibold">
                    {navMenuItems.length} Total Items
                  </span>
                </div>

                {navMenuItems.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <p className="text-xs text-charcoal/50">No navigation items configured.</p>
                    <button
                      onClick={() => {
                        resetNavForm();
                        setIsAddingNavItem(true);
                      }}
                      className="text-xs font-bold text-maroon underline uppercase"
                    >
                      Create first nav item
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal/50 font-semibold">
                          <th className="p-4 w-16">Order</th>
                          <th className="p-4">Menu Title</th>
                          <th className="p-4">URL / Path</th>
                          <th className="p-4">Menu Type & Sub-items</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal/5">
                        {navMenuItems.map((item) => (
                          <tr key={item._id} className="hover:bg-charcoal/5 transition-colors">
                            <td className="p-4 font-mono font-bold text-charcoal/60">
                              #{item.order || 0}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-charcoal text-sm">{item.title}</span>
                                {item.badge && (
                                  <span className="bg-gold text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 font-mono text-charcoal/70 text-[11px]">
                              {item.url || <span className="text-charcoal/30 italic">No direct link (Dropdown)</span>}
                            </td>
                            <td className="p-4">
                              {item.isDropdown ? (
                                <div className="space-y-1">
                                  <span className="inline-block bg-charcoal/10 text-charcoal font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                                    {item.dropdownType === "categories" ? "⚡ Dynamic Categories" : `📂 Custom (${item.subItems?.length || 0} links)`}
                                  </span>
                                  {item.dropdownType === "custom" && item.subItems?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {item.subItems.map((sub, sIdx) => (
                                        <span
                                          key={sIdx}
                                          className="text-[9.5px] bg-white border border-charcoal/10 text-charcoal/70 px-1.5 py-0.2 rounded"
                                        >
                                          {sub.title}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-charcoal/50 text-[11px]">Direct Link</span>
                              )}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleNavItemActive(item)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${item.isActive
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-charcoal/10 text-charcoal/50 hover:bg-charcoal/20"
                                  }`}
                              >
                                {item.isActive ? "● Active" : "○ Inactive"}
                              </button>
                            </td>
                            <td className="p-4 text-right space-x-3">
                              <button
                                onClick={() => handleEditNavItem(item)}
                                className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[11px]"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteNavItem(item._id)}
                                className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[11px]"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hero Banners Management Tab */}
        {activeTab === "banners" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm">
              <div>
                <h2 className="font-display text-lg md:text-xl text-maroon font-bold">
                  Hero Banners & Campaigns
                </h2>
                <p className="text-xs text-charcoal/60 mt-1">
                  Configure dynamic high-impact hero banners, slider carousels, CTA links, and badges for the homepage.
                </p>
              </div>
              {!isAddingBanner && (
                <button
                  onClick={() => {
                    resetBannerForm();
                    setIsAddingBanner(true);
                  }}
                  className="bg-maroon hover:bg-maroon-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
                >
                  <span>➕</span> Add New Banner
                </button>
              )}
            </div>

            {/* Banner Create / Edit Form */}
            {isAddingBanner ? (
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-charcoal/10 pb-4">
                  <div>
                    <h3 className="font-display text-base text-maroon font-bold">
                      {editingBanner ? "✏️ Edit Hero Banner" : "✨ Create New Hero Banner"}
                    </h3>
                    <p className="text-xs text-charcoal/50">
                      Customize headline typography, background artwork, and primary/secondary action buttons.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetBannerForm}
                    className="text-xs font-bold text-charcoal/60 hover:text-maroon uppercase tracking-wider"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleSaveBanner} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Content */}
                    <div className="space-y-4">
                      {/* Tagline */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                          Tagline / Collection Badge
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. DIVINITY. CRAFTED. or FESTIVE DROP 2026"
                          value={bannerTagline}
                          onChange={(e) => setBannerTagline(e.target.value)}
                          className="w-full px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon uppercase tracking-widest"
                        />
                      </div>

                      {/* Headline / Title */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                          Main Headline / Title *
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. SACRED MURTIS, MODERN SOUL."
                          value={bannerTitle}
                          onChange={(e) => setBannerTitle(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon font-bold font-serif"
                        />
                        <span className="text-[10px] text-charcoal/40">Tip: Keep it short and impactful.</span>
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                          Subtitle / Brief Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Handcrafted brass, black matte, and pure gold finishes designed for mindful everyday spaces."
                          value={bannerSubtitle}
                          onChange={(e) => setBannerSubtitle(e.target.value)}
                          className="w-full px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon"
                        />
                      </div>

                      {/* Badge / Pill Text */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                            Corner Badge
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. NEW DROP, 20% OFF"
                            value={bannerBadge}
                            onChange={(e) => setBannerBadge(e.target.value)}
                            className="w-full px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                            Position
                          </label>
                          <select
                            value={bannerPosition}
                            onChange={(e) => setBannerPosition(e.target.value)}
                            className="w-full px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon bg-white"
                          >
                            <option value="hero">Hero Top Banner</option>
                            <option value="middle">Middle Promo Banner</option>
                            <option value="footer">Footer Banner</option>
                          </select>
                        </div>
                      </div>

                      {/* Order & Active Status */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={bannerOrder}
                            onChange={(e) => setBannerOrder(e.target.value)}
                            className="w-full px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon"
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-6">
                          <input
                            type="checkbox"
                            id="bannerIsActive"
                            checked={bannerIsActive}
                            onChange={(e) => setBannerIsActive(e.target.checked)}
                            className="w-4 h-4 text-maroon rounded focus:ring-maroon accent-maroon cursor-pointer"
                          />
                          <label htmlFor="bannerIsActive" className="text-xs font-bold text-charcoal cursor-pointer">
                            Banner Is Active
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Media & CTAs */}
                    <div className="space-y-4">
                      {/* Image Upload & URL */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                          Banner Background Image *
                        </label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Image URL (e.g. /images/hero-shiva.png or https://...)"
                              value={bannerImageUrl}
                              onChange={(e) => setBannerImageUrl(e.target.value)}
                              required
                              className="flex-1 px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon"
                            />
                            <label className="bg-charcoal/10 hover:bg-charcoal/20 text-charcoal px-4 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors flex items-center shrink-0">
                              {bannerUploading ? "Uploading..." : "📁 Browse"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={bannerUploading}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setBannerUploading(true);
                                    try {
                                      const url = await handleImageUpload(file);
                                      if (url) setBannerImageUrl(url);
                                    } catch (err) {
                                      setActionError("Failed to upload banner image.");
                                    } finally {
                                      setBannerUploading(false);
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Primary CTA */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                            Primary CTA Text
                          </label>
                          <input
                            type="text"
                            placeholder="EXPLORE COLLECTION"
                            value={bannerCtaText}
                            onChange={(e) => setBannerCtaText(e.target.value)}
                            className="w-full px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                            Primary CTA Link
                          </label>
                          <input
                            type="text"
                            placeholder="/shop or /products/..."
                            value={bannerCtaLink}
                            onChange={(e) => setBannerCtaLink(e.target.value)}
                            className="w-full px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon"
                          />
                        </div>
                      </div>

                      {/* Secondary CTA */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                            Secondary CTA Text
                          </label>
                          <input
                            type="text"
                            placeholder="VIEW ALL DEITIES (Optional)"
                            value={bannerSecCtaText}
                            onChange={(e) => setBannerSecCtaText(e.target.value)}
                            className="w-full px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                            Secondary CTA Link
                          </label>
                          <input
                            type="text"
                            placeholder="/categories or /combos"
                            value={bannerSecCtaLink}
                            onChange={(e) => setBannerSecCtaLink(e.target.value)}
                            className="w-full px-4 py-2.5 border border-charcoal/15 rounded-xl text-xs outline-none focus:border-maroon"
                          />
                        </div>
                      </div>

                      {/* Live Card Preview */}
                      <div className="pt-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-2">
                          Live Banner Preview
                        </label>
                        <div className="relative rounded-xl overflow-hidden bg-stone-900 border border-charcoal/15 aspect-[21/9] sm:aspect-[24/9] flex items-center p-6 text-white shadow-inner">
                          {bannerImageUrl ? (
                            <img
                              src={formatImageUrl(bannerImageUrl)}
                              alt="Preview"
                              className="absolute inset-0 w-full h-full object-cover opacity-60"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-stone-900 opacity-60" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                          <div className="relative z-10 max-w-sm space-y-2">
                            {bannerTagline && (
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                                {bannerTagline}
                              </span>
                            )}
                            <h4 className="font-serif text-sm sm:text-base font-bold text-white line-clamp-2 leading-tight">
                              {bannerTitle || "Headline Text"}
                            </h4>
                            {bannerSubtitle && (
                              <p className="text-[10px] text-white/80 line-clamp-1">
                                {bannerSubtitle}
                              </p>
                            )}
                            <div className="flex gap-2 pt-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-white text-black px-3 py-1 rounded">
                                {bannerCtaText || "EXPLORE"}
                              </span>
                              {bannerSecCtaText && (
                                <span className="text-[9px] font-bold uppercase tracking-wider border border-white/60 text-white px-3 py-1 rounded">
                                  {bannerSecCtaText}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-4 pt-4 border-t border-charcoal/10">
                    <button
                      type="button"
                      onClick={resetBannerForm}
                      className="px-6 py-2.5 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/80 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bannerLoading || bannerUploading}
                      className="px-8 py-2.5 bg-maroon hover:bg-maroon-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
                    >
                      {bannerLoading ? "Saving..." : editingBanner ? "Update Banner" : "Publish Banner"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Banners Table & Cards */
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-charcoal/10 bg-charcoal/5 flex justify-between items-center">
                  <h3 className="font-display text-sm md:text-base text-maroon font-bold">
                    Active Banners & Sliders
                  </h3>
                  <span className="text-xs text-charcoal/50 font-semibold">
                    {banners.length} Total Banners
                  </span>
                </div>

                {banners.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <p className="text-xs text-charcoal/50">No banners configured yet.</p>
                    <button
                      onClick={() => {
                        resetBannerForm();
                        setIsAddingBanner(true);
                      }}
                      className="text-xs font-bold text-maroon underline uppercase"
                    >
                      Create First Banner
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal/50 font-semibold">
                          <th className="p-4 w-16 text-center">Order</th>
                          <th className="p-4 w-28">Preview</th>
                          <th className="p-4">Banner Details</th>
                          <th className="p-4">CTA Buttons</th>
                          <th className="p-4">Position</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal/5">
                        {banners.map((banner, index) => (
                          <tr key={banner._id} className="hover:bg-charcoal/5 transition-colors">
                            {/* Order & Up/Down */}
                            <td className="p-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-mono font-bold text-charcoal/80 text-xs">
                                  #{banner.order || index + 1}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleMoveBanner(index, "up")}
                                    disabled={index === 0}
                                    title="Move Up"
                                    className="p-1 text-charcoal/40 hover:text-maroon disabled:opacity-20 text-[10px]"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => handleMoveBanner(index, "down")}
                                    disabled={index === banners.length - 1}
                                    title="Move Down"
                                    className="p-1 text-charcoal/40 hover:text-maroon disabled:opacity-20 text-[10px]"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Image Thumbnail */}
                            <td className="p-4">
                              <div className="w-24 h-14 rounded-lg bg-stone-900 border border-charcoal/15 overflow-hidden relative shadow-sm">
                                {banner.imageUrl ? (
                                  <img
                                    src={formatImageUrl(banner.imageUrl)}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-white/50">
                                    No Image
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Details */}
                            <td className="p-4">
                              <div className="space-y-1">
                                {banner.tagline && (
                                  <span className="text-[10px] font-bold text-[#B8860B] uppercase tracking-wider block">
                                    {banner.tagline}
                                  </span>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-charcoal text-sm">{banner.title}</span>
                                  {banner.badge && (
                                    <span className="bg-gold text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                                      {banner.badge}
                                    </span>
                                  )}
                                </div>
                                {banner.subtitle && (
                                  <p className="text-charcoal/60 text-[11px] line-clamp-1">
                                    {banner.subtitle}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* CTAs */}
                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-charcoal/10 text-charcoal text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase">
                                    1: {banner.ctaText || "EXPLORE"}
                                  </span>
                                  <span className="text-charcoal/40 font-mono text-[10px] truncate max-w-[100px]">
                                    {banner.ctaLink}
                                  </span>
                                </div>
                                {banner.secondaryCtaText && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="bg-charcoal/5 text-charcoal/80 text-[9.5px] font-medium px-1.5 py-0.5 rounded uppercase">
                                      2: {banner.secondaryCtaText}
                                    </span>
                                    <span className="text-charcoal/40 font-mono text-[10px] truncate max-w-[100px]">
                                      {banner.secondaryCtaLink}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Position */}
                            <td className="p-4">
                              <span className="capitalize text-[11px] bg-charcoal/5 border border-charcoal/10 px-2 py-0.5 rounded text-charcoal/70">
                                {banner.position || "hero"}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleBannerActive(banner)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${banner.isActive
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-charcoal/10 text-charcoal/50 hover:bg-charcoal/20"
                                  }`}
                              >
                                {banner.isActive ? "● Active" : "○ Inactive"}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right space-x-3">
                              <button
                                onClick={() => handleEditBanner(banner)}
                                className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[11px]"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(banner._id)}
                                className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[11px]"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Video Reels Management Tab */}
        {activeTab === "videos" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Add Trigger */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-charcoal/10 shadow-sm">
              <div>
                <h2 className="font-display text-xl text-maroon font-bold">🎬 Video Reels Management</h2>
                <p className="text-xs text-charcoal/60 mt-1">
                  Upload & organize short 4K video reels with product tags and left/right scroll controls.
                </p>
              </div>
              <button
                onClick={() => {
                  if (isAddingVideo) {
                    resetVideoForm();
                  } else {
                    resetVideoForm();
                    setIsAddingVideo(true);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${isAddingVideo
                  ? "bg-charcoal/10 text-charcoal hover:bg-charcoal/20"
                  : "bg-maroon text-white hover:bg-maroon-dark shadow"
                  }`}
              >
                {isAddingVideo ? "✕ Cancel" : "+ Add New Video Reel"}
              </button>
            </div>

            {/* Video Create / Edit Form */}
            {isAddingVideo && (
              <form
                onSubmit={handleSaveVideo}
                className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-charcoal/10 shadow-md space-y-6 animate-fadeIn"
              >
                <div className="border-b border-charcoal/10 pb-4 flex justify-between items-center">
                  <h3 className="font-display text-base text-maroon font-bold">
                    {editingVideo ? `Edit Video Reel: ${editingVideo.title}` : "Upload New Video Reel"}
                  </h3>
                  <span className="text-[10px] text-charcoal/50 uppercase font-semibold">
                    Step {editingVideo ? "Update" : "Create"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                        Video Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="e.g. Obsidian Shiva 3D Carving"
                        className="w-full text-xs p-3 rounded-xl border border-charcoal/20 focus:border-maroon focus:ring-1 focus:ring-maroon bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                        Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={videoTagline}
                        onChange={(e) => setVideoTagline(e.target.value)}
                        placeholder="e.g. 0.1mm Micro-Precision SLA Timelapse"
                        className="w-full text-xs p-3 rounded-xl border border-charcoal/20 focus:border-maroon focus:ring-1 focus:ring-maroon bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                          Badge Label
                        </label>
                        <input
                          type="text"
                          value={videoBadge}
                          onChange={(e) => setVideoBadge(e.target.value)}
                          placeholder="e.g. 4K REEL, 0.1MM TIMELAPSE"
                          className="w-full text-xs p-3 rounded-xl border border-charcoal/20 focus:border-maroon focus:ring-1 focus:ring-maroon bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                          placeholder="e.g. 0:45"
                          className="w-full text-xs p-3 rounded-xl border border-charcoal/20 focus:border-maroon focus:ring-1 focus:ring-maroon bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                        Product Link / Redirect URL
                      </label>
                      <input
                        type="text"
                        value={videoProductLink}
                        onChange={(e) => setVideoProductLink(e.target.value)}
                        placeholder="e.g. /products?deity=Shiva"
                        className="w-full text-xs p-3 rounded-xl border border-charcoal/20 focus:border-maroon focus:ring-1 focus:ring-maroon bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={videoOrder}
                          onChange={(e) => setVideoOrder(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-charcoal/20 focus:border-maroon focus:ring-1 focus:ring-maroon bg-white"
                        />
                      </div>

                      <div className="flex items-center pt-6">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={videoIsActive}
                            onChange={(e) => setVideoIsActive(e.target.checked)}
                            className="w-4 h-4 accent-maroon rounded"
                          />
                          <span className="text-xs font-bold text-charcoal/80 uppercase tracking-wider">
                            Active in Carousel
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Video Upload & Live Preview */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                        Video File Upload or Video URL *
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://... or upload video below"
                          className="w-full text-xs p-3 rounded-xl border border-charcoal/20 focus:border-maroon focus:ring-1 focus:ring-maroon bg-white font-mono"
                        />
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-neutral-800 hover:bg-stone-200 cursor-pointer shadow-sm">
                            <span>📁 Choose Video File (MP4/WebM)</span>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoFileUpload}
                              className="hidden"
                            />
                          </label>
                          {videoUploading && (
                            <span className="text-xs text-amber-700 font-bold animate-pulse">
                              ⏳ Uploading video...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                        Thumbnail / Poster Image URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={videoThumbnailUrl}
                        onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                        placeholder="e.g. /images/shiva.png"
                        className="w-full text-xs p-3 rounded-xl border border-charcoal/20 focus:border-maroon focus:ring-1 focus:ring-maroon bg-white font-mono"
                      />
                    </div>

                    {/* Live Video Player Preview */}
                    <div>
                      <label className="block text-xs font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                        Live Video Preview
                      </label>
                      <div className="w-full h-48 sm:h-56 bg-neutral-900 rounded-none overflow-hidden relative flex items-center justify-center border-2 border-black shadow-inner">
                        {videoUrl ? (
                          <video
                            src={formatImageUrl(videoUrl)}
                            poster={formatImageUrl(videoThumbnailUrl) || undefined}
                            controls
                            playsInline
                            className="w-full h-full object-cover rounded-none"
                          />
                        ) : (
                          <div className="text-center text-white/40 space-y-1">
                            <span className="text-3xl block">🎥</span>
                            <p className="text-xs font-medium">Enter video URL or choose file to preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/10">
                  <button
                    type="button"
                    onClick={resetVideoForm}
                    className="px-5 py-2.5 rounded-none border border-charcoal/20 text-charcoal/70 hover:bg-charcoal/5 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={videoLoading || videoUploading}
                    className="px-7 py-2.5 rounded-none bg-maroon text-white hover:bg-maroon-dark text-xs font-bold uppercase tracking-wider transition-all shadow disabled:opacity-50"
                  >
                    {videoLoading ? "Saving Reel..." : editingVideo ? "Update Video Reel" : "Publish Video Reel"}
                  </button>
                </div>
              </form>
            )}

            {/* Video List Table */}
            {!isAddingVideo && (
              <div className="bg-white/70 backdrop-blur-md rounded-none border border-charcoal/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-charcoal/10 bg-charcoal/5 flex justify-between items-center">
                  <h3 className="font-display text-sm text-maroon font-bold uppercase tracking-wider">
                    Published Video Reels ({videoReels.length})
                  </h3>
                  <span className="text-[10px] bg-charcoal/10 text-charcoal font-bold px-2 py-0.5 rounded-none">
                    Horizontal Carousel Active
                  </span>
                </div>

                {videoReels.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <span className="text-4xl block">🎬</span>
                    <p className="text-xs text-charcoal/50">No video reels added yet.</p>
                    <button
                      onClick={() => {
                        resetVideoForm();
                        setIsAddingVideo(true);
                      }}
                      className="text-xs font-bold text-maroon underline uppercase"
                    >
                      Upload First Reel
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal/50 font-semibold">
                          <th className="p-4 w-16 text-center">Order</th>
                          <th className="p-4 w-28">Preview</th>
                          <th className="p-4">Reel Details</th>
                          <th className="p-4">Badge & Duration</th>
                          <th className="p-4">Product Link</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal/5">
                        {videoReels.map((video, index) => (
                          <tr key={video._id} className="hover:bg-charcoal/5 transition-colors">
                            {/* Order & Reorder Arrows */}
                            <td className="p-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-mono font-bold text-charcoal/80 text-xs">
                                  #{video.order || index + 1}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleMoveVideo(index, "up")}
                                    disabled={index === 0}
                                    title="Move Up"
                                    className="p-1 text-charcoal/40 hover:text-maroon disabled:opacity-20 text-[10px]"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => handleMoveVideo(index, "down")}
                                    disabled={index === videoReels.length - 1}
                                    title="Move Down"
                                    className="p-1 text-charcoal/40 hover:text-maroon disabled:opacity-20 text-[10px]"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Video / Poster Thumbnail */}
                            <td className="p-4">
                              <div className="w-20 h-28 rounded-none bg-neutral-900 border border-charcoal/15 overflow-hidden relative shadow-sm flex items-center justify-center">
                                {video.videoUrl ? (
                                  <video
                                    src={formatImageUrl(video.videoUrl)}
                                    poster={formatImageUrl(video.thumbnailUrl) || undefined}
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover rounded-none"
                                  />
                                ) : (
                                  <span className="text-xl">🎬</span>
                                )}
                              </div>
                            </td>

                            {/* Title & Tagline */}
                            <td className="p-4">
                              <div className="space-y-1">
                                <span className="font-bold text-charcoal text-sm block">{video.title}</span>
                                {video.tagline && (
                                  <p className="text-charcoal/60 text-[11px] font-medium">{video.tagline}</p>
                                )}
                                <span className="text-charcoal/40 font-mono text-[10px] block truncate max-w-[200px]">
                                  {video.videoUrl}
                                </span>
                              </div>
                            </td>

                            {/* Badge & Duration */}
                            <td className="p-4">
                              <div className="space-y-1">
                                <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase block w-fit">
                                  {video.badge || "4K REEL"}
                                </span>
                                <span className="text-[10px] text-charcoal/50 font-mono block">
                                  ⏱ {video.duration || "0:30"}
                                </span>
                              </div>
                            </td>

                            {/* Product Link */}
                            <td className="p-4">
                              <span className="text-charcoal/70 font-mono text-[11px] bg-stone-100 px-2 py-1 rounded">
                                {video.productLink || "/products"}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleVideoActive(video)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${video.isActive
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-charcoal/10 text-charcoal/50 hover:bg-charcoal/20"
                                  }`}
                              >
                                {video.isActive ? "● Active" : "○ Inactive"}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right space-x-3">
                              <button
                                onClick={() => handleEditVideo(video)}
                                className="text-gold hover:text-gold/80 font-bold uppercase tracking-wider text-[11px]"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(video._id)}
                                className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[11px]"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Pages CMS Tab */}
        {activeTab === "pages" && (
          <PagesCmsManager />
        )}
      </main>
    </div>
  );
}
