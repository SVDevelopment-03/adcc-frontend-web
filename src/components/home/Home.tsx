import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedButton } from "../ui/AnimatedButton";
import { AnimatedImage } from "../ui/AnimatedImage";
import { useTranslation } from "react-i18next";
import { useLocale } from "../../contexts/LocaleContext";
import { subscribeToNewsletter } from "../../services/newsletterApi";
import {
  HOME_STORE_FALLBACK_IMAGE,
  HOME_STORE_PRODUCTS,
} from "../../data/homeStoreProducts";
import { AppStoreButton } from "../public/AppStoreButton";
import { Bike, CalendarDays, MapPin, Users } from "lucide-react";

const TICKER_ITEMS = [
  {
    key: "members" as const,
    Icon: Users,
    iconClass: "home-ticker-icon--members",
    textClass: "home-ticker-text--members",
    bg: "#D9E7F9",
    dark: false,
  },
  {
    key: "loop" as const,
    Icon: MapPin,
    iconClass: "home-ticker-icon--md",
    textClass: "home-ticker-text--stat",
    bg: "#435974",
    dark: true,
  },
  {
    key: "events" as const,
    Icon: CalendarDays,
    iconClass: "home-ticker-icon--md",
    textClass: "home-ticker-text--stat",
    bg: "#D9E7F9",
    dark: false,
  },
  {
    key: "distance" as const,
    Icon: Bike,
    iconClass: "home-ticker-icon--lg",
    textClass: "home-ticker-text--stat",
    bg: "#435974",
    dark: true,
  },
];
const CSS = `
  @keyframes ticker-group-left {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cardRiseUp {
    from { opacity: 0; transform: translateY(64px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes appImageBloom {
    from {
      opacity: 0;
      transform: scale(0.78);
      filter: blur(10px);
    }
    to {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
  }
  @keyframes imageExpand {
    from {
      opacity: 0;
      filter: blur(8px);
    }

    to {
      opacity: 1;
      filter: blur(0);
    }
  }
  @keyframes aboutLeftFadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
      filter: blur(8px);
    }
    to {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
  }
  @keyframes aboutRightSlideIn {
    from {
      opacity: 0;
      transform: translateX(120px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  * { box-sizing: border-box; margin: 0; }
  body { background: #EAF4FF; }
  .home-page {
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }
  .home-page > header,
  .home-page > section,
  .home-page > footer {
    max-width: 100%;
  }

.app-phone-stage img{
    left: -150px !important;
    top: 50px;}
  [dir="rtl"] .app-phone-stage img {
    left: auto !important;
    right: -150px !important;
  }




  
  .home-hero {
    position: relative;
    width: 100%;
    height: 100vh;
    min-height: 480px;
    max-height: none;
    overflow: hidden;
    flex-shrink: 0;
    padding-inline-start:86px;
  }
  .home-hero-bg {
    position: absolute;
    inset: 0;
    background-image: url('/img/DSC04620.jpg 1.png');
    background-size: cover;
    background-position: center 28%;
    background-repeat: no-repeat;
  }
  .home-hero-content {
    position: absolute;
    inset-inline-start: 88px;
    top: clamp(96px, 24.9%, 201px);
    width: min(627px, calc(100% - 48px));
    max-width: 627px;
    z-index: 2;
  }
  .home-hero-title {
    font-family: 'Bebas Kai', sans-serif;
    font-weight: 400;
    font-size: clamp(40px, 5vw, 72px);
    line-height: 100.7%;
    color: #000000;
    text-transform: uppercase;
    margin: 0 0 28px;
    width: 100%;
    max-width: 627px;
  }
  .home-hero-title-line {
    display: block;
    overflow: hidden;
  }
  .home-hero-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .home-hero-download-btn {
    --adcc-btn-color: #FFF9EF;
    --adcc-btn-font-size: 18px;
    --adcc-btn-min-height: 49px;
    font-family: 'Satoshi', sans-serif !important;
    font-weight: 700 !important;
    font-size: 18px !important;
    line-height: 125% !important;
    color: #FFF9EF !important;
    text-align: center;
  }
  .home-hero-download-btn .adcc-btn__label {
    font-family: 'Satoshi', sans-serif !important;
    font-weight: 700 !important;
    font-size: 18px !important;
    line-height: 125% !important;
    text-align: center;
    color: #FFF9EF !important;
  }
  .home-hero-download-btn svg path {
    stroke: #FFF9EF;
  }
.font-satoshi
{
font-family: var(--font-satoshi) !important;}



  .hero-explore-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    min-height: 44px;
    padding: 0 22px;
    border: 2px solid #019839;
    border-radius: 30px;
    background: transparent;
    color: #019839;
    cursor: pointer;
    font-family: 'Satoshi', sans-serif;
    font-weight: 700;
    font-size: 18px;
    line-height: 125%;
    outline: none;
    transition: color 0.3s ease;
    white-space: nowrap;
  }
  .hero-explore-btn:hover,
  .hero-explore-btn:focus-visible {
    color: #fff;
  }
  .hero-explore-btn-inner {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    z-index: 1;
  }
  .hero-explore-btn-inner::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300%;
    padding-top: 300%;
    border-radius: 50%;
    background: #019839;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.8s ease;
    z-index: -1;
  }
  .hero-explore-btn:hover .hero-explore-btn-inner::before,
  .hero-explore-btn:focus-visible .hero-explore-btn-inner::before {
    transform: translate(-50%, -50%) scale(1);
  }
  .hero-explore-btn-icon {
    flex-shrink: 0;
    transition: filter 0.3s ease;
  }
  .hero-explore-btn:hover .hero-explore-btn-icon,
  .hero-explore-btn:focus-visible .hero-explore-btn-icon {
    filter: brightness(0) invert(1);
  }

  .home-ticker {
    width: 100%;
    height: 100px;
    overflow: hidden;
    position: relative;
  }
  .home-ticker-track {
    display: flex;
    align-items: stretch;
    width: max-content;
    animation: ticker-group-left 28s linear infinite;
  }
  .home-ticker-track:hover {
    animation-play-state: paused;
  }
  .home-ticker-item {
    flex: 0 0 418px;
    width: 418px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    flex-shrink: 0;
  }
  .home-ticker-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .home-ticker-icon--members {
    width: 28.34px;
    height: 24.04px;
  }
  .home-ticker-icon--md {
    width: 32px;
    height: 32px;
  }
  .home-ticker-icon--lg {
    width: 40.36px;
    height: 40.36px;
  }
  .home-ticker-text {
    font-family: 'Bebas Kai', sans-serif;
    font-style: normal;
    font-weight: 400;
    line-height: 90.7%;
    text-align: center;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .home-ticker-text--members {
    font-size: 26.1574px;
    color: #000000;
  }
  .home-ticker-text--stat {
    font-size: 29.6901px;
  }
  /* Arabic falls back to a regular sans-serif (Bebas Kai has no Arabic glyphs),
     which renders noticeably larger/heavier than the condensed Latin caps at
     the same font-size, so the ticker text overflows/crowds — scale it down. */
  html[dir='rtl'] .home-ticker-text--members {
    font-size: 20px;
  }
  html[dir='rtl'] .home-ticker-text--stat {
    font-size: 22px;
  }
  .home-ticker-text--light {
    color: #000000;
  }
  .home-ticker-text--dark {
    color: #ffffff;
  }

  .hover-green:hover { color: #019839 !important; }
  .home-page .adcc-btn--arrow:hover .adcc-btn__arrow--enter,
  .home-page .adcc-btn--arrow:focus-visible .adcc-btn__arrow--enter {
    inset-inline-start: calc(var(--adcc-btn-arrow-inset) - var(--adcc-btn-arrow-shift) + 15px);
  }
  .card-hover { transition: transform 0.25s, box-shadow 0.25s; }
  .card-hover:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
  .store-card { transition: transform 0.2s; }
  .store-card:hover { transform: none; }
  .store-rail {
    display: flex;
    gap: 20px;
    justify-content: center;
    max-width: 1268px;
    margin: 0 auto;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    padding-bottom: 8px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
  }
  .store-rail::-webkit-scrollbar {
    display: none;
  }
  .store-featured-card {
    flex: 0 0 624px;
    width: 624px;
    height: 583px;
    min-width: 624px;
    min-height: 583px;
    border-radius: 20px;
    background: linear-gradient(135deg, #CCDADD, #B0C4C7, #BDCED1, #99ADB0, #D7E2E3);
    position: relative;
    overflow: hidden;
    cursor: pointer;
    scroll-snap-align: start;
  }
  .store-featured-icon {
    position: absolute;
    inset-inline-start: 53px;
    top: 51px;
    width: 40px;
    height: 40px;
    background: #435974;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  .store-featured-icon img {
    width: 17.42px;
    height: 15.68px;
    object-fit: contain;
  }
  .store-featured-type {
    position: absolute;
    inset-inline-start: 105px;
    top: 64px;
    width: 162px;
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 14.02px;
    line-height: 100.7%;
    text-transform: uppercase;
    color: #000;
    z-index: 2;
  }
  .store-featured-action {
    position: absolute;
    inset-inline-end: 40px;
    top: 57px;
    width: 106px;
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 22px;
    line-height: 28px;
    color: #000;
    text-align: end;
    z-index: 2;
    padding-bottom: 4px;
  }
  .store-featured-action::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 4px;
    background: #019839;
    transition: width 0.35s ease;
  }
  .store-featured-card:hover .store-featured-action::after {
    width: 100%;
  }
  .store-featured-title {
    position: absolute;
    inset-inline-start: 62px;
    top: 211px;
    width: 197px;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 31.1053px;
    line-height: 39px;
    color: #000;
    z-index: 2;
  }
  .store-featured-sub {
    position: absolute;
    inset-inline-start: 62px;
    top: 344px;
    width: 222px;
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 14.5177px;
    line-height: 18px;
    color: #000;
    z-index: 2;
  }
  .store-featured-price {
    position: absolute;
    inset-inline-start: 62px;
    top: 502px;
    font-family: 'Bebas Kai', sans-serif;
    font-weight: 400;
    font-size: 42px;
    line-height: 100.7%;
    text-transform: uppercase;
    color: #435974;
    z-index: 2;
  }
  .store-featured-product-media {
    position: absolute;
    inset-inline-end: 38px;
    top: 96px;
    width: 338px;
    height: 390px;
    border-radius: 18px;
    overflow: hidden;
    z-index: 1;
  }
  .store-featured-product {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center bottom;
    display: block;
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }
  @media (any-hover: hover) {
    .store-featured-card:hover .store-featured-product {
      transform: scale(1.08);
    }
  }
  .store-featured-card.is-marketplace .store-featured-icon {
    top: 53px;
  }
  .store-featured-card.is-marketplace .store-featured-type {
    top: 66px;
    width: 186px;
  }
  .store-featured-card.is-marketplace .store-featured-action {
    inset-inline-end: 40px;
    top: 59px;
    width: 202px;
  }
  .store-featured-card.is-marketplace .store-featured-title {
    inset-inline-start: 50%;
    top: 142px;
    width: 316px;
    transform: translateX(-50%);
    text-align: center;
  }
  .store-featured-card.is-marketplace .store-featured-sub {
    inset-inline-start: 50%;
    top: 190px;
    width: 215px;
    transform: translateX(-50%);
    text-align: center;
  }
  .store-featured-card.is-marketplace .store-featured-price {
    inset-inline-start: 53px;
    top: 505px;
  }
  .store-featured-card.is-marketplace .store-featured-product-media {
    inset-inline: 32px 33px;
    top: 223px;
    width: calc(100% - 65px);
    height: 282px;
    border-radius: 0;
  }
  .store-carousel-controls {
    position: absolute;
    inset-inline-end: 38px;
    bottom: 38px;
    display: flex;
    gap: 12px;
    z-index: 3;
  }
  .store-carousel-button {
    width: 36px;
    height: 36px;
    border: 1.5px solid #000;
    border-radius: 50%;
    background: transparent;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    line-height: 1;
    transition: background 0.2s, color 0.2s;
  }
  .store-carousel-button:hover {
    background: #019839;
    color: #fff;
    border-color: #019839;
  }
  .store-compact-card {
    flex: 0 0 320px;
    width: 320px;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  }
  .home-qr-box img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .app-feature:hover .feature-icon { transform: scale(1.1); }
  .feature-icon { transition: transform 0.2s; }
  .fade-in { animation: fadeUp 0.6s ease both; }
  .app-phone-mockup {
    opacity: 0;
    transform: scale(0.78);
    transform-origin: center;
    will-change: transform, opacity, filter;
  }
  .app-phone-stage.is-visible .app-phone-mockup {
    animation: appImageBloom 1.25s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .journey-section {
    background: #EAF4FF;
    display: flex;
    gap: 43px;
    overflow: hidden;
    padding-block-start: 150px;
    padding-inline: 86px 0;
  }
  .journey-copy {
    // min-height: 376px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-shrink: 0;
    position: relative;
    min-width:411px;
    text-align: start;
    // padding-right:40px
  }
  .journey-title {
    font-family: 'Bebas Kai', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 72px;
    line-height: 100.7%;
    text-transform: uppercase;
    color: #000000;
    margin: 0;
    max-width: 411px;
  }
  .journey-title-line {
    display: block;
    overflow: hidden;
  }
  .journey-rider {
    overflow: hidden;
    position: absolute;
    bottom: -116px;
    inset-inline-start: -86px;
}

  // .journey-rider img {
  //   width: 430px;
  //   height: 100%;
  //   object-fit: cover;
  //   object-position: left bottom;
  //   display: block;
  // }
  .journey-content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0px;
    margin-bottom:128px;
  }
  .journey-text {
    font-family: 'Outfit', sans-serif !important;
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 26px;
    color: #000000;
    margin: 0 0 23px;
    max-width: 684px;
    text-align: start;
    text-transform: none;
  }
  .journey-button {
    min-width: 247px;
    justify-content: center;
    --adcc-btn-color: #FFF9EF;
    font-family: 'Satoshi', sans-serif !important;
    font-weight: 700 !important;
    font-size: 18px !important;
    line-height: 125% !important;
    color: #FFF9EF !important;
  }
  .journey-button .adcc-btn__label {
    font-family: 'Satoshi', sans-serif !important;
    font-weight: 700 !important;
    font-size: 18px !important;
    line-height: 125% !important;
    text-align: center;
    color: #FFF9EF !important;
  }
  // .journey-button-icon {
  //   width: 28px;
  //   height: 28px;
  //   background: rgba(255,255,255,0.25);
  //   border-radius: 50%;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  //   flex-shrink: 0;
  // }
  .home-community-section {
    background: #EAF4FF;
    padding: 125px 86px;
    text-align: center;
  }
  .home-community-eyebrow {
    font-family: 'Satoshi', sans-serif;
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 26px;
    text-transform: uppercase;
    letter-spacing: 0px;
    color: #000000;
    margin: 0 auto 20px;
    max-width: 886px;
  }
  .home-community-title {
    font-family: 'Bebas Kai', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 73.7245px;
    line-height: 100.7%;
    text-align: center;
    text-transform: uppercase;
    color: #000000;
    margin: 0 auto 48px;
    max-width: 681px;
  }
  .home-community-subtitle {
    font-family: 'Outfit', sans-serif !important;
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 26px;
    text-transform: uppercase;
    color: #000000;
    margin: 0 auto 28px;
    max-width: 886px;
  }
  .home-community-start-btn {
    --adcc-btn-color: #FFF9EF;
    font-family: 'Satoshi', sans-serif !important;
    font-weight: 700 !important;
    font-size: 18px !important;
    line-height: 125% !important;
    color: #FFF9EF !important;
  }
  .home-community-start-btn .adcc-btn__label {
    font-family: 'Satoshi', sans-serif !important;
    font-weight: 700 !important;
    font-size: 18px !important;
    line-height: 125% !important;
    text-align: center;
    color: #FFF9EF !important;
  }
  .home-icon-row {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 56px;
    max-width: 1200px;
  }
  .home-icon-row img {
    width: 128px;
    height: 128px;
    object-fit: contain;
    display: block;
  }
  .home-icon-divider {
    display: flex;
    align-items: center;
    padding: 0 24px;
  }
  .home-icon-divider-line {
    width: 50px;
    height: 2px;
    background: rgba(0, 0, 0, 0.25);
  }
  .home-icon-divider-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #000000;
    margin: 0 4px;
    flex-shrink: 0;
  }

  .home-platform-section {
    background: #EAF4FF;
    padding: 0 86px 80px;
  }
  .home-store-section {
    background: #EAF4FF;
    padding: 0 86px 80px;
  }
  .home-store-title {
    font-family: 'Bebas Kai', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 72px;
    line-height: 100.7%;
    text-transform: uppercase;
    text-align: center;
    color: #000000;
    margin: 0 auto 40px;
  }
  .home-about-section {
    background: #EAF4FF;
    padding: 60px 86px 80px;
    display: flex;
    align-items: center;
    gap: 60px;
    overflow: hidden;
    position: relative;
    min-height: 599px;
  }
  .home-about-left-image {
    flex-shrink: 0;
    width: 396px;
    height: 599px;
    border-radius: 19.3123px;
    overflow: hidden;
  }
  .home-about-left-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .home-about-content {
    flex: 1;
    min-width: 0;
    position: relative;
    z-index: 1;
    padding-inline-end: min(280px, 24vw);
  }
  .home-about-title {
    font-family: 'Bebas Kai', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 73.7245px;
    line-height: 100.7%;
    text-transform: uppercase;
    color: #000000;
    max-width: 508px;
    margin: 0 0 24px;
  }
  .home-about-text {
    font-family: 'Outfit', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 26px;
    color: #000000;
    max-width: 694px;
    margin: 0 0 40px;
    text-transform: none;
  }
  .home-about-stats {
    display: flex;
    gap: 80px;
    margin-bottom: 40px;
  }
  .home-about-stat-number {
    font-family: 'Outfit', sans-serif;
    font-style: normal;
    font-weight: 700;
    font-size: 50.3529px;
    line-height: 63px;
    color: #000000;
  }
  /* Arabic spells these out as full phrases ("أكثر من 15 ألف") instead of the
     short "15K+", so the number-sized font wraps/overflows — scale it down. */
  html[dir='rtl'] .home-about-stat-number {
    font-size: 32px;
    line-height: 38px;
  }
  .home-about-stat-label {
    font-family: 'Outfit', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 24px;
    color: #000000;
    margin-top: 0;
  }
  .home-about-rider {
    position: absolute;
    bottom: -5px;
    inset-inline-end: 0;
    width: 652px;
    height: 431px;
    pointer-events: none;
    z-index: 2;
  }
  .home-about-rider img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: right bottom;
    display: block;
    transform: rotate(-0.6deg);
  }
  .home-about-read-btn,
  .home-about-read-btn .adcc-btn__label {
    font-family: 'Satoshi', sans-serif !important;
    font-weight: 700 !important;
    font-size: 18px !important;
    line-height: 125% !important;
    color: #FFF9EF !important;
  }
  .home-platform-title {
    font-family: 'Bebas Kai', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 72px;
    line-height: 100.7%;
    text-transform: uppercase;
    text-align: center;
    color: #000000;
    padding-top: 35px;
    margin: 0 auto 40px;
    max-width: 551px;
  }
  .home-platform-cards {
    display: flex;
    gap: 0;
    justify-content: center;
    border-radius: 20px;
    overflow: hidden;
    max-width: 1268px;
    margin: 0 auto;
    height: 631px;
  }
  .home-platform-card {
    flex: 0 0 422.67px;
    width: 422.67px;
    height: 631px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border-inline-start: 2px solid rgba(255, 255, 255, 0.3);
  }
  .home-platform-card:first-child {
    border-inline-start: none;
    border-radius: 20px 0 0 20px;
  }
  .home-platform-card:last-child {
    border-radius: 0 20px 20px 0;
  }
  .home-platform-card .adcc-image__img,
  .home-platform-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }
  .home-platform-card-media {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }
  @media (any-hover: hover) {
    .home-platform-card:hover .home-platform-card-image,
    .journey-card:hover .journey-card-image .adcc-image__img {
      transform: scale(1.08);
    }
  }
  .home-platform-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(179.32deg, rgba(0, 0, 0, 0) 66.52%, rgba(0, 0, 0, 0.7) 80.39%);
    pointer-events: none;
    z-index: 1;
  }
  .home-platform-card-tag {
    position: absolute;
    top: 43px;
    inset-inline-start: 32px;
    background: #435974;
    border-radius: 18.6px;
    padding: 6px 14px;
    z-index: 2;
  }
  .home-platform-card-tag span {
    font-family: 'Outfit', sans-serif !important;
    font-style: normal;
    font-weight: 400;
    font-size: 18.6068px;
    line-height: 100.7%;
    text-transform: uppercase;
    color: #ffffff;
  }
  .home-platform-card-content {
    position: absolute;
    bottom: 37px;
    inset-inline: 32px;
    z-index: 2;
  }
  .home-platform-card-title {
    font-family: 'Bebas Kai', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 32px;
    line-height: 100.7%;
    text-transform: uppercase;
    color: #F6EFE7;
    margin: 0 0 12px;
  }
  .home-platform-card-action {
    font-family: 'Outfit', sans-serif !important;
    font-style: normal;
    font-weight: 400;
    font-size: 22px;
    line-height: 28px;
    color: #F6EFE7;
    display: inline-block;
    position: relative;
    padding-bottom: 4px;
  }
  .home-platform-card-action::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 3px;
    background: #F6EFE7;
    transition: width 0.35s ease;
  }
  .home-platform-card:hover .home-platform-card-action::after {
    width: 100%;
  }
  .platform-cards.is-visible .home-platform-card .adcc-image__img {
    opacity: 1;
  }

  @media (max-width: 1310px) and (min-width: 1025px) {
    .home-platform-cards {
      justify-content: flex-start;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    .home-platform-card {
      scroll-snap-align: start;
    }
  }

  .journey-cards {
    min-width: 0;
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }
  .journey-cards::-webkit-scrollbar { display: none; }
  .journey-scroll-controls {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    margin-bottom: 16px;
        justify-content: flex-end;
  }
  .journey-scroll-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid #000;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    flex-shrink: 0;
  }
  .journey-scroll-btn:hover {
    background: #019839;
    border-color: #019839;
  }
  .journey-scroll-btn:hover svg path {
    fill: #fff;
  }

  .journey-card {
    flex: 0 0 267px;
    padding:30px 25px 25px;
    height: 340px;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    opacity: 0;
    transform: translateY(64px);
    will-change: transform, opacity;
    transition: transform 0.25s, box-shadow 0.25s, background 0.25s;
  }
  .journey-cards.is-visible .journey-card {
    animation: cardRiseUp 1.15s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  .journey-cards.is-visible .journey-card:nth-child(1) { animation-delay: 0.08s; }
  .journey-cards.is-visible .journey-card:nth-child(2) { animation-delay: 0.24s; }
  .journey-cards.is-visible .journey-card:nth-child(3) { animation-delay: 0.40s; }
  .journey-cards.is-visible .journey-card:nth-child(4) { animation-delay: 0.56s; }
  .journey-cards.is-visible .journey-card:hover {
    background: #323232 !important;
    transform: translateY(-8px);
  }
  .platform-card {
    opacity: 0;
    transform: translateY(64px);
    will-change: transform, opacity;
  }
  .platform-cards.is-visible .platform-card {
    animation: cardRiseUp 1.15s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  .platform-cards.is-visible .platform-card:nth-child(1) { animation-delay: 0.08s; }
  .platform-cards.is-visible .platform-card:nth-child(2) { animation-delay: 0.24s; }
  .platform-cards.is-visible .platform-card:nth-child(3) { animation-delay: 0.40s; }
  .store-animated-card {
    opacity: 0;
    transform: translateY(64px);
    will-change: transform, opacity;
  }
  .store-rail.is-visible .store-animated-card {
    animation: cardRiseUp 1.15s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  .store-rail.is-visible .store-animated-card:nth-child(1) { animation-delay: 0.08s; }
  .store-rail.is-visible .store-animated-card:nth-child(2) { animation-delay: 0.24s; }
  .about-left-image {
    opacity: 0;
    transform: scale(0.9);
    will-change: transform, opacity, filter;
  }
  .about-right-image {
    opacity: 0;
    transform: translateX(120px);
    will-change: transform, opacity;
  }
  .about-section.is-visible .about-left-image {
    animation: aboutLeftFadeIn 1.15s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  .about-section.is-visible .about-right-image {
    animation: aboutRightSlideIn 1.15s cubic-bezier(0.2, 0.8, 0.2, 1) 0.18s both;
  }
  @media (max-width: 1310px) {
    .home-about-rider {
      width: min(520px, 42vw);
      height: auto;
      aspect-ratio: 652 / 431;
      inset-inline-end: 0;
      bottom: -20px;
    }
  }
  .journey-card-label {
    position: absolute;
    top: 30px;
    inset-inline-start: 25px;
    inset-inline-end: 56px;
    font-family: 'Bebas Kai', sans-serif;
    font-size: 26px;
    line-height: 29px;
    text-transform: uppercase;
    color: #FFF9EF;
    white-space: pre-line;
    text-align: start;
  }
  .journey-card-arrow {
    position: absolute;
    top: 30px;
    inset-inline-end: 25px;
    width: 47px;
    height: 47px;
    background: #FFF9EF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  [dir="rtl"] .journey-card-arrow svg {
    transform: scaleX(-1);
  }
  .journey-card-image {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 220px;
    height: 220px;
    border-radius: 14px;
    overflow: hidden;
  }
  .journey-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }

  .home-about-content {
    text-align: start;
  }
  .home-about-text {
    text-align: start;
  }
  .home-about-stat-label,
  .home-about-stat-number {
    text-align: start;
  }
  .app-feature {
    flex-direction: row;
  }
  .home-word-gap {
    display: inline-block;
    overflow: hidden;
    margin-inline-end: 14px;
  }
  .home-word-gap-sm {
    display: inline-block;
    overflow: hidden;
    margin-inline-end: 10px;
  }
  .home-phone-stage {
    position: relative;
    width: 100%;
    min-height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  [dir="rtl"] .home-platform-card {
    border-inline-start: 2px solid rgba(255,255,255,0.3) !important;
    border-left: none !important;
  }
  [dir="rtl"] .home-platform-card:first-child {
    border-inline-start: none !important;
  }
  [dir="rtl"] .home-platform-card-content {
    inset-inline: 32px !important;
    left: auto !important;
    right: auto !important;
  }
  [dir="rtl"] .store-featured-action {
    width: auto;
    max-width: 220px;
    white-space: nowrap;
  }
  [dir="rtl"] .store-featured-card.is-marketplace .store-featured-action {
    width: auto;
    max-width: 240px;
  }
  [dir="rtl"] .store-featured-type {
    width: auto;
    max-width: 200px;
  }

  @media (max-width: 980px) {
    .journey-section {
      grid-template-columns: 220px minmax(0, 1fr);
      gap: 28px;
      padding: 52px 0 52px 52px;
    }
    .journey-copy {
      min-height: 340px;
    }
    .journey-title {
      font-size: 34px;
    }
    .journey-rider {
      width: 240px;
      height: 150px;
      margin-inline-start: -52px;
    }
    .journey-cards {
      padding-inline-end: 52px;
    }
    .journey-card {
      flex-basis: 180px;
      height: 288px;
      border-radius: 12px;
    }
    .journey-card-label {
      top: 18px;
      inset-inline-start: 14px;
      inset-inline-end: 48px;
      font-size: 18px;
    }
    .journey-card-arrow {
      top: 16px;
      inset-inline-end: 14px;
      width: 32px;
      height: 32px;
    }
    .journey-card-image {
      width: calc(100% - 28px);
      height: 180px;
      bottom: 14px;
      border-radius: 10px;
    }
  }

  @media (max-width: 700px) {
    .journey-section {
      grid-template-columns: 1fr;
      gap: 28px;
      padding-block: 44px;
      padding-inline: 24px 0;
    }
    .journey-copy {
      min-height: auto;
      padding-inline-end: 24px;
    }
    .journey-title {
      font-size: 48px;
      line-height: 100.7%;
      margin-bottom: 18px;
      max-width: 320px;
    }
    .journey-rider {
      width: min(100%, 360px);
      height: 170px;
      margin: 4px 0 0;
      margin-inline-start: -24px;
    }
    .journey-rider img {
      width: 430px;
    }
    .journey-content {
      gap: 18px;
      padding-top: 0;
    }
    .journey-text {
      font-family: 'Outfit', sans-serif !important;
      max-width: 520px;
      margin: 0 0 18px;
      padding-inline-end: 24px;
    }
    .journey-cards {
      padding-inline-end: 24px;
    }
    .journey-card {
      flex-basis: 168px;
      height: 270px;
    }
    .journey-button,
    .journey-button .adcc-btn__label {
      font-size: 18px !important;
      line-height: 125% !important;
    }
    .store-rail {
      justify-content: flex-start !important;
    }
    .store-featured-card {
      flex: 0 0 624px !important;
      width: 624px !important;
      height: 583px !important;
      min-width: 624px !important;
      min-height: 583px !important;
    }
  }

  @media (max-width: 1024px) {
    .home-header {
      height: 92px !important;
      padding: 0 24px !important;
    }
    .home-logo-wrap {
      width: 132px !important;
      height: 56px !important;
    }
    .home-logo-wrap svg {
      width: 132px !important;
      height: auto !important;
    }
    .home-main-nav {
      display: none !important;
    }
    .home-header-actions {
      gap: 10px !important;
    }
    .home-language {
      display: none !important;
    }
    .home-menu-button {
      width: 86px !important;
      height: 42px !important;
      font-size: 15px !important;
    }
    .home-hero {
      height: 100vh !important;
      min-height: 440px !important;
      max-height: none !important;
    }
    .home-hero-bg {
      background-position: center 28% !important;
    }
    .home-hero-content {
      inset-inline-start: 56px !important;
      top: clamp(88px, 22%, 160px) !important;
      width: min(520px, calc(100% - 56px)) !important;
      max-width: 520px !important;
    }
    .home-hero-title {
      font-size: clamp(44px, 7vw, 56px) !important;
      line-height: 100.7% !important;
      margin-bottom: 20px !important;
      max-width: 520px !important;
    }
    .home-floating-bike {
      right: 24px !important;
      bottom: 34px !important;
      width: 52px !important;
      height: 52px !important;
    }
    .home-ticker-text--members {
      font-size: 24px !important;
    }
    .home-ticker-text--stat {
      font-size: 26px !important;
    }
    html[dir='rtl'] .home-ticker-text--members {
      font-size: 19px !important;
    }
    html[dir='rtl'] .home-ticker-text--stat {
      font-size: 20px !important;
    }
    .home-ticker-icon--members {
      width: 24px !important;
      height: 20.4px !important;
    }
    .home-ticker-icon--md {
      width: 27px !important;
      height: 27px !important;
    }
    .home-ticker-icon--lg {
      width: 34px !important;
      height: 34px !important;
    }
    .journey-section {
      display: flex !important;
      flex-direction: column !important;
      gap: 32px !important;
      overflow: hidden !important;
      padding: 58px 32px !important;
    }
    .journey-copy {
      min-width: 0 !important;
      width: 100% !important;
      min-height: auto !important;
      padding-right: 0 !important;
    }
    .journey-title {
      font-size: 56px !important;
      line-height: 1 !important;
    }
    .journey-rider {
      display: none !important;
    }
    .journey-content {
      width: 100% !important;
      margin-bottom: 0 !important;
      gap: 24px !important;
    }
    .journey-cards {
      width: 100% !important;
      max-width: 100% !important;
      overflow-x: auto !important;
      padding: 0 0 12px !important;
      -webkit-overflow-scrolling: touch;
    }
    .journey-card {
      flex: 0 0 240px !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .journey-text {
      max-width: 640px !important;
      margin-bottom: 20px !important;
      padding-right: 0 !important;
      font-size: 18px !important;
      line-height: 26px !important;
    }
    .home-app-section {
      padding: 56px 32px !important;
      flex-wrap: wrap !important;
      gap: 34px !important;
    }
    .home-app-copy {
      flex: 1 1 280px !important;
      width: 100% !important;
    }
    .home-app-title {
      font-size: 58px !important;
    }
    .home-qr-box {
      width: 160px !important;
      height: 160px !important;
    }
    .home-phone-stage {
      order: 1 !important;
      flex: 1 1 100% !important;
      min-height: 300px !important;
      width: 100% !important;
    }
    .home-phone-stage img {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
    }
    .home-feature-list {
      flex: 1 1 100% !important;
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 22px !important;
      min-width: 0 !important;
    }
    .home-community-section {
      padding: 82px 32px !important;
    }
    .home-community-eyebrow,
    .home-community-subtitle {
      font-size: 18px !important;
    }
    .home-community-title {
      font-size: clamp(44px, 8vw, 56px) !important;
      line-height: 100.7% !important;
      margin-bottom: 36px !important;
      max-width: 100% !important;
    }
    .home-icon-row img {
      width: 104px !important;
      height: 104px !important;
    }
    .home-icon-row {
      flex-wrap: wrap !important;
      gap: 18px !important;
    }
    .home-icon-divider {
      display: none !important;
    }
    .home-platform-section,
    .home-store-section {
      padding-left: 32px !important;
      padding-right: 32px !important;
    }
    .home-platform-title {
      font-size: clamp(44px, 8vw, 56px) !important;
      line-height: 100.7% !important;
      max-width: 100% !important;
    }
    .home-store-title {
      font-size: clamp(44px, 8vw, 56px) !important;
      line-height: 100.7% !important;
    }
    .home-platform-cards {
      height: auto !important;
      flex-direction: column !important;
      overflow: visible !important;
      max-width: 100% !important;
    }
    .home-platform-card {
      flex: none !important;
      width: 100% !important;
      max-width: 422.67px !important;
      height: 520px !important;
      margin: 0 auto !important;
      border-inline-start: none !important;
      border-radius: 20px !important;
      border-top: 2px solid rgba(255,255,255,0.3) !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .home-platform-card:first-child {
      border-top: none !important;
    }
    .home-section-title {
      font-size: 56px !important;
      line-height: 1 !important;
    }
    .home-about-section {
      padding: 56px 32px 70px !important;
      flex-wrap: wrap !important;
      gap: 34px !important;
    }
    .home-about-left-image {
      width: min(100%, 396px) !important;
      height: auto !important;
      max-height: 400px !important;
      aspect-ratio: 396 / 599;
    }
    .home-about-title {
      font-size: clamp(44px, 8vw, 58px) !important;
      max-width: 100% !important;
    }
    .home-about-text {
      font-size: 20px !important;
      line-height: 28px !important;
      max-width: 100% !important;
    }
    .home-about-stats {
      gap: 40px !important;
    }
    .home-about-stat-number {
      font-size: 42px !important;
      line-height: 52px !important;
    }
    html[dir='rtl'] .home-about-stat-number {
      font-size: 28px !important;
      line-height: 34px !important;
    }
    .home-about-stat-label {
      font-size: 20px !important;
    }
    .home-about-rider {
      display: none !important;
    }
    .home-about-content {
      padding-inline-end: 0 !important;
    }
    .store-animated-card {
      opacity: 1 !important;
      transform: none !important;
    }
    .home-cta {
      height: 360px !important;
    }
    .home-cta-content {
      padding: 0 32px !important;
    }
    .home-cta-title {
      font-size: 60px !important;
    }
    .home-footer-main {
      padding: 50px 32px 26px !important;
      flex-direction: column !important;
      gap: 38px !important;
    }
    .home-footer-brand {
      width: 100% !important;
    }
    .home-footer-links {
      flex-wrap: wrap !important;
      gap: 38px !important;
    }
    .home-footer-bottom {
      margin: 0 32px !important;
    }
  }

  @media (max-width: 640px) {
    .home-platform-card-image,
    .home-platform-card .adcc-image__img {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .home-header {
      height: 78px !important;
      padding: 0 16px !important;
    }
    .home-logo-wrap,
    .home-logo-wrap svg {
      width: 112px !important;
    }
    .home-header-actions > svg {
      display: none !important;
    }
    .home-menu-button {
      width: 76px !important;
      height: 38px !important;
      font-size: 14px !important;
    }
    .home-hero {
      height: 130vh !important;
      min-height: 400px !important;
      max-height: none !important;
    }
    .home-hero-bg {
      background-position: center 30% !important;
    }
    .home-hero-content {
      inset-inline-start: 20px !important;
      top: 110px !important;
      width: min(340px, calc(100% - 36px)) !important;
      max-width: 340px !important;
    }
    .home-hero-title {
      font-size: clamp(36px, 10vw, 40px) !important;
      line-height: 100.7% !important;
      letter-spacing: 0 !important;
      max-width: 340px !important;
    }
    .home-hero-actions {
      gap: 8px !important;
      flex-wrap: nowrap !important;
    }
    .home-hero-actions button {
      flex: 1 1 0 !important;
      min-width: 0 !important;
      height: 40px !important;
      padding: 0 10px !important;
    }
    .home-hero-download-btn {
      --adcc-btn-font-size: 14px !important;
      --adcc-btn-padding-x: 10px !important;
      --adcc-btn-min-height: 40px !important;
    }
    .home-hero-download-btn,
    .home-hero-download-btn .adcc-btn__label {
      font-size: 14px !important;
      line-height: 125% !important;
    }
    .hero-explore-btn {
      padding: 0 10px !important;
      font-size: 13px !important;
      min-height: 40px !important;
      justify-content: center !important;
      overflow: hidden !important;
    }
    .hero-explore-btn-icon {
      display: none !important;
    }
    .home-floating-bike {
      display: none !important;
    }
    .home-ticker-text--members {
      font-size: 22px !important;
    }
    .home-ticker-text--stat {
      font-size: 24px !important;
    }
    html[dir='rtl'] .home-ticker-text--members {
      font-size: 16px !important;
    }
    html[dir='rtl'] .home-ticker-text--stat {
      font-size: 17px !important;
    }
    .home-ticker-icon--members {
      width: 19px !important;
      height: 16.1px !important;
    }
    .home-ticker-icon--md {
      width: 21px !important;
      height: 21px !important;
    }
    .home-ticker-icon--lg {
      width: 26px !important;
      height: 26px !important;
    }
    .journey-section {
      padding-block: 42px !important;
      padding-inline: 18px 0 !important;
    }
    .journey-copy {
      min-width: 0 !important;
      width: 100% !important;
    }
    .journey-title {
      font-size: 30px !important;
      line-height: 100.7% !important;
      max-width: 100% !important;
    }
    .journey-rider {
      display: none !important;
    }
    .journey-text {
      font-family: 'Outfit', sans-serif !important;
      font-size: 17px !important;
      line-height: 24px !important;
    }
    .journey-content {
      gap: 20px !important;
    }
    .journey-cards {
      padding-inline-end: 18px !important;
    }
    .journey-card {
      flex-basis: 220px !important;
      height: 300px !important;
    }
    .journey-card-label {
      font-size: 22px !important;
      line-height: 25px !important;
    }
    .home-app-section {
      padding: 44px 18px !important;
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .home-app-title {
      font-size: 42px !important;
      line-height: 1 !important;
    }
    .home-download-label {
      font-size: 22px !important;
      line-height: 24px !important;
    }
    .home-qr-box {
      width: 140px !important;
      height: 140px !important;
      margin-bottom: 20px !important;
    }
    .home-store-buttons {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .home-store-buttons > div {
      justify-content: center !important;
      width: 100% !important;
    }
    .home-phone-stage {
      min-height: 200px !important;
      order: 0 !important;
    }
    .home-phone-stage img,
    .app-phone-stage img,
    [dir="rtl"] .home-phone-stage img,
    [dir="rtl"] .app-phone-stage img {
      width: 100% !important;
      max-height: 260px !important;
      object-fit: contain !important;
      left: 0 !important;
      right: 0 !important;
      top: 0 !important;
    }
    .home-feature-list {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 18px !important;
      width: 100% !important;
    }
    .home-feature-list .app-feature {
      align-items: flex-start !important;
      gap: 10px !important;
    }
    .home-feature-list span {
      font-size: 13px !important;
    }
    .home-community-section {
      padding: 60px 18px !important;
    }
    .home-community-eyebrow {
      font-size: 18px !important;
      line-height: 100.7% !important;
    }
    .home-community-subtitle {
      font-size: 18px !important;
      line-height: 26px !important;
    }
    .home-community-title {
      font-size: clamp(36px, 10vw, 42px) !important;
      line-height: 100.7% !important;
      margin-bottom: 30px !important;
      max-width: 100% !important;
    }
    .home-icon-row {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 22px !important;
      margin-bottom: 34px !important;
    }
    .home-icon-row img {
      width: 88px !important;
      height: 88px !important;
      margin: auto !important;
    }
    .home-platform-section,
    .home-store-section {
      padding-left: 18px !important;
      padding-right: 18px !important;
      padding-top: 48px !important;
      padding-bottom: 58px !important;
    }
    .home-section-title {
      font-size: 36px !important;
      margin-bottom: 20px !important;
    }
    .home-platform-title {
      text-align: center !important;
      margin: 0 0 16px 0 !important;
      padding-top: 0 !important;
    }
    .home-store-title {
      text-align: left !important;
      margin: 0 0 20px 0 !important;
      padding-top: 0 !important;
    }
    .home-platform-cards {
      gap: 14px !important;
      border-radius: 0 !important;
    }
    .home-platform-card {
      height: 280px !important;
      border-radius: 14px !important;
      margin: 0 !important;
    }
    .home-platform-card:first-child,
    .home-platform-card:last-child {
      border-radius: 14px !important;
    }
    .home-platform-card-tag {
      top: 16px !important;
      inset-inline-start: 16px !important;
      padding: 4px 10px !important;
      border-radius: 12px !important;
    }
    .home-platform-card-tag span {
      font-size: 13px !important;
      line-height: 1.2 !important;
    }
    .home-platform-card-content {
      position: absolute !important;
      left: 16px !important;
      right: 16px !important;
      bottom: 16px !important;
      inset-inline-start: unset !important;
      inset-inline-end: unset !important;
    }
    .home-platform-card-title {
      font-size: 16px !important;
      line-height: 1.25 !important;
      margin: 0 0 6px 0 !important;
      padding: 0 !important;
    }
    .home-platform-card-action {
      font-size: 13px !important;
      line-height: 1.4 !important;
    }
    .store-rail {
      gap: 14px !important;
      justify-content: flex-start !important;
    }
    .store-featured-card,
    .store-featured-card:hover {
      flex: 0 0 624px !important;
      width: 624px !important;
      height: 583px !important;
      min-width: 624px !important;
      min-height: 583px !important;
      transform: scale(0.52) !important;
      transform-origin: left top !important;
      /* Physical, not logical — see the matching rule below for why. */
      margin-right: -300px !important;
      margin-block-end: -280px !important;
    }
    .store-featured-product-media {
      inset-inline-end: 18px !important;
      top: 96px !important;
      width: 480px !important;
      height: 390px !important;
              left: 80px !important;
    }
    .store-compact-card {
      flex-basis: min(300px, calc(100vw - 36px)) !important;
      width: min(300px, calc(100vw - 36px)) !important;
    }
    .home-about-section {
      padding: 46px 18px 58px !important;
      flex-direction: column !important;
    }
    .home-about-left-image {
      width: 100% !important;
      height: 260px !important;
      aspect-ratio: unset !important;
      object-fit: cover !important;
    }
    .home-about-title {
      font-size: 42px !important;
      line-height: 100.7% !important;
    }
    .home-about-text {
      font-size: 16px !important;
      line-height: 24px !important;
    }
    .home-about-stats {
      gap: 24px !important;
      flex-wrap: wrap !important;
    }
    .home-about-stat-number {
      font-size: 30px !important;
      line-height: 40px !important;
    }
    html[dir='rtl'] .home-about-stat-number {
      font-size: 20px !important;
      line-height: 26px !important;
    }
    .home-about-stat-label {
      font-size: 18px !important;
    }
    .home-cta {
      height: auto !important;
      min-height: 360px !important;
    }
    .home-cta-content {
      padding: 48px 18px !important;
    }
    .home-cta-title {
      font-size: 44px !important;
    }
    .home-cta-text {
      font-size: 18px !important;
      line-height: 25px !important;
    }
    .home-cta-buttons {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 12px !important;
    }
    .home-cta-buttons > div {
      justify-content: center !important;
      width: 100% !important;
    }
    .home-footer-main {
      padding: 42px 18px 24px !important;
    }
    .home-newsletter {
      width: 100% !important;
    }
    .home-footer-links {
      flex-direction: column !important;
      gap: 28px !important;
    }
    .home-footer-bottom {
      margin: 0 18px !important;
    }
  }

  @media (max-width: 650px) {
    .home-hero-title,
    .home-app-title,
    .home-community-title,
    .home-section-title,
    .home-about-title,
    .home-cta-title {
      font-size: 30px !important;
    }
    .home-hero-content {
      width: min(300px, calc(100% - 36px)) !important;
      max-width: 300px !important;
    }
    .home-hero-title {
      font-size: 36px !important;
      max-width: 300px !important;
    }

html[dir='rtl'] .home-platform-card-content{
    bottom: 20px !important;}
    html[dir='rtl'] .home-platform-card-title {
        font-size: 16px !important;
    }html[dir='rtl'] .home-platform-card-action {
    font-size: 14px !important;
    padding-bottom: 0 !important;
}html[dir='rtl'] .home-platform-card-content{
    inset-inline: 0px !important;}

    .home-feature-list {
      grid-template-columns: 1fr !important;
    }
html[dir='rtl']  .store-featured-product-media{
        left: -40px !important;}



    .journey-card {
      flex-basis: 206px !important;
      height: 286px !important;
    }
    .journey-card-image {
      height: 178px !important;
    }
    .journey-button {
      width: auto !important;
      min-width: 0 !important;
    }
    .home-store-buttons > div,
    .home-cta-buttons > div {
      padding-left: 18px !important;
      padding-right: 18px !important;
    }
    .home-qr-box {
      width: 140px !important;
      height: 140px !important;
    }
    .home-phone-stage {
      min-height: 240px !important;
    }
    .home-phone-stage img {
      max-height: 255px !important;
    }
    .home-icon-row {
      gap: 16px !important;
    }
    .home-platform-title {
      font-size: 34px !important;
      line-height: 100.7% !important;
      padding-top: 16px !important;
      margin-bottom: 16px !important;
    }
    .home-store-title {
      font-size: 34px !important;
      line-height: 100.7% !important;
      margin-bottom: 20px !important;
              text-align: center !important;
    }
    .home-platform-card {
      height: 350px !important;
    }
    .home-platform-card-title {
      font-size: 17px !important;
      line-height: 1.2 !important;
      margin-bottom: 6px !important;
    }
    .home-platform-card-action {
      font-size: 14px !important;
      line-height: 20px !important;
    }
    .store-featured-card,
    .store-featured-card:hover {
      flex: 0 0 624px !important;
      width: 624px !important;
      height: 583px !important;
      min-width: 624px !important;
      min-height: 583px !important;
      transform: scale(0.5) !important;
      transform-origin: left top !important;
      /* Physical, not logical: transform-origin above always anchors to the
         literal top-left corner regardless of direction, so the negative
         margin reclaiming the scaled-away space must also be physical
         (margin-right). margin-inline-end resolves to margin-left once
         .store-featured-card is direction:rtl for Arabic, which pulls the
         wrong side and corrupts every card's position after it. */
      margin-right: -312px !important;
      margin-block-end: -292px !important;
    }
    .home-about-left-image {
      height: 380px !important;
      aspect-ratio: unset !important;
    }
    .home-about-stats {
      display: grid !important;
      grid-template-columns: 1fr !important;
    }
    .home-cta-text {
      font-size: 16px !important;
    }

    div.home-about-stats{
            grid-template-columns: 1fr 1fr 1fr !important;}
  }
`;

function useHomePageStyles() {
  useEffect(() => {
    // Only the webfont link needs to be injected imperatively — loading it a
    // beat late just means a font swap, not a layout flash. The page's own
    // CSS is rendered inline via <style>{CSS}</style> in Home() below so it's
    // present in the very first paint (see the ticker-icon flash this used
    // to cause when it was injected here instead, after mount).
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap";
    fontLink.dataset.pageStyle = "home";

    document.head.appendChild(fontLink);

    return () => {
      fontLink.remove();
    };
  }, []);
}

/* ─── SVG Assets ─────────────────────────────────────────────────────────────*/

function ADCCLogo({ size = 1, light = false }) {
  const color = light ? "#ffffff" : "#000000";
  const subColor = light ? "rgba(255,255,255,0.7)" : "#333";
  return (
    <svg
      width={180 * size}
      height={75.6 * size}
      viewBox="0 0 180 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="52"
        fontFamily="'Arial Black', sans-serif"
        fontWeight="900"
        fontSize="46"
        fill={color}
        letterSpacing="-1"
      >
        AB
      </text>
      <circle
        cx="102"
        cy="34"
        r="16"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
      />
      <circle cx="102" cy="34" r="4.5" fill={color} />
      <line
        x1="102"
        y1="18"
        x2="102"
        y2="50"
        stroke={color}
        strokeWidth="1.5"
      />
      <line x1="86" y1="34" x2="118" y2="34" stroke={color} strokeWidth="1.5" />
      <line
        x1="90.7"
        y1="22.7"
        x2="113.3"
        y2="45.3"
        stroke={color}
        strokeWidth="1.2"
      />
      <line
        x1="113.3"
        y1="22.7"
        x2="90.7"
        y2="45.3"
        stroke={color}
        strokeWidth="1.2"
      />
      <circle
        cx="138"
        cy="34"
        r="16"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
      />
      <circle cx="138" cy="34" r="4.5" fill={color} />
      <line
        x1="138"
        y1="18"
        x2="138"
        y2="50"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="122"
        y1="34"
        x2="154"
        y2="34"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="126.7"
        y1="22.7"
        x2="149.3"
        y2="45.3"
        stroke={color}
        strokeWidth="1.2"
      />
      <line
        x1="149.3"
        y1="22.7"
        x2="126.7"
        y2="45.3"
        stroke={color}
        strokeWidth="1.2"
      />
      <text
        x="92"
        y="52"
        fontFamily="'Arial Black', sans-serif"
        fontWeight="900"
        fontSize="46"
        fill={color}
        letterSpacing="-1"
      >
        HABI
      </text>
      <text
        x="6"
        y="70"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fill={subColor}
        letterSpacing="1.5"
      >
        AD CYCLING CLUB
      </text>
      <text
        x="88"
        y="70"
        fontFamily="Arial, sans-serif"
        fontSize="9"
        fill={subColor}
        letterSpacing="0.5"
      >
        نادي أبوظبي للدراجات
      </text>
    </svg>
  );
}

function CloudyIcon() {
  return (
    <svg width="37" height="37" viewBox="0 0 37 37" fill="none">
      <circle cx="15" cy="13" r="5" fill="#F5A623" />
      <line
        x1="15"
        y1="5"
        x2="15"
        y2="8"
        stroke="#F5A623"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="18"
        x2="15"
        y2="21"
        stroke="#F5A623"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="13"
        x2="10"
        y2="13"
        stroke="#F5A623"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="13"
        x2="23"
        y2="13"
        stroke="#F5A623"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="9.5"
        y1="7.5"
        x2="11.6"
        y2="9.6"
        stroke="#F5A623"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="20.5"
        y1="7.5"
        x2="18.4"
        y2="9.6"
        stroke="#F5A623"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13 26 Q13 21 19 21 Q20 16 26 18 Q32 18 32 24 Q32 30 22 30 Q10 30 10 26 Q10 22 15 22 Q13 24 13 26Z"
        fill="white"
        stroke="#b0bec5"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function CyclingIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle
        cx="8"
        cy="22"
        r="5"
        fill="none"
        stroke="#019839"
        strokeWidth="2"
      />
      <circle
        cx="24"
        cy="22"
        r="5"
        fill="none"
        stroke="#019839"
        strokeWidth="2"
      />
      <circle cx="19" cy="10" r="2" fill="#019839" />
      <path
        d="M19 12 L16 18 L8 22"
        stroke="#019839"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M19 12 L24 22"
        stroke="#019839"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M13 18 L24 18"
        stroke="#019839"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRight({ color = "#019839", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── QR Code placeholder ───────────────────────────────────────────────────*/
function QRCodePlaceholder() {
  return <img src="/images/barcode.png" className="" />;
}

/* ─── HEADER ─────────────────────────────────────────────────────────────────*/
function Header() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { label: t("public.nav.aboutUs"), href: "#about" },
    { label: t("public.nav.events"), href: "/user-event" },
    { label: t("public.nav.community"), href: "#community", active: true },
    { label: t("public.nav.challenges"), href: "/user-challenges" },
    { label: t("public.nav.tracks"), href: "#platform" },
  ];
  return (
    <header
      className="home-header"
      style={{
        width: "100%",
        height: 134,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 86px",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        className="home-logo-wrap"
        style={{ width: 180, height: 75.6, flexShrink: 0 }}
      >
        <ADCCLogo />
      </div>
      <nav
        className="home-main-nav"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 48,
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="hover-green"
            style={{
              fontFamily: "'Bebas Kai', sans-serif",
              fontWeight: 500,
              fontSize: 20,
              lineHeight: "27px",
              color: link.active ? "#019839" : "#000",
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "color 0.2s",
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div
        className="home-header-actions"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <CloudyIcon />
        <span
          className="home-language"
          style={{
            fontFamily: "'Bebas Kai', sans-serif",
            fontWeight: 500,
            fontSize: 17,
            color: "#000",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t("public.language.english")}
        </span>
        <AnimatedButton
          onClick={() => setMenuOpen((v) => !v)}
          showArrow={false}
          className="home-menu-button w-[101px]"
          style={{ background: menuOpen ? "#017a2e" : undefined }}
        >
          {t("public.auth.menu")}
        </AnimatedButton>
      </div>
    </header>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────────────────*/
function HeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const line1 = t("public.home.hero.line1");
  const line2 = t("public.home.hero.line2");
  const heroImage =
    locale === "ar" ? "/img/ar-home.png" : "/img/DSC04620.jpg 1.png";

  const lineVariants = {
    hidden: { y: "120%", opacity: 0 },
    visible: { y: "0%", opacity: 1 },
  };

  return (
    <section className="home-hero public-hero-bleed">
      <div
        className="home-hero-bg"
        style={{ backgroundImage: `url('${heroImage}')` }}
        aria-hidden
      />
      <div className="home-hero-content">
        <motion.h1
          key={locale}
          className="home-hero-title"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.12 },
            },
          }}
        >
          {[line1, line2].map((line, lineIndex) => (
            <span key={lineIndex} className="home-hero-title-line">
              <motion.span
                className="inline-block"
                variants={lineVariants}
                transition={{
                  duration: 0.7,
                  delay: lineIndex * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h1>
        <div className="home-hero-actions">
          <AnimatedButton
            showArrow={false}
            size="default"
            className="home-hero-download-btn"
            onClick={() =>
              document
                .getElementById("start-your-ride")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {t("public.home.hero.downloadApp")}{" "}
            <img
              src="/img/download-gif.gif"
              alt=""
              aria-hidden="true"
              style={{
                width: 20,
                height: 20,
                display: "inline-block",
                verticalAlign: "middle",
              }}
            />
          </AnimatedButton>
          <button
            className="hero-explore-btn"
            onClick={() => navigate("/user-tracks")}
          >
            <span className="hero-explore-btn-inner">
              {t("public.home.hero.exploreTracks")}

              <img
                src="/img/explore.svg"
                alt=""
                aria-hidden="true"
                width={28}
                height={28}
                className="hero-explore-btn-icon"
              />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── STATS TICKER ───────────────────────────────────────────────────────────*/
function StatsTicker() {
  const { t } = useTranslation();

  const renderItem = (item: (typeof TICKER_ITEMS)[number], itemKey: string) => {
    const { Icon } = item;
    const iconColor = item.dark ? "#ffffff" : "#000000";

    return (
      <div
        className="home-ticker-item"
        key={itemKey}
        style={{ background: item.bg }}
      >
        <span className={`home-ticker-icon ${item.iconClass}`}>
          <Icon
            color={iconColor}
            strokeWidth={2}
            aria-hidden
            className="h-full w-full"
          />
        </span>
        <span
          className={`home-ticker-text ${item.textClass} ${
            item.dark ? "home-ticker-text--dark" : "home-ticker-text--light"
          }`}
        >
          {t(`public.home.stats.${item.key}`)}
        </span>
      </div>
    );
  };

  return (
    <div className="home-ticker" aria-label={t("public.home.stats.members")}>
      <div className="home-ticker-track">
        {TICKER_ITEMS.map((item, index) =>
          renderItem(item, `ticker-a-${index}`),
        )}
        {TICKER_ITEMS.map((item, index) =>
          renderItem(item, `ticker-b-${index}`),
        )}
      </div>
    </div>
  );
}

function scrambleText(element: HTMLElement, finalText: string, speed = 2) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let iteration = 0;

  const interval = setInterval(() => {
    element.innerText = finalText
      .split("")
      .map((letter, index) => {
        if (index < iteration) {
          return finalText[index];
        }

        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    if (iteration >= finalText.length) {
      clearInterval(interval);
    }

    iteration += 1 / 2;
  }, speed);
}

/* ─── CYCLING JOURNEY ────────────────────────────────────────────────────────*/
function CyclingJourneySection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);

  const scrollCards = (direction: "left" | "right") => {
    const el = cardsRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "right" ? 300 : -300,
      behavior: "smooth",
    });
  };
  const titleLine1 = t("public.home.journey.titleLine1");
  const titleLine2 = t("public.home.journey.titleLine2");
  const journeyText = t("public.home.journey.text");
  const cards = [
    {
      label: t("public.home.journey.cards.tracks"),
      bg: "#777777",
      img: "/images/journey-1.png",
      to: "/user-tracks",
    },
    {
      label: t("public.home.journey.cards.events"),
      bg: "#777777",
      img: "/images/journey-2.png",
      to: "/user-event",
    },
    {
      label: t("public.home.journey.cards.challenges"),
      bg: "#777777",
      img: "/images/journey-3.png",
      to: "/user-challenges",
    },
    {
      label: t("public.home.journey.cards.community"),
      bg: "#777777",
      img: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&q=80",
      to: "/user-communities",
    },
  ];

  useEffect(() => {
    const cardsEl = cardsRef.current;
    if (!cardsEl) return;

    if (textRef.current) {
      if (locale === "ar") {
        textRef.current.textContent = journeyText;
      } else {
        scrambleText(textRef.current, journeyText);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setCardsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(cardsEl);

    return () => observer.disconnect();
  }, [journeyText, locale]);

  return (
    <section className="journey-section">
      <div className="journey-copy">
        <motion.h2
          className="journey-title"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
        >
          {[titleLine1, titleLine2].map((line, lineIndex) => (
            <span key={lineIndex} className="journey-title-line">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "120%", opacity: 0 },
                  visible: { y: "0%", opacity: 1 },
                }}
                transition={{
                  duration: 0.7,
                  delay: lineIndex * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        <motion.div
          className="journey-rider"
          initial={{ opacity: 0, x: -150 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
          }}
          viewport={{ once: true }}
        >
          <img
            src={
              locale === "ar" ? "/images/journey-ar.png" : "/images/journey.png"
            }
            alt={t("public.home.journey.riderAlt")}
          />
        </motion.div>
      </div>
      <div className="journey-content">
        <div
          ref={cardsRef}
          className={`journey-cards${cardsVisible ? " is-visible" : ""}`}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="card-hover journey-card"
              style={{ background: card.bg }}
              onClick={() => navigate(card?.to)}
            >
              <span className="journey-card-label">{card.label}</span>
              <div className="journey-card-arrow">
                <svg
                  width="22"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z"
                    fill="#C12D32"
                  />
                </svg>
              </div>
              {/* <div className="journey-card-image">
                <img src={card.img} alt={card.label.replace('\n', ' ')} />
              </div> */}
              <div className="journey-card-image adcc-image adcc-image--fill adcc-image--strong">
                <img
                  className="adcc-image__img"
                  src={card.img}
                  alt={card.label.replace("\n", " ")}
                  style={{
                    animation: cardsVisible
                      ? `imageExpand 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 0.18}s forwards`
                      : "none",
                    opacity: 0,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="journey-scroll-controls">
          <button
            className="journey-scroll-btn"
            onClick={() => scrollCards("left")}
            aria-label={t("public.home.journey.scrollLeft")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 22 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: "scaleX(-1)" }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z"
                fill="#000"
              />
            </svg>
          </button>
          <button
            className="journey-scroll-btn"
            onClick={() => scrollCards("right")}
            aria-label={t("public.home.journey.scrollRight")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 22 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z"
                fill="#000"
              />
            </svg>
          </button>
        </div>
        <div>
          {/* <p className="journey-text">Choose how you want to ride with ADCC. Discover routes, join challenges, and be part of a growing cycling community.</p> */}
          <p ref={textRef} className="journey-text">
            {journeyText}
          </p>
          <AnimatedButton
            onClick={() => navigate("/user-tracks")}
            className="journey-button"
          >
            {t("public.home.journey.exploreRoutes")}
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
}

/* ─── APP SECTION ────────────────────────────────────────────────────────────*/
function AppSection() {
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const _appTitleWordsRaw = t("public.home.app.titleWords", {
    returnObjects: true,
  });
  const appTitleWords: string[] = Array.isArray(_appTitleWordsRaw)
    ? _appTitleWordsRaw
    : [];
  const _dlRaw = t("public.home.app.downloadLabelWords", {
    returnObjects: true,
  });
  const downloadLabelWords: string[] = Array.isArray(_dlRaw) ? _dlRaw : [];
  const downloadLine1 = downloadLabelWords.slice(0, 1);
  const downloadLine2 = downloadLabelWords.slice(1);
  const features = [
    { icon: "/images/icon-1.png", label: t("public.home.app.features.track") },
    {
      icon: "/images/icon-2.png",
      label: t("public.home.app.features.challenges"),
    },
    {
      icon: "/images/icon-3.png",
      label: t("public.home.app.features.connect"),
    },
    { icon: "/images/icon-4.png", label: t("public.home.app.features.routes") },
  ];

  useEffect(() => {
    const phoneEl = phoneRef.current;
    if (!phoneEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPhoneVisible(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(phoneEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="app"
      className="home-app-section"
      style={{
        background: "#435974",
        width: "100%",
        padding: "40px 86px 80px",
        display: "flex",
        alignItems: "center",
        gap: 60,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left: Title + Download label + QR + Store buttons */}
      <div
        className="home-app-copy"
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <h2
          className="home-app-title overflow-hidden"
          style={{
            fontFamily: "'Bebas Kai', sans-serif",
            fontSize: 80,
            lineHeight: 1,
            textTransform: "uppercase",
            color: "#fff",
            marginBottom: 32,
          }}
        >
          {appTitleWords.slice(0, 3).join(" ")}
          <br />
          {appTitleWords.slice(3).join(" ")}
        </h2>

        <motion.p
          className="home-download-label overflow-hidden font-satoshi"
          style={{
            fontWeight: 700,
            fontSize: 30,
            color: "#fff",
            textTransform: "uppercase",
            marginBottom: 23,
            lineHeight: "30px",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {downloadLine1.map((word, index) => (
            <span
              key={index}
              className="home-word-gap-sm inline-block overflow-hidden"
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "120%", opacity: 0 },
                  visible: { y: "0%", opacity: 1 },
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
          <br />
          {downloadLine2.map((word, index) => (
            <span
              key={index}
              className="home-word-gap-sm inline-block overflow-hidden"
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "120%", opacity: 0 },
                  visible: { y: "0%", opacity: 1 },
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.p>

        <div
          className="home-store-buttons"
          style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <AppStoreButton type="google" />
          <AppStoreButton type="apple" />
        </div>
      </div>

      {/* Center: Phone mockup */}
      <div
        ref={phoneRef}
        className={`app-phone-stage home-phone-stage${phoneVisible ? " is-visible" : ""}`}
        style={{
          flex: "1 1 auto",
          position: "relative",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          minHeight: 520,
        }}
      >
        <img
          src="/images/image%203066.png"
          alt={t("public.home.app.phoneAlt")}
          style={{
            display: "block",
            width: "95%",
            maxWidth: "none",
            height: "auto",
            objectFit: "contain",
            opacity: 1,
            position: "relative",
            zIndex: 1,
          }}
        />
      </div>

      {/* Right: Feature list */}
      <div
        className="home-feature-list"
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 48,
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            className="app-feature"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              cursor: "default",
              flexDirection: "column",
            }}
          >
            <div
              className="feature-icon"
              style={{
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img src={f.icon} alt={f.label.replace("\n", " ")} />
            </div>
            <span
              className="font-satoshi"
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "#fff",
                textTransform: "uppercase",
                lineHeight: 1.2,
                whiteSpace: "pre-line",
              }}
            >
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── COMMUNITY / EAT SLEEP BIKE ────────────────────────────────────────────*/

function CommunitySection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const icons = [
    {
      icon: "/images/vegetabl.gif",
      label: t("public.home.community.icons.eat"),
    },
    {
      icon: "/images/moon-night.gif",
      label: t("public.home.community.icons.sleep"),
    },
    {
      icon: "/images/cycling.gif",
      label: t("public.home.community.icons.bike"),
    },
    {
      icon: "/images/sync.gif",
      label: t("public.home.community.icons.repeat"),
    },
  ];

  const lineVariants = {
    hidden: { y: "120%", opacity: 0 },
    visible: { y: "0%", opacity: 1 },
  };

  return (
    <section id="community" className="home-community-section">
      <motion.p
        className="home-community-eyebrow"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.span
          className="inline-block"
          variants={lineVariants}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {t("public.home.community.eyebrow")}
        </motion.span>
      </motion.p>

      <motion.h2
        className="home-community-title"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.span
          className="inline-block"
          variants={lineVariants}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {t("public.home.community.title")}
        </motion.span>
      </motion.h2>

      <div className="home-icon-row">
        {icons.map((ic, i) => (
          <React.Fragment key={ic.label}>
            <div className="home-icon-item">
              <img src={ic.icon} alt={ic.label} />
            </div>
            {i < icons.length - 1 && (
              <div className="home-icon-divider" aria-hidden>
                <div className="home-icon-divider-line" />
                <div className="home-icon-divider-dot" />
                <div className="home-icon-divider-line" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <motion.p
        className="home-community-subtitle font-satoshi"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.span
          className="inline-block"
          variants={lineVariants}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {t("public.home.community.subtitle")}
        </motion.span>
      </motion.p>

      <AnimatedButton
        className="home-community-start-btn"
        onClick={() => navigate("/user-event")}
      >
        {t("public.home.community.startRiding")}
      </AnimatedButton>
    </section>
  );
}

/* ─── EXPLORE THE PLATFORM ───────────────────────────────────────────────────*/
function ExplorePlatformSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const cards = [
    {
      tag: t("public.home.platform.cards.events.tag"),
      img: "/images/explore-1.png",
      title: t("public.home.platform.cards.events.title"),
      action: t("public.home.platform.cards.events.action"),
      to: "/user-events",
    },
    {
      tag: t("public.home.platform.cards.tracks.tag"),
      img: "/images/explore-2.png",
      title: t("public.home.platform.cards.tracks.title"),
      action: t("public.home.platform.cards.tracks.action"),
      to: "/user-tracks",
    },
    {
      tag: t("public.home.platform.cards.challenges.tag"),
      img: "/images/explore-3.png",
      title: t("public.home.platform.cards.challenges.title"),
      action: t("public.home.platform.cards.challenges.action"),
      to: "/user-challenges",
    },
  ];

  useEffect(() => {
    const cardsEl = cardsRef.current;
    if (!cardsEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setCardsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(cardsEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="platform" className="home-platform-section">
      <motion.h2
        className="home-platform-title"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.span
          className="inline-block"
          variants={{
            hidden: { y: "120%", opacity: 0 },
            visible: { y: "0%", opacity: 1 },
          }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {t("public.home.platform.title")}
        </motion.span>
      </motion.h2>
      <div
        ref={cardsRef}
        className={`platform-cards home-platform-cards${cardsVisible ? " is-visible" : ""}`}
      >
        {cards.map((card, i) => (
          <div
            key={card.to}
            onClick={() => navigate(card.to)}
            className="card-hover platform-card home-platform-card"
          >
            <div className="home-platform-card-media adcc-image adcc-image--fill adcc-image--strong">
              <img
                className="adcc-image__img home-platform-card-image"
                src={card.img}
                alt={card.title}
                style={{
                  animation: cardsVisible
                    ? `imageExpand 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 0.18}s forwards`
                    : "none",
                  opacity: 0,
                }}
              />
            </div>
            <div className="home-platform-card-overlay" aria-hidden />
            <div className="home-platform-card-tag">
              <span>{card.tag}</span>
            </div>
            <div className="home-platform-card-content">
              <p className="home-platform-card-title">{card.title}</p>
              <span className="home-platform-card-action">{card.action}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── ADCC STORE ─────────────────────────────────────────────────────────────*/
function StoreMarketplaceCarousel({
  images,
  title,
  fallbackImage,
}: {
  images: string[];
  title: string;
  fallbackImage: string;
}) {
  const slides = images.length ? images : [fallbackImage];
  const activeIndex = 0;

  return (
    <div className="store-featured-product-media">
      <img
        className="store-featured-product adcc-image__img"
        src={slides[activeIndex]}
        alt={title}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = fallbackImage;
        }}
      />
    </div>
  );
}

function StoreSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const storeRailRef = useRef<HTMLDivElement | null>(null);
  const [storeCardsVisible, setStoreCardsVisible] = useState(false);

  useEffect(() => {
    const railEl = storeRailRef.current;
    if (!railEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStoreCardsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(railEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="store" className="home-store-section">
      <h2 className="home-store-title">{t("public.home.store.title")}</h2>
      <div
        ref={storeRailRef}
        className={`store-rail${storeCardsVisible ? " is-visible" : ""}`}
      >
        {HOME_STORE_PRODUCTS.map((product) => (
          <div
            key={product.id}
            onClick={() =>
              navigate(
                product.variant === "marketplace"
                  ? "/user-marketplace"
                  : "/user-adcc-store",
              )
            }
            className={`store-card store-featured-card store-animated-card${product.variant === "marketplace" ? " is-marketplace" : ""}`}
          >
            <div className="store-featured-icon">
              <img src="/images/users.png" alt="" />
            </div>
            <span className="store-featured-type">{t(product.typeKey)}</span>
            <span className="store-featured-action">
              {t(product.actionKey)}
            </span>
            <h3 className="store-featured-title">{t(product.titleKey)}</h3>
            <p className="store-featured-sub">{t(product.subKey)}</p>
            {product.variant === "marketplace" ? (
              <StoreMarketplaceCarousel
                images={product.images ?? [product.img]}
                title={t(product.titleKey)}
                fallbackImage={HOME_STORE_FALLBACK_IMAGE}
              />
            ) : (
              <div className="store-featured-product-media">
                <img
                  className="store-featured-product adcc-image__img"
                  src={product.img}
                  alt={t(product.titleKey)}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = HOME_STORE_FALLBACK_IMAGE;
                  }}
                />
              </div>
            )}
            {/* <span className="store-featured-price">{t(product.priceKey)}</span> */}
          </div>
        ))}
      </div>
    </section>
  );
}

function scrambleNumber(element: HTMLElement, finalText: string, speed = 30) {
  const chars = "1234567890+";
  let iteration = 0;

  const interval = setInterval(() => {
    element.innerText = finalText
      .split("")
      .map((letter, index) => {
        if (index < iteration) {
          return finalText[index];
        }

        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    if (iteration >= finalText.length) {
      clearInterval(interval);
    }

    iteration += 1.5;
  }, speed);
}

/* ─── ABOUT SECTION ──────────────────────────────────────────────────────────*/
function AboutSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const hasAnimatedStats = useRef(false);
  const aboutRef = useRef<HTMLElement | null>(null);
  const statsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [aboutVisible, setAboutVisible] = useState(false);
  const _titleWordsRaw = t("public.home.about.titleWords", {
    returnObjects: true,
  });
  const titleWords: string[] = Array.isArray(_titleWordsRaw)
    ? _titleWordsRaw
    : [];
  const stats = [
    {
      num: t("public.home.about.stats.ridersValue"),
      label: t("public.home.about.stats.riders"),
    },
    {
      num: t("public.home.about.stats.eventsValue"),
      label: t("public.home.about.stats.events"),
    },
    {
      num: t("public.home.about.stats.yearsValue"),
      label: t("public.home.about.stats.years"),
    },
  ];

  useEffect(() => {
    const aboutEl = aboutRef.current;
    if (!aboutEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setAboutVisible(true);

        if (!hasAnimatedStats.current) {
          hasAnimatedStats.current = true;

          statsRefs.current.forEach((el, index) => {
            if (el) {
              setTimeout(() => {
                scrambleNumber(el, stats[index].num, 25);
              }, index * 180);
            }
          });
        }

        observer.disconnect();
      },
      // { threshold: 0.35 }
      { threshold: 0.1 },
    );

    observer.observe(aboutEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={aboutRef}
      id="about"
      className={`about-section home-about-section${aboutVisible ? " is-visible" : ""}`}
    >
      <motion.div
        className="home-about-left-image about-left-image adcc-image-group"
        initial={{ opacity: 0, x: isRtl ? 300 : -300 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <video
          src="/video/event-1.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </motion.div>
      <div className="home-about-content">
        <motion.h2
          className="home-about-title overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {titleWords.slice(0, 3).map((word, index) => (
            <span
              key={index}
              className="home-word-gap inline-block overflow-hidden"
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "120%", opacity: 0 },
                  visible: { y: "0%", opacity: 1 },
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}

          {titleWords.length > 3 && (
            <>
              <br />
              {titleWords.slice(3).map((word, index) => (
                <span
                  key={index + 3}
                  className="home-word-gap inline-block overflow-hidden"
                >
                  <motion.span
                    className="inline-block"
                    variants={{
                      hidden: { y: "120%", opacity: 0 },
                      visible: { y: "0%", opacity: 1 },
                    }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </>
          )}
        </motion.h2>
        <p className="home-about-text">{t("public.home.about.text")}</p>
        <div className="home-about-stats">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="home-about-stat-number">
                <div ref={(el) => (statsRefs.current[i] = el)}>{s.num}</div>
              </div>
              <div className="home-about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        <AnimatedButton
          className="home-about-read-btn"
          onClick={() => navigate("/aboutus")}
        >
          {t("public.home.about.readMore")}
        </AnimatedButton>
      </div>
      <motion.div
        className="home-about-rider about-right-image adcc-image-group"
        initial={{ opacity: 0, x: 150 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <AnimatedImage
          bare
          fill
          zoom="subtle"
          src={isRtl ? "/images/right-cycle-ar.png" : "/images/right-cycle.png"}
          alt={t("public.home.about.riderAlt")}
          style={{ width: "100%", height: "100%" }}
        />
      </motion.div>
    </section>
  );
}

/* ─── CTA BANNER ─────────────────────────────────────────────────────────────*/
function CTABanner() {
  const { t } = useTranslation();

  return (
    <section
      className="home-cta"
      style={{
        position: "relative",
        width: "100%",
        height: 420,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(https://images.unsplash.com/photo-1508784411316-06c06401e69b?w=1440&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
        }}
      />
      <div
        className="home-cta-content"
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 86px",
        }}
      >
        <h2
          className="home-cta-title"
          style={{
            fontFamily: "'Bebas Kai', sans-serif",
            fontSize: 88,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 1.0,
            marginBottom: 16,
          }}
        >
          {t("public.home.cta.title")}
        </h2>
        <p
          className="home-cta-text"
          style={{
            fontFamily: "'Bebas Kai', sans-serif",
            fontSize: 22,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 36,
          }}
        >
          {t("public.home.cta.subtitle")}
        </p>
        {/* App store buttons */}
        <div className="home-cta-buttons" style={{ display: "flex", gap: 20 }}>
          {[
            {
              bg: "white",
              top: t("public.footer.getItOn"),
              main: t("public.footer.googlePlay"),
              icon: "▶",
            },
            {
              bg: "white",
              top: t("public.footer.downloadOn"),
              main: t("public.footer.appStore"),
              icon: "",
            },
          ].map((btn, i) => (
            <div
              key={i}
              style={{
                background: btn.bg,
                borderRadius: 100,
                padding: "12px 28px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ fontSize: 24 }}>{i === 0 ? "▶" : ""}</div>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                style={{ display: i === 1 ? "block" : "none" }}
              >
                <path
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                  fill="#000"
                />
              </svg>
              <div>
                <div
                  style={{
                    fontFamily: "'Bebas Kai', sans-serif",
                    fontSize: 10,
                    color: "#555",
                  }}
                >
                  {btn.top}
                </div>
                <div
                  style={{
                    fontFamily: "'Bebas Kai', sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#000",
                  }}
                >
                  {btn.main}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────────*/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailMessageType, setEmailMessageType] = useState<"success" | "error">(
    "success",
  );
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const quickLinks = [
    t("public.nav.aboutUs"),
    t("public.footer.rides"),
    t("public.nav.events"),
    t("public.footer.cyclistsCorner"),
    t("public.footer.contactUs"),
  ];
  const contactItems = [
    { icon: "📞", text: "+971 2 654 5645" },
    { icon: "💬", text: "144226" },
    { icon: "✉️", text: "info@adcyclingclub.ae" },
    {
      icon: "📍",
      text: t("public.footer.address"),
    },
  ];

  const handleEmailSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailMessageType("error");
      setEmailMessage(t("public.home.newsletter.emailRequired"));
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailMessageType("error");
      setEmailMessage(t("public.home.newsletter.emailInvalid"));
      return;
    }

    try {
      setIsSubmittingEmail(true);
      setEmailMessage("");
      await subscribeToNewsletter(normalizedEmail);
      setEmail("");
      setEmailMessageType("success");
      setEmailMessage(t("public.home.newsletter.thanks"));
    } catch (error) {
      setEmailMessageType("error");
      setEmailMessage(
        error instanceof Error
          ? error.message
          : t("public.home.newsletter.subscribeError"),
      );
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <footer style={{ background: "#ffffff", borderTop: "1px solid #e5e5e5" }}>
      <div
        className="home-footer-main"
        style={{ padding: "60px 86px 30px", display: "flex", gap: 60 }}
      >
        {/* Logo + tagline + newsletter */}
        <div
          className="home-footer-brand"
          style={{ flexShrink: 0, width: 340 }}
        >
          <div style={{ marginBottom: 24 }}>
            <ADCCLogo size={0.83} />
          </div>
          <p
            style={{
              fontFamily: "'Bebas Kai', sans-serif",
              fontSize: 16,
              color: "#333",
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            {t("public.footer.brandText")}
          </p>
          {/* Email signup */}
          <div
            className="home-newsletter"
            style={{
              display: "flex",
              background: "#8DDF93",
              borderRadius: 10,
              overflow: "hidden",
              height: 52,
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailMessage) setEmailMessage("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEmailSubmit();
              }}
              placeholder={t("public.home.newsletter.placeholder")}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                padding: "0 16px",
                fontFamily: "'Bebas Kai', sans-serif",
                fontSize: 15,
                color: "#333",
                outline: "none",
              }}
            />
            <AnimatedButton
              disabled={isSubmittingEmail}
              showArrow={false}
              squareEnd
              size="sm"
              onClick={handleEmailSubmit}
              style={{ height: "100%", borderRadius: "0 10px 10px 0" }}
            >
              {isSubmittingEmail
                ? t("public.home.newsletter.saving")
                : t("public.home.newsletter.submit")}
            </AnimatedButton>
          </div>
          {emailMessage && (
            <p
              style={{
                fontFamily: "'Bebas Kai', sans-serif",
                fontSize: 13,
                color: emailMessageType === "success" ? "#019839" : "#C12D32",
                marginTop: 8,
              }}
            >
              {emailMessage}
            </p>
          )}
        </div>

        <div
          className="home-footer-links"
          style={{ flex: 1, display: "flex", gap: 60 }}
        >
          {/* Quick links */}
          <div>
            <h3
              style={{
                fontFamily: "'Bebas Kai', sans-serif",
                fontSize: 24,
                color: "#000",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              {t("public.home.footer.quickLinks")}
            </h3>
            <ul style={{ listStyle: "none" }}>
              {quickLinks.map((l) => (
                <li key={l} style={{ marginBottom: 14 }}>
                  <a
                    href="#"
                    className="hover-green"
                    style={{
                      fontFamily: "'Bebas Kai', sans-serif",
                      fontSize: 17,
                      color: "#000",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3
              style={{
                fontFamily: "'Bebas Kai', sans-serif",
                fontSize: 24,
                color: "#000",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              {t("public.home.footer.contactUs")}
            </h3>
            <ul style={{ listStyle: "none" }}>
              {contactItems.map((c, i) => (
                <li
                  key={i}
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>
                    {c.icon}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Bebas Kai', sans-serif",
                      fontSize: 16,
                      color: "#000",
                      lineHeight: 1.4,
                    }}
                  >
                    {c.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* Social */}
          <div>
            <h3
              style={{
                fontFamily: "'Bebas Kai', sans-serif",
                fontSize: 24,
                color: "#000",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              {t("public.home.footer.followUs")}
            </h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["📘", "📷", "🐦", "▶️"].map((icon, i) => (
                <div
                  key={i}
                  style={{
                    width: 44,
                    height: 44,
                    background: "#EAF4FF",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 20,
                    transition: "background 0.2s",
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
            {/* Green badge */}
            <div
              style={{
                marginTop: 32,
                width: 55,
                height: 55,
                background: "#019839",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(1,152,57,0.3)",
                cursor: "pointer",
              }}
            >
              <ADCCLogo size={0.19} light={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Divider + copyright */}
      <div
        className="home-footer-bottom"
        style={{
          borderTop: "1px solid #D5D5D5",
          margin: "0 86px",
          padding: "20px 0",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Bebas Kai', sans-serif",
            fontSize: 16,
            color: "rgba(0,0,0,0.6)",
          }}
        >
          {t("public.home.footer.copyright")}
        </span>
      </div>
    </footer>
  );
}

/* ─── HOME PAGE ──────────────────────────────────────────────────────────────*/
export function Home() {
  useHomePageStyles();

  return (
    <div
      className="home-page"
      style={{
        minHeight: "100vh",
        background: "#EAF4FF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Rendered inline (not injected via useEffect) so it's present in the
          very first paint — otherwise elements it sizes (e.g. the stats
          ticker icons) briefly flash at browser-default size before the
          effect runs. */}
      <style>{CSS}</style>
      <HeroSection />
      <StatsTicker />
      <CyclingJourneySection />
      <AppSection />
      <CommunitySection />
      <ExplorePlatformSection />
      <StoreSection />
      <AboutSection />
      {/* <CTABanner />
      <Footer /> */}
    </div>
  );
}

export default Home;
