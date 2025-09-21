// ShopPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCards from './ProductCards';
import ShopFiltering from './ShopFiltering';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';
import imge from "../../assets/متجر-اكسسوارات.png--تعديل.png";

const filters = {
  categories: ['الكل', 'حقائب', 'كڤرات', 'حماية الشاشة', 'إكسسوارات'],
};

const ShopPage = () => {
  const [filtersState, setFiltersState] = useState({ category: 'الكل' });
  const [currentPage, setCurrentPage] = useState(1);
  const [ProductsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  // ✅ عند الدخول من الهيرو: اقرأ category من الرابط وطبّق الفلتر
  useEffect(() => {
    const qCat = searchParams.get('category'); // مثال: "حقائب"
    if (qCat && filters.categories.includes(qCat)) {
      setFiltersState((prev) => ({ ...prev, category: qCat }));
    }
  }, [searchParams]);

  const { category } = filtersState;

  useEffect(() => {
    setCurrentPage(1);
  }, [filtersState]);

  const {
    data: { products = [], totalPages = 1, totalProducts = 0 } = {},
    error,
    isLoading,
  } = useFetchAllProductsQuery({
    category: category !== 'الكل' ? category : undefined,
    page: currentPage,
    limit: ProductsPerPage,
  });

  const clearFilters = () => setFiltersState({ category: 'الكل' });

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  if (isLoading) return <div className="text-center py-8">جاري تحميل المنتجات...</div>;
  if (error) return <div className="text-center py-8 text-red-500">حدث خطأ أثناء تحميل المنتجات.</div>;

  const startProduct = totalProducts ? (currentPage - 1) * ProductsPerPage + 1 : 0;
  const endProduct = Math.min(startProduct + ProductsPerPage - 1, totalProducts);

  return (
    <>
      {/* Hero */}
      <section className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
        <img src={imge} alt="متجر igad" className="w-full h-full object-cover" />
      </section>

      {/* Content */}
      <section className="section__container py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Sidebar Filters */}
          <aside className="md:w-1/4">
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowFilters((p) => !p)}
                className="w-full bg-[#e9b86b] text-white py-2 rounded"
              >
                {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
              </button>
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
              <ShopFiltering
                filters={filters}
                filtersState={filtersState}
                setFiltersState={setFiltersState}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Products */}
          <div className="md:w-3/4">
            {products.length > 0 ? (
              <>
                <ProductCards products={products} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      الصفحة {currentPage} من {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-[#9B2D1F] text-white hover:bg-[#7a241a]'
                        }`}
                      >
                        السابق
                      </button>

                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`w-10 h-10 flex items-center justify-center rounded-md ${
                              currentPage === index + 1
                                ? 'bg-[#9B2D1F] text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === totalPages
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-[#9B2D1F] text-white hover:bg-[#7a241a]'
                        }`}
                      >
                        التالي
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-lg text-gray-600">لا توجد منتجات متاحة حسب الفلتر المحدد</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-[#9B2D1F] text-white rounded-md hover:bg-[#7a241a]"
                >
                  عرض جميع المنتجات
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopPage;
