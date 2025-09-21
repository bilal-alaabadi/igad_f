// ========================= src/pages/shop/SingleProduct.jsx =========================
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchProductByIdQuery } from '../../../redux/features/products/productsApi';
import { addToCart } from '../../../redux/features/cart/cartSlice';
import ReviewsCard from '../reviews/ReviewsCard';
import imge from '../../../assets/متجر-اكسسوارات.png--تعديل.png';

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data, error, isLoading } = useFetchProductByIdQuery(id);
  const { country } = useSelector((state) => state.cart);

  const singleProduct = data;
  const productReviews = data?.reviews || [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // ✅ اختيارات التفاصيل (بدون اختيار تلقائي)
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // مشتقات الخيارات (تدعم الحقل القديم size كسطر واحد)
  const sizeOptions =
    Array.isArray(singleProduct?.sizes) && singleProduct?.sizes?.length
      ? singleProduct.sizes
      : singleProduct?.size
      ? [String(singleProduct.size)]
      : [];

  const colorOptions = Array.isArray(singleProduct?.colors) ? singleProduct.colors : [];

  // العملة وسعر الصرف
  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

  useEffect(() => {
    setImageScale(1.05);
    const timer = setTimeout(() => setImageScale(1), 300);
    return () => clearTimeout(timer);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === singleProduct.image.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? singleProduct.image.length - 1 : prevIndex - 1
    );
  };

  if (isLoading) return <p>جاري التحميل...</p>;
  if (error) return <p>حدث خطأ أثناء تحميل تفاصيل المنتج.</p>;
  if (!singleProduct) return null;

  // الأسعار (قارن داخل نفس العملة الأساسية ثم حوّل للعرض)
  const basePrice = Number(singleProduct.regularPrice ?? singleProduct.price ?? 0); // OMR
  const baseOldPrice = singleProduct.oldPrice != null ? Number(singleProduct.oldPrice) : null; // OMR

  const price = basePrice * exchangeRate; // للعرض حسب الدولة
  const oldPrice = baseOldPrice != null ? baseOldPrice * exchangeRate : null; // للعرض

  // ✅ أظهر الخصم فقط إذا كان هناك خصم فعلي: oldPrice > price
  const hasDiscount = baseOldPrice != null && baseOldPrice > basePrice;
  const discountPercentage = hasDiscount
    ? Math.round(((baseOldPrice - basePrice) / baseOldPrice) * 100)
    : 0;

  // ✅ المنع قبل الاختيار
  const mustPickSize = sizeOptions.length > 0 && !selectedSize;
  const mustPickColor = colorOptions.length > 0 && !selectedColor;
  const addDisabled = mustPickSize || mustPickColor;

  const handleAddToCart = (product) => {
    if (addDisabled) return; // حارس أمان

    setIsAddingToCart(true);

    const productToAdd = {
      ...product,
      price: product.regularPrice || product.price || 0,
      selectedSize: selectedSize || '',
      selectedColor: selectedColor || '',
    };

    dispatch(addToCart(productToAdd));

    setTimeout(() => {
      setIsAddingToCart(false);
    }, 900);
  };

  return (
    <>
      {/* <section className="relative w-full">
        <div className="relative h-64 md:h-80">
          <img src={imge} alt="متجر الإكسسوارات" className="w-full h-full object-cover" />
        </div>
      </section> */}

      <section className="section__container mt-8" dir="rtl">
        <div className="flex flex-col items-center md:flex-row gap-8">
          {/* الصورة */}
          <div className="md:w-1/2 w-full relative">
            {hasDiscount && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                خصم {discountPercentage}%
              </div>
            )}

            {singleProduct.image && singleProduct.image.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-md">
                  <img
                    src={singleProduct.image[currentImageIndex]}
                    alt={singleProduct.name}
                    className="w-full h-auto transition-transform duration-300"
                    style={{ transform: `scale(${imageScale})` }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500';
                      e.target.alt = 'Image not found';
                    }}
                  />
                </div>
                {singleProduct.image.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                      aria-label="الصورة السابقة"
                    >
                      <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                      aria-label="الصورة التالية"
                    >
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </>
                )}
              </>
            ) : (
              <p className="text-red-600">لا توجد صور متاحة لهذا المنتج.</p>
            )}
          </div>

          {/* تفاصيل المنتج */}
          <div className="md:w-1/2 w-full">
            <h3 className="text-২xl font-semibold mb-4">{singleProduct.name}</h3>

            {/* السعر */}
            <div className="text-xl text-[#3D4B2E] mb-4 space-x-1">
              {price.toFixed(2)} {currency}
              {hasDiscount && oldPrice && (
                <s className="text-gray-500 text-sm ml-2">
                  {oldPrice.toFixed(2)} {currency}
                </s>
              )}
            </div>

            {/* الفئة */}
            <div className="flex flex-col space-y-2">
              <p className="text-gray-500 mb-2 text-lg font-medium leading-relaxed">
                <span className="text-gray-800 font-bold block">الفئة:</span>
                <span className="text-gray-600">{singleProduct.category}</span>
              </p>
            </div>

            {/* الوصف */}
            <p className="text-gray-500 mb-4 text-lg font-medium leading-relaxed">
              <span className="text-gray-800 font-bold block">الوصف:</span>
              <span className="text-gray-600">{singleProduct.description}</span>
            </p>

            {/* ✅ اختيار الحجم (مطلوب إن توفر) */}
            {sizeOptions.length > 0 && (
              <div className="mb-4">
                <span className="block text-gray-800 font-bold mb-2">
                  اختر الحجم <span className="text-red-600">*</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((s, idx) => {
                    const active = selectedSize === s;
                    return (
                      <button
                        type="button"
                        key={`${s}-${idx}`}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1 rounded-full border text-sm transition
                          ${
                            active
                              ? 'bg-[#e9b86b] text-white border-[#e9b86b]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#e9b86b]'
                          }`}
                        aria-pressed={active}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {mustPickSize && (
                  <p className="text-xs text-red-600 mt-1">الرجاء اختيار الحجم قبل الإضافة.</p>
                )}
              </div>
            )}

            {/* ✅ اختيار اللون (مطلوب إن توفر) */}
            {colorOptions.length > 0 && (
              <div className="mb-4">
                <span className="block text-gray-800 font-bold mb-2">
                  اختر اللون <span className="text-red-600">*</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c, idx) => {
                    const active = selectedColor === c;
                    const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(String(c).trim());
                    return (
                      <button
                        type="button"
                        key={`${c}-${idx}`}
                        onClick={() => setSelectedColor(c)}
                        title={c}
                        className={`px-3 py-1 rounded-full border text-sm transition flex items-center gap-2
                          ${
                            active
                              ? 'bg-[#e9b86b] text-white border-[#e9b86b]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#e9b86b]'
                          }`}
                        aria-pressed={active}
                      >
                        {isHex ? (
                          <span
                            className="inline-block w-4 ه-4 rounded-full border"
                            style={{ background: c }}
                          />
                        ) : null}
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
                {mustPickColor && (
                  <p className="text-xs text-red-600 mt-1">الرجاء اختيار اللون قبل الإضافة.</p>
                )}
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(singleProduct);
              }}
              disabled={addDisabled}
              className={`mt-6 px-6 py-3 rounded-md transition-all duration-200 relative overflow-hidden
                ${
                  addDisabled
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : isAddingToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-[#e9b86b] text-white hover:opacity-95'
                }`}
              title={addDisabled ? 'اختر الحجم/اللون أولاً' : 'إضافة إلى السلة'}
            >
              {isAddingToCart ? 'تمت الإضافة!' : 'إضافة إلى السلة'}
            </button>
          </div>
        </div>
      </section>

      {/* المراجعات */}
      <section className="section__container mt-8" dir="rtl">
        <ReviewsCard productReviews={productReviews} />
      </section>
    </>
  );
};

export default SingleProduct;
