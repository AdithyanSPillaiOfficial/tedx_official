"use client";
import React, { useState, useEffect } from "react";
import Video from "@core/Video";
import HeroText from "@widgets/LandingPage/components/HeroText";
import AboutView from "@widgets/About";
import Welcome from "@widgets/LandingPage/components/Welcome";
import ScrollTextView from "@widgets/LandingPage/components/ScrollTextView";
import OurThemeView from "@widgets/OurTheme";
import Image from "next/image";
import PreLoader from "@components/PreLoader";

const LandingPageView: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const minimumLoadTime = 0; // Minimum load time in milliseconds (1 second)
    const loadStartTime = Date.now();

    const handleLoad = () => {
      const loadEndTime = Date.now();
      const elapsedTime = loadEndTime - loadStartTime;
      const remainingTime = minimumLoadTime - elapsedTime;

      if (remainingTime > 0) {
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      } else {
        setLoading(false);
      }
    };

    const images = Array.from(document.images) as HTMLImageElement[];
    const videos = Array.from(
      document.getElementsByTagName("video")
    ) as HTMLVideoElement[];

    const checkIfMediaLoaded = () => {
      const allLoaded =
        images.every((img) => img.complete) &&
        videos.every((video) => video.readyState >= 3);
      if (allLoaded) {
        handleLoad();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        handleLoad();
      } else {
        img.addEventListener("load", handleLoad);
      }
    });

    videos.forEach((video) => {
      if (video.readyState >= 3) {
        handleLoad();
      } else {
        video.addEventListener("loadeddata", handleLoad);
      }
    });

    checkIfMediaLoaded();

    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", handleLoad);
      });
      videos.forEach((video) => {
        video.removeEventListener("loadeddata", handleLoad);
      });
    };
  }, []);

  if (loading) {
    return <PreLoader />;
  }

  return (
    <>
      <div className="bg-slk-black-200 flex flex-col relative overflow-hidden w-full h-[89vh] md:min-h-screen lg:min-h-screen">
        <Video
          // url="https://firebasestorage.googleapis.com/v0/b/tedxccet.appspot.com/o/assets%2Flow_bit%20(1).mp4?alt=media&token=517c6e35-d681-4018-ba79-310d29b89c73"
          url="/home.mp4"
          className="absolute inset-0 w-full h-full object-cover hidden md:flex lg:flex"
        />
        <Image
          loading="lazy"
          src="https://firebasestorage.googleapis.com/v0/b/tedxccet.appspot.com/o/assets%2FScreenshot%202024-07-28%20120618.png?alt=media&token=cf069e18-85d2-4938-9a5a-b045cec4e028"
          alt="TEDxCCET Event"
          width={1000}
          height={1000}
          className="absolute inset-0 w-full h-full object-cover flex md:hidden lg:hidden"
        />
        <div className="absolute inset-0 bg-black-100 opacity-80 md:opacity-80 lg:opacity-80" />
        <HeroText />
      </div>
      <ScrollTextView />
      <Welcome />
      <OurThemeView />
      <AboutView />
    </>
  );
};

export default LandingPageView;
