"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay,FreeMode  } from "swiper/modules";
import "swiper/css";
type Props = {
  clientLogos: string[];
};

export default function ClientLogoCarousel({ clientLogos }: Props) {
  return (
    <Swiper
      modules={[Autoplay,FreeMode]}
      loop={true}
      freeMode={true}
      speed={3000}
      allowTouchMove={false}
      autoplay={{
        delay: 0,
        disableOnInteraction: false,
      }}
      breakpoints={{
        320: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 40,
        },
        1024: {
          slidesPerView: 5,
          spaceBetween: 50,
        },
        1280: {
          slidesPerView: 6,
          spaceBetween: 60,
        },
      }}
    >
      {clientLogos.map((logo, index) => (
        <SwiperSlide key={index}>
          <div className="flex h-18 items-center justify-center rounded-lg border border-gray-200 bg-white p-4">
            <Image
              src={logo}
              alt={`Client ${index + 1}`}
              width={150}
              height={50}
              className="h-12 w-auto object-contain grayscale transition duration-300 hover:grayscale-0"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
