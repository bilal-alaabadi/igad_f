// ========================= components/PaymentSuccess.jsx =========================
import React, { useEffect, useRef, useState } from 'react';
import { getBaseUrl } from '../utils/baseURL';
import TimelineStep from './Timeline'; // (إن كنت لا تستخدمه يمكنك تركه كما هو)
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/features/cart/cartSlice';

const PaymentSuccess = () => {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();

  // منع تفريغ السلة أكثر من مرة (StrictMode وغيره)
  const clearedRef = useRef(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const client_reference_id = query.get('client_reference_id');

    if (!client_reference_id) {
      setError('No session ID found in the URL');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/api/orders/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_reference_id }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (!data.order) throw new Error('No order data received.');

        setOrder(data.order);

        // جلب تفاصيل كل منتج لعرض الوصف/الفئة والصورة… مع تمرير الحجم واللون من الطلب
        const productsDetails = await Promise.all(
          (data.order.products || []).map(async (item) => {
            try {
              const r = await fetch(`${getBaseUrl()}/api/products/${item.productId}`);
              const pd = await r.json();
              const productObj = pd?.product || {};

              return {
                ...productObj,
                // صورة احتياطية إذا لم يرجع المنتج صورة
                image: Array.isArray(productObj.image) && productObj.image.length
                  ? productObj.image
                  : (item.image ? [item.image] : []),
                quantity: item.quantity,
                // ✅ أهم شيء: تضمين اللون والحجم من عناصر الطلب
                selectedSize: item.selectedSize || '',
                selectedColor: item.selectedColor || '',
              };
            } catch {
              // لو فشل استرجاع المنتج من /api/products/<id> نرجع أقل بيانات من عنصر الطلب
              return {
                _id: item.productId,
                name: item.name,
                image: item.image ? [item.image] : [],
                description: '',
                category: '',
                quantity: item.quantity,
                selectedSize: item.selectedSize || '',
                selectedColor: item.selectedColor || '',
              };
            }
          })
        );

        setProducts(productsDetails);
      } catch (err) {
        console.error('Error confirming payment', err);
        setError(err.message || 'Failed to confirm payment');
      }
    })();
  }, []);

  // عند إكمال الدفع: تفريغ السلة مرة واحدة فقط
  useEffect(() => {
    if (order?.status === 'completed' && !clearedRef.current) {
      dispatch(clearCart());
      clearedRef.current = true;
    }
  }, [order, dispatch]);

  const currency = order?.country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = order?.country === 'الإمارات' ? 9.5 : 1;
  const formatPrice = (price) => (Number(price || 0) * exchangeRate).toFixed(2);

  if (error) return <div className="text-red-500 p-4">خطأ: {error}</div>;
  if (!order) return <div className="p-4">جارِ التحميل...</div>;

  return (
    <section className="section__container rounded p-6">
      {/* تفاصيل المنتجات */}
      <div className="mt-8 pt-6" dir="rtl">
        <h3 className="text-xl font-bold mb-4">تفاصيل المنتجات</h3>
        <div className="space-y-6">
          {products.map((product, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg"
            >
              <div className="md:w-1/4">
                <img
                  src={
                    Array.isArray(product.image) && product.image.length > 0
                      ? product.image[0]
                      : product.image || 'https://via.placeholder.com/150'
                  }
                  alt={product.name}
                  className="w-full h-auto rounded-md"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150';
                    e.target.alt = 'صورة غير متوفرة';
                  }}
                />
              </div>

              <div className="md:w-3/4">
                <h4 className="text-lg font-semibold">{product.name}</h4>
                {product.description && (
                  <p className="text-gray-600 mt-2">{product.description}</p>
                )}

                <div className="mt-2">
                  <span className="font-medium">الكمية: </span>
                  <span>{product.quantity}</span>
                </div>

                {/* الحجم إن وُجد */}
                {product.selectedSize ? (
                  <div className="mt-2">
                    <span className="font-medium">الحجم: </span>
                    <span>{product.selectedSize}</span>
                  </div>
                ) : null}

                {/* ✅ اللون إن وُجد (مع دائرة معاينة) */}
                {product.selectedColor ? (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-medium">اللون: </span>
                    <span
                      className="inline-block w-4 h-4 rounded-full border"
                      style={{ background: product.selectedColor }}
                      title={product.selectedColor}
                    />
                    <span>{product.selectedColor}</span>
                  </div>
                ) : null}

                {product.category ? (
                  <div className="mt-2">
                    <span className="font-medium">الفئة: </span>
                    <span>{product.category}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ملخص الطلب */}
      <div className="mt-8 border-t pt-6" dir="rtl">
        <h3 className="text-xl font-bold mb-4">ملخص الطلب</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between py-2">
            <span>السعر:</span>
            <span className="font-semibold">
              {formatPrice((order.amount || 0) - (order.shippingFee || 0))} {currency}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span>رسوم الشحن:</span>
            <span className="font-semibold">
              {formatPrice(order.shippingFee)} {currency}
            </span>
          </div>

          <div className="flex justify-between py-2 border-t pt-3">
            <span className="font-medium">الإجمالي النهائي:</span>
            <span className="font-bold text-lg">
              {formatPrice(order.amount)} {currency}
            </span>
          </div>

          <div className="flex justify-between py-2 border-t pt-3">
            <span>البريد الإلكتروني:</span>
            <span className="font-semibold break-all">
              {order.email || 'غير متوفر'}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span>حالة الطلب:</span>
            <span className="font-semibold">{order.status}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>اسم العميل:</span>
            <span className="font-semibold">{order.customerName}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>رقم الهاتف:</span>
            <span className="font-semibold">{order.customerPhone}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>البلد:</span>
            <span className="font-semibold">{order.country}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>الولاية:</span>
            <span className="font-semibold">{order.wilayat}</span>
          </div>

          <div className="flex justify-between py-2 border-t pt-3">
            <span>تاريخ الطلب:</span>
            <span className="font-semibold">
              {new Date(order.createdAt).toLocaleDateString('ar-OM')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess;
