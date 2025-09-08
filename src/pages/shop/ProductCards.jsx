import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RatingStars from '../../components/RatingStars';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';

const ProductCards = ({ products }) => {
    const dispatch = useDispatch();
    const [addedItems, setAddedItems] = useState({});
    const { country } = useSelector((state) => state.cart);
    
    // Currency and exchange rate
    const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
    const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

    const getProductPrice = (product) => {
        if (!product) return 0;
        
        if (typeof product.price === 'object' && product.price !== null) {
            return (product.price['500 جرام'] || 0) * exchangeRate;
        }
        
        return (product.regularPrice || product.price || 0) * exchangeRate;
    };

    const handleAddToCart = (productId, product) => {
        const originalPrice = product.regularPrice || product.price || 0;
        
        dispatch(addToCart({
            ...product,
            price: originalPrice
        }));

        setAddedItems(prev => ({ ...prev, [productId]: true }));
        setTimeout(() => {
            setAddedItems(prev => ({ ...prev, [productId]: false }));
        }, 1000);
    };

    const renderPrice = (product) => {
        const price = getProductPrice(product);
        const oldPrice = product.oldPrice ? product.oldPrice * exchangeRate : null;

        return (
            <div className="space-y-1">
                <div className="font-medium text-lg">
                    {price.toFixed(2)} {currency}
                </div>
                {oldPrice && (
                    <s className="text-gray-500 text-sm">{oldPrice.toFixed(2)} {currency}</s>
                )}
            </div>
        );
    };

    return (
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {products.map((product) => (
                <div 
                    key={product._id} 
                    className='product__card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full'
                >
                    {product.oldPrice && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                            خصم {Math.round(((product.oldPrice - (product.regularPrice || product.price)) / product.oldPrice) * 100)}%
                        </div>
                    )}

                    <div className='relative flex-grow'>
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

                        <div className='absolute top-3 right-3'>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleAddToCart(product._id, product);
                                }}
                                className={`p-2 text-white rounded-full shadow-md transition-all duration-300 ${
                                    addedItems[product._id] ? 'bg-green-500' : 'bg-[#e9b86b] '
                                }`}
                            >
                                {addedItems[product._id] ? (
                                    <i className="ri-check-line"></i>
                                ) : (
                                    <i className="ri-shopping-cart-2-line"></i>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ✅ التعديل هنا فقط */}
                    <div className='p-4 text-center'>
                        <h4 className="text-lg font-semibold mb-1">{product.name || "اسم المنتج"}</h4>
                        <p className="text-gray-500 text-sm mb-3">{product.category || "فئة غير محددة"}</p>
                        
                        {renderPrice(product)}
                    </div>
                </div>
            ))}
        </div> 
    );
};

export default ProductCards;
