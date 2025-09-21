// ========================= UpdateProduct.jsx =========================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchProductByIdQuery, useUpdateProductMutation } from '../../../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';
import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';
// مهم: استورد كمبوننت "التعديل" وليس تبع الإضافة
import UploadImage from '../manageProduct/UploadImag';

const categories = [
  { label: "اختر التصنيف", value: "" },
  { label: "حقائب", value: "حقائب" },
  { label: "كڤرات", value: "كڤرات" },
  { label: "حماية الشاشة", value: "حماية الشاشة" },
  { label: "إكسسوارات", value: "إكسسوارات" },
];

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: productData, isLoading: isFetching, error: fetchError } = useFetchProductByIdQuery(id);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    oldPrice: '',
    description: '',
    image: [],
    inStock: true, // افتراضي: متوفر
    sizes: [],     // ✅ أحجام متعددة
    colors: [],    // ✅ ألوان متعددة
    // احتفاظ اختياري بالحقل القديم "size" إن وجد بالباك-إند
    size: '',
  });

  // حقول الإدخال لإضافة عنصر جديد للقوائم
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  // الصور الجديدة (Files) + الصور المُحتفَظ بها من الحالية (روابط)
  const [newImages, setNewImages] = useState([]);
  const [keepImages, setKeepImages] = useState([]);

  // هل الفئة تتطلب حجم؟ (مثال "حناء بودر")
  const requiresSize = useMemo(() => product.category === 'حناء بودر', [product.category]);

  useEffect(() => {
    if (!productData) return;

    // بعض الـ APIs ترجع { product, reviews } — نتعامل مع الحالتين
    const p = productData.product ? productData.product : productData;

    const currentImages = Array.isArray(p?.image)
      ? p.image
      : p?.image
      ? [p.image]
      : [];

    const sizesFromApi = Array.isArray(p?.sizes) ? p.sizes : [];
    const colorsFromApi = Array.isArray(p?.colors) ? p.colors : [];

    // احتياط: لو كان عندك قديمًا حقل واحد "size" فقط
    const fallbackSingleSize = p?.size && !sizesFromApi.length ? [p.size] : sizesFromApi;

    setProduct({
      name: p?.name || '',
      category: p?.category || '',
      price: p?.price != null ? String(p.price) : '',
      oldPrice: p?.oldPrice != null ? String(p.oldPrice) : '',
      description: p?.description || '',
      image: currentImages,
      inStock: typeof p?.inStock === 'boolean' ? p.inStock : true,
      sizes: fallbackSingleSize,
      colors: colorsFromApi,
      size: p?.size || '', // احتفاظ بالحقل القديم لو موجود
    });

    setKeepImages(currentImages);
  }, [productData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // ====== إدارة الأحجام ======
  const addSize = () => {
    const v = (sizeInput || '').trim();
    if (!v) return;
    if (product.sizes.includes(v)) {
      setSizeInput('');
      return;
    }
    setProduct((prev) => ({ ...prev, sizes: [...prev.sizes, v] }));
    setSizeInput('');
  };

  const removeSize = (value) => {
    setProduct((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== value) }));
  };

  // ====== إدارة الألوان ======
  const addColor = () => {
    const v = (colorInput || '').trim();
    if (!v) return;
    if (product.colors.includes(v)) {
      setColorInput('');
      return;
    }
    setProduct((prev) => ({ ...prev, colors: [...prev.colors, v] }));
    setColorInput('');
  };

  const removeColor = (value) => {
    setProduct((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = {
      'أسم المنتج': product.name,
      'صنف المنتج': product.category,
      'السعر': product.price,
      'الوصف': product.description,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      alert(`الرجاء ملء الحقول التالية: ${missingFields.join('، ')}`);
      return;
    }

    // إن كانت فئة تتطلب حجم — اشترط وجود عنصر واحد على الأقل
    if (requiresSize && (!product.sizes || product.sizes.length === 0)) {
      alert('الرجاء إضافة حجم واحد على الأقل');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('category', product.category);
      formData.append('price', product.price);
      formData.append('oldPrice', product.oldPrice || '');
      formData.append('description', product.description);
      formData.append('author', user?._id || '');
      formData.append('inStock', product.inStock);

      // ✅ نرسل الأحجام والألوان كـ JSON
      formData.append('sizes', JSON.stringify(product.sizes || []));
      formData.append('colors', JSON.stringify(product.colors || []));

      // لو عندك توافق قديم لحقل واحد "size"
      formData.append('size', product.size || '');

      // الصور التي نُبقيها من القديمة
      formData.append('keepImages', JSON.stringify(keepImages || []));

      // الصور الجديدة (Files)
      if (Array.isArray(newImages) && newImages.length > 0) {
        newImages.forEach((file) => formData.append('image', file));
      }

      await updateProduct({ id, body: formData }).unwrap();
      alert('تم تحديث المنتج بنجاح');
      navigate('/dashboard/manage-products');
    } catch (error) {
      alert('حدث خطأ أثناء تحديث المنتج: ' + (error?.data?.message || error?.message || 'خطأ غير معروف'));
    }
  };

  if (isFetching) return <div className="text-center py-8">جاري تحميل بيانات المنتج...</div>;
  if (fetchError) return <div className="text-center py-8 text-red-500">خطأ في تحميل بيانات المنتج</div>;

  return (
    <div className="container mx-auto mt-8 px-4" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-right">تحديث المنتج</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="اسم المنتج"
          name="name"
          placeholder="أكتب اسم المنتج"
          value={product.name}
          onChange={handleChange}
          required
        />

        <SelectInput
          label="صنف المنتج"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={categories}
          required
        />

        {/* ====== إدارة الأحجام (Tags) ====== */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الأحجام
            {requiresSize && <span className="text-red-500 mr-1">*</span>}
          </label>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل حجمًا ثم اضغط إضافة (مثال: 500 جرام)"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
            />
            <button
              type="button"
              onClick={addSize}
              className="px-4 py-2 bg-[#e9b86b] text-white rounded-md hover:opacity-90"
            >
              إضافة
            </button>
          </div>

          {product.sizes?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s, idx) => (
                <span
                  key={`${s}-${idx}`}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => removeSize(s)}
                    className="text-red-600 hover:text-red-700"
                    aria-label={`حذف الحجم ${s}`}
                    title="حذف"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">لا توجد أحجام مُضافة.</p>
          )}
        </div>

        {/* ====== إدارة الألوان (Tags) ====== */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الألوان
          </label>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل لونًا ثم اضغط إضافة (例: أسود أو #000000)"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
            />
            <button
              type="button"
              onClick={addColor}
              className="px-4 py-2 bg-[#e9b86b] text-white rounded-md hover:opacity-90"
            >
              إضافة
            </button>
          </div>

          {product.colors?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c, idx) => {
                const isHex = /^#([0-9A-F]{3}){1,2}$/i.test((c || '').trim());
                return (
                  <span
                    key={`${c}-${idx}`}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border"
                    title={c}
                  >
                    {isHex && (
                      <span
                        className="inline-block w-4 h-4 rounded-full border"
                        style={{ background: c }}
                      />
                    )}
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(c)}
                      className="text-red-600 hover:text-red-700"
                      aria-label={`حذف اللون ${c}`}
                      title="حذف"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500">لا توجد ألوان مُضافة.</p>
          )}
        </div>

        <TextInput
          label="السعر الحالي"
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

        {/* كمبوننت التعديل: يعرض صور حالية + يحذف + يجمع ملفات جديدة */}
        <UploadImage
          name="image"
          id="image"
          initialImages={product.image}   // صور حالية
          setImages={setNewImages}        // ملفات جديدة
          setKeepImages={setKeepImages}   // الصور التي سيتم الإبقاء عليها
        />

        <div className="text-right">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={product.description}
            placeholder="أكتب وصف المنتج"
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        {/* حالة التوفر */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="availability"
              value="available"
              checked={product.inStock === true}
              onChange={() => setProduct((prev) => ({ ...prev, inStock: true }))}
            />
            <span>المنتج متوفر</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="availability"
              value="ended"
              checked={product.inStock === false}
              onChange={() => setProduct((prev) => ({ ...prev, inStock: false }))}
            />
            <span>انتهى المنتج</span>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? 'جاري التحديث...' : 'حفظ التغييرات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
