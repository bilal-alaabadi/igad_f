// components/Home.jsx
import React, { useState } from 'react';
import Banner from './Banner';
import TrendingProducts from '../shop/TrendingProducts';
import log from "../../assets/ΓÇÄΓü_ΓÇÅ_ä_é________º______ó_á_ó_Ñ-_á__-_á_ª__ü_è__í_í._Ñ__._ó_ñ_á__Γü_-removebg-preview-removebg-preview.png"; // شعار الأنثور

const Home = () => {
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  return (
    <>
      {/* شاشة البداية: الشعار كبير مع لمعة تتحرك من الأعلى للأسفل */}
      {isLoadingProducts && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
          <div className="logo-wrapper">
            <img
              src={log}
              alt="شعار الأنثور"
              className="h-[280px] md:h-[360px] w-auto select-none"
              draggable="false"
            />
          </div>

          {/* CSS للحركة (مضمّن داخل نفس الملف) */}
          <style>{`
            .logo-wrapper {
              position: relative;
              display: inline-block;
              overflow: hidden; /* لإخفاء اللمعة خارج حدود الشعار */
              filter: drop-shadow(0 8px 24px rgba(0,0,0,0.08));
            }
            /* طبقة اللمعة */
            .logo-wrapper::before {
              content: '';
              position: absolute;
              top: -160%;
              left: 0;
              width: 100%;
              height: 320%;
              background: linear-gradient(
                to bottom,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0.6) 50%,
                rgba(255,255,255,0) 100%
              );
              animation: shineMove 2.5s linear infinite;
              pointer-events: none;
            }
            @keyframes shineMove {
              0%   { top: -160%; }
              100% { top: 160%;  }
            }
          `}</style>
        </div>
      )}

      {/* محتوى الصفحة */}
      <Banner />
      <TrendingProducts onProductsLoaded={() => setIsLoadingProducts(false)} />
    </>
  );
};

export default Home;