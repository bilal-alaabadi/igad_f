import React from "react";
import log from "../assets/ΓÇÄΓü_ΓÇÅ_ä_é________º______ó_á_ó_Ñ-_á__-_á_ª__ü_è__í_í._Ñ__._ó_ñ_á__Γü_-removebg-preview-removebg-preview.png"; // غيّر لمسار شعار igad
import {
  SiVisa,
  SiMastercard,
  SiApplepay,
  SiGooglepay,
} from "react-icons/si";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#f5f5f5]">
      {/* ===== الشريط العلوي ===== */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 36"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M28 0 H100 V36 H28 A28 28 0 0 1 28 0 Z" fill="#e9b86b" />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* الشعار */}
            <div className="shrink-0 self-start">
              {/* <img
                src={log}
                alt="شعار igad"
                className="w-28 md:w-40 object-contain select-none pointer-events-none"
              /> */}
            </div>

            {/* وسائل الدفع */}
            <div className="text-white w-full md:w-auto md:ml-auto md:self-center">
              <div className="w-full flex justify-end">
                <div className="flex items-center gap-5 md:gap-6 mb-3 md:mb-4">
                  <SiVisa className="text-3xl md:text-4xl drop-shadow-sm" />
                  <SiMastercard className="text-3xl md:text-4xl drop-shadow-sm" />
                  <SiApplepay className="text-3xl md:text-4xl drop-shadow-sm" />
                  <SiGooglepay className="text-3xl md:text-4xl drop-shadow-sm" />
                </div>
              </div>

              <p className="text-right text-lg md:text-2xl font-semibold leading-relaxed">
                وسائل دفع متعددة
                <br />
                لتجربة تسوّق أسهل وأسرع
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* ===== نهاية الشريط العلوي ===== */}

      {/* الأقسام السفلية */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-[#2e3528] md:text-right text-center">
          {/* igad */}
          <div>
            <h4 className="text-xl font-bold mb-3">igad</h4>
            <p className="text-sm leading-7 text-[#4a4a4a]">
              في igad نهتم بكل ما يخص تجربة الآيباد: من الحقائب الأنيقة، إلى
              الكفرات العملية، الحماية عالية الجودة، وحتى الإكسسوارات الذكية.
              اخترنا منتجاتنا بعناية لتجمع بين التصميم العصري والوظائف
              التي تسهّل حياتك وتضيف لمسة تميز لجهازك.
            </p>
          </div>

          {/* روابط مهمة */}
          <div>
            <h4 className="text-xl font-bold mb-3">روابط مهمة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-[#d3ae27] transition">
                  قصتنا
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#d3ae27] transition">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link
                  to="/return-policy"
                  className="hover:text-[#d3ae27] transition"
                >
                  سياسة الاستبدال والاسترجاع
                </Link>
              </li>
            </ul>
          </div>

          {/* تواصل معنا */}
          <div>
            <h4 className="text-xl font-bold mb-3">تواصل معنا</h4>
            <p className="text-sm mb-4">+96891493355</p>
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="https://www.instagram.com/igad.om/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#d3ae27] transition"
                aria-label="Instagram - igad"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=96891493355&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#d3ae27] transition"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* الحقوق */}
        <div className="border-t border-[#2e3528]/20 pt-4 pb-8 text-center text-sm text-[#4a4a4a]">
          جميع الحقوق محفوظة لدى متجر igad —{" "}
          <a
            href="https://www.instagram.com/mobadeere/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#2e3528] transition-colors"
          >
            تصميم مبادر
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
