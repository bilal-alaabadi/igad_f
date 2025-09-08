import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useFetchProductByIdQuery,
  useUpdateProductMutation,
} from "../../../../redux/features/products/productsApi";
import { useSelector } from "react-redux";
import TextInput from "../addProduct/TextInput";
import SelectInput from "../addProduct/SelectInput";
import UploadImage from "../addProduct/UploadImage";

const CATEGORY_OPTIONS = [
  { label: "اختر التصنيف", value: "" },
  { label: "حقائب", value: "حقائب" },
  { label: "كڤرات", value: "كڤرات" },
  { label: "حماية الشاشة", value: "حماية الشاشة" },
  { label: "إكسسوارات", value: "إكسسوارات" },
];

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const {
    data: productData,
    isLoading: isFetching,
    error: fetchError,
  } = useFetchProductByIdQuery(id);

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    oldPrice: "",
    description: "",
    image: [], // روابط/مسارات الصور الموجودة
  });

  // صور جديدة (File[]) من UploadImage
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    if (productData) {
      setProduct({
        name: productData.name || "",
        category: productData.category || "",
        price: productData.price?.toString() || "",
        oldPrice: productData.oldPrice?.toString() || "",
        description: productData.description || "",
        image: Array.isArray(productData.image) ? productData.image : [],
      });
    }
  }, [productData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === "price" || name === "oldPrice") && Number(value) < 0) return;

    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // تحقق أساسي
    const missing = [];
    if (!product.name?.trim()) missing.push("اسم المنتج");
    if (!product.category) missing.push("التصنيف");
    if (!String(product.price).trim()) missing.push("السعر");
    if (!product.description?.trim()) missing.push("الوصف");

    if (missing.length) {
      alert(`الرجاء تعبئة الحقول التالية: ${missing.join("، ")}`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", product.name.trim());
      formData.append("category", product.category);
      formData.append("price", product.price);
      formData.append("oldPrice", product.oldPrice || "");
      formData.append("description", product.description.trim());
      formData.append("author", user?._id || "");

      // لو رفع المستخدم صور جديدة => نرسلها (وسيتم استبدالها في السيرفر)
      if (newImages.length > 0) {
        newImages.forEach((img) => formData.append("image", img));
      } else {
        // لا توجد صور جديدة: نُمرّر الصور الحالية كروابط (سيحافظ السيرفر عليها)
        // ملاحظة: بعض backends ترفض body المختلط عند multipart،
        // لذلك نمرّرها كسلسلة JSON:
        formData.append("image", JSON.stringify(product.image || []));
      }

      await updateProduct({ id, body: formData }).unwrap();

      alert("تم تحديث المنتج بنجاح");
      navigate("/dashboard/manage-products");
    } catch (error) {
      console.error("فشل تحديث المنتج:", error);
      alert("حدث خطأ أثناء تحديث المنتج: " + (error?.data?.message || error.message));
    }
  };

  if (isFetching) return <div className="text-center py-8">جاري تحميل بيانات المنتج...</div>;
  if (fetchError)
    return <div className="text-center py-8 text-red-500">خطأ في تحميل بيانات المنتج</div>;

  return (
    <div className="container mx-auto mt-8 px-4" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-right">تحديث المنتج</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="اسم المنتج"
          name="name"
          placeholder="اكتب اسم المنتج"
          value={product.name}
          onChange={handleChange}
          required
        />

        <SelectInput
          label="التصنيف"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={CATEGORY_OPTIONS}
          required
        />

        <TextInput
          label="السعر"
          name="price"
          type="number"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
          required
        />

        <TextInput
          label="السعر القديم (اختياري)"
          name="oldPrice"
          type="number"
          placeholder="100"
          value={product.oldPrice}
          onChange={handleChange}
        />

        <UploadImage
          name="image"
          id="image"
          initialImages={product.image} // للمعاينة فقط
          setImages={setNewImages} // Files[] لو اختر المستخدم صور جديدة
        />

        <div className="text-right">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={product.description}
            placeholder="اكتب وصف المنتج"
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? "جاري التحديث..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
