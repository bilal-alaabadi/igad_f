import React, { useState } from "react";
import { useSelector } from "react-redux";
import TextInput from "./TextInput";
import SelectInput from "./SelectInput";
import UploadImage from "./UploadImage";
import { useAddProductMutation } from "../../../../redux/features/products/productsApi";
import { useNavigate } from "react-router-dom";

// التصنيفات المسموح بها فقط
const CATEGORY_OPTIONS = [
  { label: "اختر التصنيف", value: "" },
  { label: "حقائب", value: "حقائب" },
  { label: "كڤرات", value: "كڤرات" },
  { label: "حماية الشاشة", value: "حماية الشاشة" },
  { label: "إكسسوارات", value: "إكسسوارات" },
];

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [addProduct, { isLoading }] = useAddProductMutation();

  // حالة المنتج
  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    oldPrice: "",
    description: "",
  });

  // الصور
  const [images, setImages] = useState([]);

  // تغيير حقول النص/الرقم
  const handleChange = (e) => {
    const { name, value } = e.target;

    // منع القيم السالبة في الأسعار
    if ((name === "price" || name === "oldPrice") && Number(value) < 0) return;

    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // تحقق أساسي قبل الإرسال
  const validate = () => {
    const missing = [];
    if (!product.name?.trim()) missing.push("اسم المنتج");
    if (!product.category) missing.push("التصنيف");
    if (!String(product.price).trim()) missing.push("السعر");
    if (!product.description?.trim()) missing.push("الوصف");
    if (!images.length) missing.push("الصور");

    if (missing.length) {
      alert(`الرجاء تعبئة الحقول التالية: ${missing.join("، ")}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // تجهيز الحمولة: تحويل الأسعار لأرقام و oldPrice اختياري
    const payload = {
      name: product.name.trim(),
      category: product.category,
      price: Number(product.price),
      // إذا الحقل فاضي لا نرسله (أو أرسله undefined)
      ...(product.oldPrice !== "" ? { oldPrice: Number(product.oldPrice) } : {}),
      description: product.description.trim(),
      image: images, // نفس شكل انتظار الـ backend لديك
      author: user?._id,
    };

    try {
      await addProduct(payload).unwrap();
      alert("تمت إضافة المنتج بنجاح");

      // تصفير الحقول
      setProduct({
        name: "",
        category: "",
        price: "",
        oldPrice: "",
        description: "",
      });
      setImages([]);

      navigate("/shop");
    } catch (err) {
      console.error("Failed to submit product", err);
      alert("حدث خطأ أثناء إضافة المنتج");
    }
  };

  return (
    <div className="container mx-auto mt-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6">إضافة منتج جديد</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="اسم المنتج"
          name="name"
          placeholder="اكتب اسم المنتج"
          value={product.name}
          onChange={handleChange}
        />

        <SelectInput
          label="التصنيف"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={CATEGORY_OPTIONS}
        />

        <TextInput
          label="السعر"
          name="price"
          type="number"
          placeholder="مثال: 10"
          value={product.price}
          onChange={handleChange}
        />

        <TextInput
          label="السعر القديم (اختياري)"
          name="oldPrice"
          type="number"
          placeholder="مثال: 12"
          value={product.oldPrice}
          onChange={handleChange}
        />

        <UploadImage name="image" id="image" setImage={setImages} />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            وصف المنتج
          </label>
          <textarea
            id="description"
            name="description"
            className="add-product-InputCSS"
            rows={4}
            placeholder="اكتب وصف المنتج"
            value={product.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <button type="submit" className="add-product-btn" disabled={isLoading}>
            {isLoading ? "جاري الإضافة..." : "أضف المنتج"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
