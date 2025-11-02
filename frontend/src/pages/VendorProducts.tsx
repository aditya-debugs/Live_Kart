import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lambdaAPI from "../utils/lambdaAPI";
import { useAuth } from "../utils/AuthContext";
import VendorLayout from "../layouts/VendorLayout";
import toast, { Toaster } from "react-hot-toast";
import {
  validateImage,
  previewImage,
  compressImage,
  uploadImageToS3,
} from "../utils/directS3Upload";
import {
  PlusIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type Product = {
  product_id: string;
  name?: string;
  title?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  description?: string;
  vendorId?: string;
  vendor_id?: string;
};

export default function VendorProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadMyProducts();
  }, []);

  const loadMyProducts = async () => {
    try {
      const res = await lambdaAPI.getProducts();
      const vendorProducts = (res.products || []).filter(
        (p: any) =>
          p.vendorId === user?.username ||
          p.vendor_id === user?.username ||
          p.vendorId === user?.email ||
          p.vendor_id === user?.email
      );
      setMyProducts(vendorProducts);
    } catch (err) {
      console.error("Failed to load products", err);
      toast.error("Failed to load products");
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid image");
      e.target.value = "";
      return;
    }

    try {
      const preview = await previewImage(file);
      setImagePreview(preview);
      setImageFile(file);
    } catch (error) {
      console.error("Failed to preview image:", error);
      toast.error("Failed to preview image");
    }
  };

  const uploadToS3 = async (file: File): Promise<string> => {
    try {
      const compressedFile = await compressImage(file, 800, 800, 0.85);
      const result = await uploadImageToS3(compressedFile, (progress) => {
        setUploadProgress(progress.percentage);
      });

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Return the full S3 URL, not just the key
      return result.url;
    } catch (error) {
      console.error("S3 upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !editingProduct) {
      toast.error("Please select a product image");
      return;
    }

    setLoading(true);

    try {
      let imageKey = editingProduct?.imageUrl || "";

      if (imageFile) {
        imageKey = await uploadToS3(imageFile);
      }

      const productData = {
        title,
        description,
        price: parseFloat(price),
        category,
        imageUrl: imageKey,
      };

      if (editingProduct) {
        await lambdaAPI.updateProduct(editingProduct.product_id, productData);
        toast.success("Product updated successfully!");
      } else {
        await lambdaAPI.createProduct(productData);
        toast.success("Product added successfully!");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("Electronics");
      setImageFile(null);
      setImagePreview("");
      setUploadProgress(0);
      setEditingProduct(null);
      setShowAddModal(false);

      // Reload products
      await loadMyProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title || product.name || "");
    setDescription(product.description || "");
    setPrice(product.price.toString());
    setCategory(product.category || "Electronics");
    setImagePreview(product.imageUrl || "");
    setShowAddModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await lambdaAPI.deleteProduct(productId);
      toast.success("Product deleted successfully!");
      await loadMyProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("Electronics");
    setImageFile(null);
    setImagePreview("");
    setUploadProgress(0);
    setEditingProduct(null);
    setShowAddModal(false);
  };

  return (
    <VendorLayout>
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-2">Manage your product inventory</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-[#8C5630] text-white rounded-lg hover:bg-[#754626] transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>

        {/* Products Grid */}
        {myProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <PhotoIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first product
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[#8C5630] text-white rounded-lg hover:bg-[#754626] transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProducts.map((product) => (
              <div
                key={product.product_id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.title || product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {product.title || product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-[#8C5630]">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.product_id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    >
                      <option>Electronics</option>
                      <option>Fashion</option>
                      <option>Home & Living</option>
                      <option>Beauty</option>
                      <option>Sports</option>
                      <option>Books</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#8C5630] h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Uploading: {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-[#8C5630] text-white rounded-lg hover:bg-[#754626] transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingProduct
                      ? "Update Product"
                      : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
