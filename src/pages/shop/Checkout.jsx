// ========================= src/pages/checkout/Checkout.jsx =========================
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { RiBankCardLine } from "react-icons/ri";
import { getBaseUrl } from "../../utils/baseURL";

const Checkout = () => {
  const navigate = useNavigate();

  // من السلة
  const { products, totalPrice, country, shippingFee } = useSelector((state) => state.cart);

  // تحويل العملة للعرض فقط
  const currency = country === "الإمارات" ? "د.إ" : "ر.ع.";
  const exchangeRate = country === "الإمارات" ? 9.5 : 1;

  // إجمالي الكمية لعرض الملخص
  const totalQty = useMemo(
    () => (Array.isArray(products) ? products.reduce((s, p) => s + (p.quantity || 0), 0) : 0),
    [products]
  );

  // فورم معلومات العميل
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wilayat, setWilayat] = useState("");
  const [address, setAddress] = useState(""); // العنوان التفصيلي
  const [error, setError] = useState("");

  // إذا كانت السلة فارغة نرجع للمتجر
  useEffect(() => {
    if (!products || products.length === 0) {
      setError("لا توجد منتجات في السلة.");
    } else {
      setError("");
    }
  }, [products]);

  // مجموعات الأسعار للعرض
  const subTotalDisplay = (totalPrice * exchangeRate).toFixed(2);
  const shippingDisplay = (shippingFee * exchangeRate).toFixed(2);
  const grandTotalDisplay = ((totalPrice + shippingFee) * exchangeRate).toFixed(2);

  const makePayment = async (e) => {
    e.preventDefault();

    if (!products || products.length === 0) {
      setError("لا توجد منتجات في السلة. الرجاء إضافة منتجات قبل المتابعة.");
      return;
    }

    if (!customerName || !customerPhone || !email || !wilayat || !address) {
      setError("الرجاء إدخال جميع الحقول: الاسم، الهاتف، الإيميل، الولاية/المنطقة، العنوان.");
      return;
    }

    // تجهيز جسم الطلب — نرسل السعر الأصلي بدون تحويل، ونرفق اختيارات الحجم/اللون
    const payload = {
      products: products.map((p) => ({
        _id: p._id,
        name: p.name,
        price: p.price, // بدون تحويل
        quantity: p.quantity,
        image: Array.isArray(p.image) ? p.image[0] : p.image,
        selectedSize: p.selectedSize || "",
        selectedColor: p.selectedColor || "",
      })),
      customerName,
      customerPhone,
      email,
      country,            // من السلة
      wilayat,
      address,            // العنوان التفصيلي
      shippingFee,        // بدون تحويل
      note: "",           // حقل إضافي إن رغبت مستقبلاً
    };

    try {
      const res = await fetch(`${getBaseUrl()}/api/orders/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "فشل إنشاء جلسة الدفع");
      }

      const data = await res.json();
      if (data?.paymentLink) {
        window.location.href = data.paymentLink; // الذهاب لبوابة الدفع
      } else {
        setError("تعذر إنشاء رابط الدفع. حاول مرة أخرى.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "حدث خطأ أثناء عملية الدفع.");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-8" dir="rtl">
      {/* عمود الفورم */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">تفاصيل الفاتورة</h1>

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        {(!products || products.length === 0) && (
          <div className="bg-white border rounded p-4">
            <p className="mb-3">سلة التسوق فارغة.</p>
            <Link to="/shop" className="text-[#e9b86b] hover:opacity-80">العودة للمتجر</Link>
          </div>
        )}

        {products && products.length > 0 && (
          <form onSubmit={makePayment} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">الاسم الكامل</label>
              <input
                type="text"
                className="w-full border rounded-md p-2"
                placeholder="اكتب اسمك الكامل"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">رقم الهاتف</label>
              <input
                type="tel"
                className="w-full border rounded-md p-2"
                placeholder="9xxxxxxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">البريد الإلكتروني</label>
              <input
                type="email"
                className="w-full border rounded-md p-2"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">الدولة</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2 bg-gray-50"
                  value={country}
                  readOnly
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">الولاية / المنطقة</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2"
                  placeholder="مثال: مسقط"
                  value={wilayat}
                  onChange={(e) => setWilayat(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">العنوان التفصيلي</label>
              <textarea
                className="w-full border rounded-md p-2"
                rows={3}
                placeholder="الحي، الشارع، رقم المنزل... وأي ملاحظات للتوصيل"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#e9b86b] text-white px-6 py-3 rounded-md hover:opacity-95 transition"
            >
              إتمام الطلب <RiBankCardLine className="inline-block text-xl mr-1 align-[-3px]" />
            </button>
          </form>
        )}
      </div>

      {/* عمود ملخص الطلب */}
      <aside className="w-full md:w-1/3 p-4 md:p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">طلبك</h2>

        {products && products.length > 0 ? (
          <>
            <div className="space-y-4">
              {products.map((p) => (
                <div key={`${p._id}-${p.selectedSize || ''}-${p.selectedColor || ''}`} className="py-2 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {p.name} × {p.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {(p.price * p.quantity * exchangeRate).toFixed(2)} {currency}
                    </span>
                  </div>

                  {(p.selectedSize || p.selectedColor) && (
                    <div className="text-xs text-gray-600 mt-1">
                      {p.selectedSize && <span className="mr-2">الحجم: {p.selectedSize}</span>}
                      {p.selectedColor && <span>اللون: {p.selectedColor}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">المجموع الفرعي</span>
                <span className="font-medium">{subTotalDisplay} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">رسوم الشحن</span>
                <span className="font-medium">{shippingDisplay} {currency}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-800 font-semibold">الإجمالي</span>
                <span className="text-gray-900 font-bold">{grandTotalDisplay} {currency}</span>
              </div>
            </div>

            <button
              onClick={makePayment}
              className="mt-6 w-full bg-[#e9b86b] text-white px-4 py-2 rounded-md transition hover:opacity-95 flex items-center justify-center gap-2"
            >
              <RiBankCardLine className="text-xl" />
              الدفع باستخدام ثواني
            </button>

            <Link
              to="/shop"
              className="mt-3 block text-center text-[#e9b86b] hover:opacity-80"
            >
              متابعة التسوق
            </Link>
          </>
        ) : (
          <p className="text-gray-600">لا توجد منتجات في السلة.</p>
        )}
      </aside>
    </div>
  );
};

export default Checkout;
