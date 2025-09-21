// ========================= src/pages/shop/CartModal.jsx =========================
import React from 'react';
import { RiCloseLine } from "react-icons/ri";
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../redux/features/cart/cartSlice';

const CartModal = ({ products, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { totalPrice, country } = useSelector((state) => state.cart);

  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

  const formatPrice = (price) => (price * exchangeRate).toFixed(2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9998] flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-[#4E5A3F]">سلة التسوق</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="إغلاق">
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {products.length === 0 ? (
            <p className="text-center py-8">سلة التسوق فارغة</p>
          ) : (
            <>
              {products.map((product) => {
                const imageSrc = Array.isArray(product.image) ? product.image[0] : product.image;
                const lineTotal = product.price * product.quantity;

                return (
                  <div
                    key={product._id}
                    className="flex gap-3 border border-gray-100 rounded-lg p-3 hover:shadow-sm transition relative"
                  >
                    {/* صورة */}
                    <img
                      src={imageSrc || "https://via.placeholder.com/120"}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-md border"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/120";
                        e.currentTarget.alt = "صورة غير متوفرة";
                      }}
                    />

                    {/* تفاصيل */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>

                        {/* إزالة */}
                        <button
                          onClick={() => dispatch(removeFromCart({ id: product._id }))}
                          className="text-red-500 hover:text-red-700"
                          aria-label="إزالة"
                          title="إزالة المنتج"
                        >
                          <RiCloseLine size={18} />
                        </button>
                      </div>

                      {/* السعر */}
                      <div className="mt-1 text-[13px] text-gray-600">
                        السعر: {formatPrice(product.price)} {currency}
                      </div>

                      {/* ✅ قياس/لون كشارات واضحة */}
                      {(product.selectedSize || product.selectedColor) && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {product.selectedSize && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded-full">
                              <span className="font-medium text-gray-700">الحجم</span>
                              <span className="text-gray-700">•</span>
                              <span className="text-gray-800">{product.selectedSize}</span>
                            </span>
                          )}
                          {product.selectedColor && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded-full">
                              <span className="font-medium text-gray-700">اللون</span>
                              <span className="text-gray-700">•</span>
                              <span className="text-gray-800">{product.selectedColor}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* كمية + الإجمالي الفرعي */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => dispatch(updateQuantity({ id: product._id, type: 'decrement' }))}
                            className="w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-50"
                            aria-label="إنقاص الكمية"
                          >
                            -
                          </button>
                          <span className="min-w-[1.5rem] text-center">{product.quantity}</span>
                          <button
                            onClick={() => dispatch(updateQuantity({ id: product._id, type: 'increment' }))}
                            className="w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-50"
                            aria-label="زيادة الكمية"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm font-medium text-[#4E5A3F]">
                          الإجمالي: {formatPrice(lineTotal)} {currency}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* المجموع */}
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between text-[15px]">
                  <span className="text-gray-700">المجموع</span>
                  <span className="font-semibold text-[#4E5A3F]">
                    {formatPrice(totalPrice)} {currency}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={onClose}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
                  >
                    متابعة التسوق
                  </button>
                  <a
                    href="/checkout"
                    className="w-full bg-[#e9b86b] text-white py-2 rounded-md text-center hover:opacity-95"
                  >
                    إتمام الشراء
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
