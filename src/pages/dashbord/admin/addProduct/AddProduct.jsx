// ========================= src/components/admin/addProduct/AddProduct.jsx =========================
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import UploadImage from './UploadImage';
import { useAddProductMutation } from '../../../../redux/features/products/productsApi';
import { useNavigate } from 'react-router-dom';

const categories = [
  { label: "اختر التصنيف", value: "" },
  { label: "حقائب", value: "حقائب" },
  { label: "كڤرات", value: "كڤرات" },
  { label: "حماية الشاشة", value: "حماية الشاشة" },
  { label: "إكسسوارات", value: "إكسسوارات" },
];

const AddProduct = () => {
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    oldPrice: '',
    inStock: true, // متوفر افتراضياً
    // ✅ الحقول الجديدة (قد تكون فارغة)
    sizes: [],
    colors: [],
  });

  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  const [image, setImage] = useState([]);
  const [addProduct, { isLoading }] = useAddProductMutation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'ended' && type === 'checkbox') {
      setProduct((prev) => ({ ...prev, inStock: !checked }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ====== إدارة الأحجام ======
  const addSize = () => {
    const v = (sizeInput || '').trim();
    if (!v) return;
    setProduct((prev) => ({ ...prev, sizes: [...(prev.sizes || []), v] }));
    setSizeInput('');
  };
  const removeSize = (idx) => {
    setProduct((prev) => ({
      ...prev,
      sizes: (prev.sizes || []).filter((_, i) => i !== idx),
    }));
  };

  // ====== إدارة الألوان ======
  const addColor = () => {
    const v = (colorInput || '').trim();
    if (!v) return;
    setProduct((prev) => ({ ...prev, colors: [...(prev.colors || []), v] }));
    setColorInput('');
  };
  const removeColor = (idx) => {
    setProduct((prev) => ({
      ...prev,
      colors: (prev.colors || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = {
      'أسم المنتج': product.name,
      'صنف المنتج': product.category,
      'السعر': product.price,
      'الوصف': product.description,
      'الصور': image.length > 0,
    };

    const missing = Object.entries(required)
      .filter(([, v]) => !v)
      .map(([k]) => k);

    if (missing.length) {
      alert(`الرجاء ملء الحقول التالية: ${missing.join('، ')}`);
      return;
    }

    try {
      await addProduct({
        ...product,
        image,
        author: user?._id,
      }).unwrap();

      alert('تمت أضافة المنتج بنجاح');
      setProduct({
        name: '',
        category: '',
        oldPrice: '',
        price: '',
        description: '',
        inStock: true,
        sizes: [],
        colors: [],
      });
      setImage([]);
      setSizeInput('');
      setColorInput('');
      navigate('/shop');
    } catch (err) {
      console.error('Failed to submit product', err);
      alert('حدث خطأ أثناء إضافة المنتج');
    }
  };

  return (
    <div className="container mx-auto mt-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6">أضافة منتج جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="أسم المنتج"
          name="name"
          placeholder="أكتب أسم المنتج"
          value={product.name}
          onChange={handleChange}
        />

        <SelectInput
          label="صنف المنتج"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={categories}
        />

        <TextInput
          label="السعر القديم (اختياري)"
          name="oldPrice"
          type="number"
          placeholder="100"
          value={product.oldPrice}
          onChange={handleChange}
        />

        <TextInput
          label="السعر"
          name="price"
          type="number"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
        />

        {/* هل انتهى المنتج؟ (إذا تم التأشير = لا يمكن إضافته للسلة) */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ended"
            name="ended"
            checked={!product.inStock}
            onChange={handleChange}
          />
          <label htmlFor="ended">هل انتهى المنتج؟</label>
        </div>

        {/* ✅ إدخال الأحجام (متعدد) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">أحجام المنتج</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              placeholder="مثال: S أو 38 أو 30ml"
              className="add-product-InputCSS flex-1"
            />
            <button type="button" onClick={addSize} className="add-product-btn whitespace-nowrap">
              إضافة حجم
            </button>
          </div>
          {Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s, i) => (
                <span key={`${s}-${i}`} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2">
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSize(i)}
                    className="text-red-600 hover:opacity-70"
                    aria-label="حذف الحجم"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ✅ إدخال الألوان (متعدد) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">ألوان المنتج</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="مثال: أسود، ذهبي، Red-01"
              className="add-product-InputCSS flex-1"
            />
            <button type="button" onClick={addColor} className="add-product-btn whitespace-nowrap">
              إضافة لون
            </button>
          </div>
          {Array.isArray(product.colors) && product.colors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c, i) => (
                <span key={`${c}-${i}`} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2">
                  {c}
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="text-red-600 hover:opacity-70"
                    aria-label="حذف اللون"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <UploadImage
          name="image"
          id="image"
          uploaded={image}
          setImage={setImage}
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="add-product-InputCSS"
            value={product.description}
            placeholder="اكتب وصف المنتج"
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div>
          <button type="submit" className="add-product-btn" disabled={isLoading}>
            {isLoading ? 'جاري الإضافة...' : 'أضف منتج'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
