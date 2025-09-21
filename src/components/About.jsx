import React from 'react';
import { Link } from 'react-router-dom';
import ipadImg from '../assets/product_no_bg.png'; // غير المسار حسب صورتك

const About = () => {
  return (
    <div dir="rtl" className="bg-white text-[#4E5A3F]">
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8">
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          {/* الصورة */}
          <div className="md:w-1/2">
            <img
              src={ipadImg}
              alt="إكسسوارات آيباد igad"
              className="w-full max-w-md mx-auto rounded-xl  transform scale-105"
            />
          </div>

          {/* المحتوى النصي */}
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-[#d3ae27] mb-6">igad: إكسسوارات تصنع الفرق</h2>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-2xl italic text-[#9B2D1F]">
                "لأن الآيباد صار جزء من حياتك… igad يضيف له شخصية."
              </p>
              
              <p>
                كل واحد فينا يعرف إيش الآيباد صار شيء أساسي: نذاكر فيه، نشتغل، نرسم، أو حتى نتابع اللي نحبه. 
                لكن لما ندور على إكسسوارات، غالبًا نلقى السوق مليان خيارات مكررة ما تعكس شخصيتنا.
              </p>
              
              <p>
                من هنا بدأنا igad ✨: وجهة مختلفة لأي شخص يبي يجمع بين الأناقة والعملية. 
                بدأنا بالحقائب اللي تحمي وتضيف لمسة ذوق، وبعدها وسّعنا لتشمل كفرات، أقلام، شواحن، وحوامل مميزة.
              </p>
              
              <p>
                كل منتج عندنا مختار بعناية عشان يكون عملي ويضيف قيمة حقيقية لتجربة استخدامك للآيباد. 
                هدفنا إنك تلقى شيء يميّزك ويخلي جهازك أقرب لك.
              </p>
              
              <p className="font-semibold text-[#4E5A3F]">
                igad مش مجرد متجر… هو أسلوب حياة مع جهازك.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-2xl text-[#d3ae27] font-semibold">
            igad: خلي جهازك يحكي شخصيتك ✨
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
