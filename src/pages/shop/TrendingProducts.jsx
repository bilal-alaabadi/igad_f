import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RatingStars from '../../components/RatingStars';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';

const TrendingProducts = ({ onProductsLoaded }) => {
    const [visibleProducts, setVisibleProducts] = useState(4);
    const { country } = useSelector((state) => state.cart);
    const { data: { products = [] } = {}, error, isLoading } = useFetchAllProductsQuery({
        category: '',
        page: 1,
        limit: 20,
    });

    // ✅ نادِ onProductsLoaded عند انتهاء التحميل (نجاح أو خطأ)
    useEffect(() => {
        if (!isLoading && typeof onProductsLoaded === 'function') {
            onProductsLoaded();
        }
    }, [isLoading, onProductsLoaded]);

    // تحديد العملة وسعر الصرف
    const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
    const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

    const loadMoreProducts = () => {
        setVisibleProducts((prevCount) => prevCount + 4);
    };

    const getFirstPrice = (product) => {
        if (!product) return 0;
        if (product.category === 'حناء بودر' && product.price && typeof product.price === 'object') {
            return (product.price['500 جرام'] || product.price['1 كيلو'] || 0) * exchangeRate;
        }
        return (product.regularPrice || product.price || 0) * exchangeRate;
    };

    const getOldPrice = (product) => {
        if (!product.oldPrice) return null;
        return product.oldPrice * exchangeRate;
    };

    if (isLoading) {
        return <div className="text-center py-8">جاري التحميل...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">حدث خطأ أثناء جلب البيانات.</div>;
    }

    return (
        <section className="section__container product__container">
            <h2 className="section__heade text-3xl font-bold text-[#e9b86b] mb-4">
                منتجات جديدة
            </h2>
            <p className="section__subheader text-lg text-gray-600 mb-12" dir='rtl'>
                لأن التفاصيل تصنع الفرق إكسسوارات مختارة بعناية
            </p>

            <div className="mt-12" dir='rtl'>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.slice(0, visibleProducts).map((product) => {
                        const price = getFirstPrice(product);
                        const oldPrice = getOldPrice(product);
                        const discountPercentage = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
                        
                        return (
                            <div 
                                key={product._id} 
                                className="product__card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full"
                            >
                                {oldPrice && (
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                                        خصم {discountPercentage}%
                                    </div>
                                )}

                                <div className="relative flex-grow">
                                    <Link to={`/shop/${product._id}`} className="block h-full">
<div className="w-full h-56 overflow-hidden"> {/* ✅ العرض كامل والطول أقصر */}
    <img
        src={product.image?.[0] || "https://via.placeholder.com/300"}
        alt={product.name || "صورة المنتج"}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        onError={(e) => {
            e.target.src = "https://via.placeholder.com/300";
            e.target.alt = "صورة المنتج غير متوفرة";
        }}
    />
</div>

                                    </Link>
                                </div>

                                {/* تم تركيز النص من الاسم وما بعده كما طلبت سابقًا */}
                                <div className="p-4 text-center">
                                    <h4 className="text-lg font-semibold mb-1 line-clamp-2" title={product.name}>
                                        {product.name || "اسم المنتج"}
                                    </h4>
                                    <p className="text-gray-500 text-sm mb-3">{product.category || "فئة غير محددة"}</p>
                                    
                                    <div className="space-y-1">
                                        <div className="font-medium text-lg">
                                            {price.toFixed(2)} {currency}
                                        </div>
                                        {oldPrice && (
                                            <s className="text-gray-500 text-sm">{oldPrice.toFixed(2)} {currency}</s>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {visibleProducts < products.length && (
                <div className="product__btn text-center mt-8" dir='rtl'>
                    <button 
                        className="btn bg-[#9B2D1F] text-white px-6 py-2 rounded-md transition-colors"
                        onClick={loadMoreProducts}
                    >
                        عرض المزيد
                    </button>
                </div>
            )}
        </section>
    );
};

export default TrendingProducts;
