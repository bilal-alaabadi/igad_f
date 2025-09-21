// src/redux/features/products/productsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "../../../utils/baseURL";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/products`,
    credentials: "include",
  }),
  tagTypes: ["Product", "ProductList"],
  endpoints: (builder) => ({

    // جلب جميع المنتجات مع التصفية/الترتيب/الترقيم
    fetchAllProducts: builder.query({
      query: ({
        category,
        gender,
        minPrice,
        maxPrice,
        search,
        sort = "createdAt:desc",
        page = 1,
        limit = 10,
      }) => {
        const params = {
          page: String(page),
          limit: String(limit),
          sort,
        };
        if (category && category !== "الكل") params.category = category;
        if (gender) params.gender = gender;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (search) params.search = search;

        const queryParams = new URLSearchParams(params).toString();
        return `/?${queryParams}`;
      },
      transformResponse: (response) => ({
        products: response.products,
        totalPages: response.totalPages,
        totalProducts: response.totalProducts,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ _id }) => ({ type: "Product", id: _id })),
              "ProductList",
            ]
          : ["ProductList"],
    }),

    // جلب منتج واحد
    fetchProductById: builder.query({
      query: (id) => `/product/${id}`,
      transformResponse: (response) => {
        if (!response?.product) throw new Error("المنتج غير موجود");
        const { product } = response;
        return {
          _id: product._id,
          name: product.name,
          category: product.category,
          size: product.size || "",
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          colors: Array.isArray(product.colors) ? product.colors : [],
          price: product.price,
          oldPrice: product.oldPrice || "",
          description: product.description,
          image: Array.isArray(product.image) ? product.image : [product.image].filter(Boolean),
          author: product.author,
          reviews: product.reviews || [],
          regularPrice: product.regularPrice,
        };
      },
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // منتجات مرتبطة
    fetchRelatedProducts: builder.query({
      query: (id) => `/related/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }, "ProductList"],
    }),

    // إضافة منتج
    addProduct: builder.mutation({
      query: (body) => ({ url: "/create-product", method: "POST", body }),
      invalidatesTags: ["ProductList"],
    }),

    // تحديث منتج
    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/update-product/${id}`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: (r, e, { id }) => [{ type: "Product", id }, "ProductList"],
    }),

    // حذف منتج
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: (r, e, id) => [{ type: "Product", id }, "ProductList"],
    }),

    // بحث
    searchProducts: builder.query({
      query: (q) => `/search?q=${q}`,
      transformResponse: (response) =>
        response.map((p) => ({
          ...p,
          price: p.category === "حناء بودر" ? p.price : p.regularPrice,
          images: Array.isArray(p.image) ? p.image : [p.image],
        })),
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: "Product", id: _id })), "ProductList"]
          : ["ProductList"],
    }),

    // الأكثر مبيعًا
    fetchBestSellingProducts: builder.query({
      query: (limit = 4) => `/best-selling?limit=${limit}`,
      providesTags: ["ProductList"],
    }),
  }),
});

// ✅ هوكّات RTK Query — لازم تكون مُصدّرة بالاسم
export const {
  useFetchAllProductsQuery,
  useLazyFetchAllProductsQuery,
  useFetchProductByIdQuery,
  useLazyFetchProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useFetchRelatedProductsQuery,
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  useFetchBestSellingProductsQuery,
} = productsApi;

export default productsApi;
