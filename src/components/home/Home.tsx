import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoreItems, StoreItem } from '../../services/storeApi';
import { subscribeToNewsletter } from '../../services/newsletterApi';
import { motion } from "framer-motion";
import gsap from "gsap";
import useEmblaCarousel from 'embla-carousel-react';

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
      transform: scaleX(0.2) scaleY(0.2);
      filter: blur(8px);
    }

    to {
      opacity: 1;
      transform: scaleX(1) scaleY(1);
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
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #EAF4FF; }
  ::-webkit-scrollbar { display: none; }
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

  .hover-green:hover { color: #019839 !important; }
  .btn-green { transition: background 0.2s; }
  .btn-green:hover { background: #017a2e !important; }
  .card-hover { transition: transform 0.25s, box-shadow 0.25s; }
  .card-hover:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
  .store-card { transition: transform 0.2s; }
  .store-card:hover { transform: translateY(-4px); }
  .store-rail {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
  }
  .store-featured-card {
    flex: 0 0 624px;
    width: 624px;
    height: 583px;
    border-radius: 20px;
    background: #D8E5FB;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  }
  .store-featured-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 72% 50%, rgba(255,255,255,0.56) 0 18%, rgba(255,255,255,0) 39%),
      linear-gradient(90deg, rgba(255,255,255,0.34), rgba(255,255,255,0) 45%);
    pointer-events: none;
  }
  .store-featured-icon {
    position: absolute;
    left: 53px;
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
    left: 105px;
    top: 64px;
    width: 162px;
    font-family: 'Outfit', sans-serif;
    font-size: 14.02px;
    line-height: 100.7%;
    text-transform: uppercase;
    color: #000;
    z-index: 2;
  }
  .store-featured-action {
    position: absolute;
    right: 40px;
    top: 57px;
    width: 106px;
    font-family: 'Outfit', sans-serif;
    font-size: 22px;
    line-height: 28px;
    color: #000;
    border-bottom: 5px solid #019839;
    text-align: right;
    z-index: 2;
  }
  .store-featured-card.is-marketplace .store-featured-icon {
    top: 53px;
  }
  .store-featured-card.is-marketplace .store-featured-type {
    top: 66px;
    width: 186px;
  }
  .store-featured-card.is-marketplace .store-featured-action {
    right: 40px;
    top: 59px;
    width: 202px;
  }
  .store-featured-title {
    position: absolute;
    left: 62px;
    top: 211px;
    width: 197px;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 31.1053px;
    line-height: 39px;
    color: #000;
    z-index: 2;
  }
  .store-featured-card.is-marketplace .store-featured-title {
    left: 50%;
    top: 142px;
    width: 316px;
    transform: translateX(-50%);
    text-align: center;
  }
  .store-featured-sub {
    position: absolute;
    left: 62px;
    top: 344px;
    width: 222px;
    font-family: 'Outfit', sans-serif;
    font-size: 14.5177px;
    line-height: 18px;
    color: #000;
    z-index: 2;
  }
  .store-featured-card.is-marketplace .store-featured-sub {
    left: 50%;
    top: 190px;
    width: 215px;
    transform: translateX(-50%);
    text-align: center;
  }
  .store-featured-price {
    position: absolute;
    left: 62px;
    top: 502px;
    font-family: 'Bebas Neue', 'Bebas Kai', sans-serif;
    font-size: 42px;
    line-height: 100.7%;
    text-transform: uppercase;
    color: #435974;
    z-index: 2;
  }
  .store-featured-card.is-marketplace .store-featured-price {
    left: 53px;
    top: 505px;
  }
  .store-featured-product {
    position: absolute;
    right: 38px;
    top: 96px;
    width: 338px;
    height: 390px;
    object-fit: cover;
    object-position: center;
    border-radius: 18px;
    z-index: 1;
  }
  .store-featured-card.is-marketplace .store-featured-product {
    left: 32px;
    right: 33px;
    top: 223px;
    width: calc(100% - 65px);
    height: 282px;
    object-fit: contain;
    border-radius: 0;
  }
  .store-product-carousel {
    overflow: hidden;
  }
  .store-product-carousel-track {
    display: flex;
    height: 100%;
  }
  .store-product-carousel-slide {
    flex: 0 0 100%;
    min-width: 0;
    height: 100%;
  }
  .store-product-carousel-slide img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .store-carousel-controls {
    position: absolute;
    right: 38px;
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
    padding: 150px 0 0px 86px;
    // min-height: 430px;
  }
  .journey-copy {
    // min-height: 376px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-shrink: 0;
    position: relative;
    min-width:411px;
    // padding-right:40px
  }
  .journey-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 72px;
    line-height: 1.01;
    text-transform: uppercase;
    color: #000;
    margin: 0;
    
   
  }
  .journey-rider {
    overflow: hidden;
    position: absolute;
    bottom: -116px;
    left: -86px;
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
    gap: 46px;
    margin-bottom:128px;
  }
  .journey-text {
    font-family: 'Outfit', sans-serif;
    font-size: 24px;
    line-height: 30px;
    color: #000;
    margin: 0 0 23px;
    max-width: 700px;
}
.journey-button {
    display: inline-flex;
    align-items: center;
    gap: 25px;
    background: #019839;
    border: 0;
    border-radius: 30px;
    padding: 13px 26px;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: #FFF9EF;
    white-space: nowrap;
    min-width: 247px;
    justify-content: center;
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
  .journey-cards {
    min-width: 0;
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
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
  .store-rail.is-visible .store-animated-card:nth-child(3) { animation-delay: 0.40s; }
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
  .journey-card-label {
    position: absolute;
    top: 30px;
    left: 25px;
    right: 56px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    line-height: 29px;
    text-transform: uppercase;
    color: #FFF9EF;
    white-space: pre-line;
  }
  .journey-card-arrow {
    position: absolute;
    top: 30px;
    right: 25px;
    width: 47px;
    height: 47px;
    background: #FFF9EF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
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
      margin-left: -52px;
    }
    .journey-cards {
      padding-right: 52px;
    }
    .journey-card {
      flex-basis: 180px;
      height: 288px;
      border-radius: 12px;
    }
    .journey-card-label {
      top: 18px;
      left: 14px;
      right: 48px;
      font-size: 18px;
    }
    .journey-card-arrow {
      top: 16px;
      right: 14px;
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
      padding: 44px 0 44px 24px;
    }
    .journey-copy {
      min-height: auto;
      padding-right: 24px;
    }
    .journey-title {
      font-size: 48px;
      margin-bottom: 18px;
    }
    .journey-rider {
      width: min(100%, 360px);
      height: 170px;
      margin: 4px 0 0 -24px;
    }
    .journey-rider img {
      width: 430px;
    }
    .journey-content {
      gap: 18px;
      padding-top: 0;
    }
    .journey-text {
      max-width: 520px;
      margin: 0 0 18px;
      padding-right: 24px;
    }
    .journey-cards {
      padding-right: 24px;
    }
    .journey-card {
      flex-basis: 168px;
      height: 270px;
    }
    .journey-button {
      font-size: 14px;
      padding: 10px 16px;
    }
    .store-featured-card {
      flex-basis: min(624px, calc(100vw - 48px));
      width: min(624px, calc(100vw - 48px));
      height: 520px;
    }
    .store-featured-icon {
      left: 28px;
      top: 30px;
    }
    .store-featured-type {
      left: 80px;
      top: 43px;
      font-size: 12px;
    }
    .store-featured-action {
      right: 28px;
      top: 36px;
      font-size: 18px;
      line-height: 24px;
      border-bottom-width: 4px;
    }
    .store-featured-title {
      left: 30px;
      top: 160px;
      width: 190px;
      font-size: 28px;
      line-height: 35px;
    }
    .store-featured-sub {
      left: 30px;
      top: 280px;
      width: 220px;
    }
    .store-featured-price {
      left: 30px;
      top: 440px;
      font-size: 38px;
    }
    .store-featured-product {
      right: -16px;
      top: 120px;
      width: 52%;
      height: 300px;
    }
    .store-featured-card.is-marketplace .store-featured-action {
      width: 172px;
    }
    .store-featured-card.is-marketplace .store-featured-title {
      top: 136px;
      width: 300px;
    }
    .store-featured-card.is-marketplace .store-featured-sub {
      top: 184px;
    }
    .store-featured-card.is-marketplace .store-featured-product {
      left: 28px;
      right: 28px;
      top: 220px;
      width: calc(100% - 56px);
      height: 220px;
    }
    .store-featured-card.is-marketplace .store-featured-price {
      left: 30px;
      top: 440px;
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
      height: 640px !important;
    }
    .home-hero-bg {
      background-position: 62% top !important;
    }
    .home-hero-content {
      left: 32px !important;
      right: 24px !important;
      bottom: 260px !important;
      max-width: 430px !important;
    }
    .home-hero-title {
      font-size: 56px !important;
      line-height: 1.02 !important;
      margin-bottom: 20px !important;
    }
    .home-floating-bike {
      right: 24px !important;
      bottom: 34px !important;
      width: 52px !important;
      height: 52px !important;
    }
    .home-ticker {
      height: 78px !important;
    }
    .home-ticker-item {
      height: 78px !important;
      padding: 0 24px !important;
    }
    .home-ticker-text {
      font-size: 23px !important;
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
      font-size: 20px !important;
      line-height: 28px !important;
    }
    .home-app-section {
      padding: 56px 32px !important;
      flex-wrap: wrap !important;
      gap: 34px !important;
    }
    .home-app-copy {
      flex: 1 1 280px !important;
    }
    .home-app-title {
      font-size: 58px !important;
    }
    .home-qr-box {
      width: 190px !important;
      height: 190px !important;
    }
    .home-phone-stage {
      order: 3 !important;
      flex: 1 1 100% !important;
      min-height: 360px !important;
      width: 100% !important;
    }
    .home-phone-stage img {
      max-width: 100% !important;
      height: auto !important;
    }
    .home-feature-list {
      flex: 1 1 260px !important;
      gap: 22px !important;
      min-width: 0 !important;
    }
    .home-community-section {
      padding: 82px 32px !important;
    }
    .home-community-eyebrow,
    .home-community-subtitle {
      font-size: 22px !important;
    }
    .home-community-title {
      font-size: 56px !important;
      margin-bottom: 36px !important;
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
    .home-section-title {
      font-size: 56px !important;
      line-height: 1 !important;
    }
    .home-platform-cards {
      height: auto !important;
      flex-direction: column !important;
    }
    .home-platform-card {
      flex: none !important;
      height: 360px !important;
      border-left: none !important;
      border-top: 2px solid rgba(255,255,255,0.3) !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .home-platform-card:first-child {
      border-top: none !important;
    }
    .home-about-section {
      padding: 56px 32px 70px !important;
      flex-wrap: wrap !important;
      gap: 34px !important;
    }
    .home-about-left-image {
      width: min(100%, 340px) !important;
      height: 440px !important;
    }
    .home-about-content {
      flex: 1 1 420px !important;
    }
    .home-about-title {
      font-size: 58px !important;
    }
    .home-about-rider {
      display: none !important;
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
      height: 560px !important;
    }
    .home-hero-bg {
      background-position: 70% top !important;
    }
    .home-hero-content {
      left: 18px !important;
      right: 18px !important;
      bottom: 235px !important;
      max-width: 300px !important;
    }
    .home-hero-title {
      font-size: 40px !important;
      line-height: 1.04 !important;
      letter-spacing: 0 !important;
    }
    .home-hero-actions {
      gap: 10px !important;
    }
    .home-hero-actions button {
      height: 40px !important;
      padding: 0 16px !important;
      font-size: 14px !important;
    }
    .home-floating-bike {
      display: none !important;
    }
    .home-ticker {
      height: 64px !important;
    }
    .home-ticker-item {
      height: 64px !important;
      padding: 0 18px !important;
    }
    .home-ticker-text {
      font-size: 19px !important;
    }
    .journey-section {
      padding: 42px 18px !important;
    }
    .journey-copy {
      min-width: 0 !important;
      width: 100% !important;
    }
    .journey-title {
      font-size: 42px !important;
      line-height: 1 !important;
    }
    .journey-rider {
      display: none !important;
    }
    .journey-text {
      font-size: 17px !important;
      line-height: 24px !important;
    }
    .journey-content {
      gap: 20px !important;
    }
    .journey-cards {
      margin-right: -18px !important;
      padding-right: 18px !important;
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
      width: 156px !important;
      height: 156px !important;
      margin-bottom: 24px !important;
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
      min-height: 280px !important;
    }
    .home-phone-stage img {
      max-height: 300px !important;
      object-fit: contain !important;
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
    .home-community-eyebrow,
    .home-community-subtitle {
      font-size: 18px !important;
      line-height: 24px !important;
    }
    .home-community-title {
      font-size: 42px !important;
      line-height: 1 !important;
      margin-bottom: 30px !important;
    }
    .home-icon-row {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 22px !important;
      margin-bottom: 34px !important;
    }
    .home-icon-row img {
      width: 56px !important;
      height: 56px !important;
    }
    .home-platform-section,
    .home-store-section {
      padding-left: 18px !important;
      padding-right: 18px !important;
      padding-bottom: 58px !important;
    }
    .home-section-title {
      font-size: 42px !important;
      margin-bottom: 28px !important;
    }
    .home-platform-card {
      height: 320px !important;
    }
    .home-platform-card-content {
      left: 22px !important;
      right: 22px !important;
      bottom: 22px !important;
    }
    .home-platform-card-title {
      font-size: 25px !important;
    }
    .store-rail {
      gap: 14px !important;
    }
    .store-featured-card {
      flex-basis: calc(100vw - 36px) !important;
      width: calc(100vw - 36px) !important;
      height: 470px !important;
    }
    .store-featured-product {
      right: 18px !important;
      top: 178px !important;
      width: calc(100% - 36px) !important;
      height: 188px !important;
    }
    .store-featured-title {
      top: 118px !important;
      width: calc(100% - 60px) !important;
      font-size: 25px !important;
      line-height: 30px !important;
    }
    .store-featured-sub {
      display: none !important;
    }
    .store-featured-price {
      top: 392px !important;
      font-size: 34px !important;
    }
    .store-featured-card.is-marketplace .store-featured-action {
      width: 156px !important;
    }
    .store-featured-card.is-marketplace .store-featured-title {
      top: 116px !important;
      width: calc(100% - 60px) !important;
      font-size: 25px !important;
      line-height: 30px !important;
    }
    .store-featured-card.is-marketplace .store-featured-sub {
      display: block !important;
      top: 150px !important;
      width: calc(100% - 60px) !important;
    }
    .store-featured-card.is-marketplace .store-featured-product {
      left: 18px !important;
      right: 18px !important;
      top: 190px !important;
      width: calc(100% - 36px) !important;
      height: 180px !important;
    }
    .store-featured-card.is-marketplace .store-featured-price {
      left: 30px !important;
      top: 392px !important;
    }
    .store-carousel-controls {
      right: 24px !important;
      bottom: 38px !important;
      gap: 10px !important;
    }
    .store-carousel-button {
      width: 32px !important;
      height: 32px !important;
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
      height: 330px !important;
    }
    .home-about-title {
      font-size: 42px !important;
      line-height: 1 !important;
    }
    .home-about-text {
      font-size: 17px !important;
      line-height: 27px !important;
    }
    .home-about-stats {
      gap: 24px !important;
      flex-wrap: wrap !important;
    }
    .home-about-stat-number {
      font-size: 38px !important;
    }
    .home-about-stat-label {
      font-size: 17px !important;
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

  @media (max-width: 360px) {
    .home-hero-title,
    .home-app-title,
    .home-community-title,
    .home-section-title,
    .home-about-title,
    .home-cta-title {
      font-size: 36px !important;
    }
    .home-hero-content {
      max-width: 270px !important;
    }
    .home-feature-list {
      grid-template-columns: 1fr !important;
    }
    .journey-card {
      flex-basis: 206px !important;
      height: 286px !important;
    }
    .journey-card-image {
      height: 178px !important;
    }
    .journey-button {
      width: 100% !important;
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
    .home-platform-card {
      height: 290px !important;
    }
    .home-platform-card-title {
      font-size: 22px !important;
    }
    .store-featured-icon {
      left: 20px !important;
      top: 24px !important;
    }
    .store-featured-type {
      left: 68px !important;
      top: 36px !important;
      width: 130px !important;
    }
    .store-featured-action {
      right: 20px !important;
      top: 30px !important;
      font-size: 16px !important;
      width: 86px !important;
    }
    .store-featured-title {
      left: 20px !important;
      top: 104px !important;
      width: calc(100% - 40px) !important;
      font-size: 22px !important;
      line-height: 27px !important;
    }
    .store-featured-product {
      left: 20px !important;
      right: 20px !important;
      top: 172px !important;
      width: calc(100% - 40px) !important;
      height: 170px !important;
    }
    .store-featured-price {
      left: 20px !important;
      top: 384px !important;
      font-size: 30px !important;
    }
    .store-featured-card.is-marketplace .store-featured-type {
      width: 122px !important;
    }
    .store-featured-card.is-marketplace .store-featured-action {
      width: 126px !important;
      font-size: 14px !important;
    }
    .store-featured-card.is-marketplace .store-featured-title {
      top: 100px !important;
      width: calc(100% - 40px) !important;
      font-size: 22px !important;
      line-height: 27px !important;
    }
    .store-featured-card.is-marketplace .store-featured-sub {
      top: 136px !important;
      width: calc(100% - 40px) !important;
      font-size: 12px !important;
    }
    .store-featured-card.is-marketplace .store-featured-product {
      left: 20px !important;
      right: 20px !important;
      top: 182px !important;
      width: calc(100% - 40px) !important;
      height: 160px !important;
    }
    .store-featured-card.is-marketplace .store-featured-price {
      left: 20px !important;
      top: 384px !important;
    }
    .store-carousel-controls {
      right: 20px !important;
      bottom: 26px !important;
      gap: 8px !important;
    }
    .store-carousel-button {
      width: 30px !important;
      height: 30px !important;
    }
    .store-featured-card {
      height: 440px !important;
    }
    .home-about-left-image {
      height: 290px !important;
    }
    .home-about-stats {
      display: grid !important;
      grid-template-columns: 1fr !important;
    }
    .home-cta-text {
      font-size: 16px !important;
    }
  }
`;

function useHomePageStyles() {
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&family=Bebas+Neue&display=swap';
    fontLink.dataset.pageStyle = 'home';

    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    styleEl.dataset.pageStyle = 'home';

    document.head.appendChild(fontLink);
    document.head.appendChild(styleEl);

    return () => {
      fontLink.remove();
      styleEl.remove();
    };
  }, []);
}

/* ─── SVG Assets ─────────────────────────────────────────────────────────────*/

function ADCCLogo({ size = 1, light = false }) {
  const color = light ? '#ffffff' : '#000000';
  const subColor = light ? 'rgba(255,255,255,0.7)' : '#333';
  return (
    <svg width={180 * size} height={75.6 * size} viewBox="0 0 180 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="52" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="46" fill={color} letterSpacing="-1">AB</text>
      <circle cx="102" cy="34" r="16" fill="none" stroke={color} strokeWidth="3.5" />
      <circle cx="102" cy="34" r="4.5" fill={color} />
      <line x1="102" y1="18" x2="102" y2="50" stroke={color} strokeWidth="1.5" />
      <line x1="86" y1="34" x2="118" y2="34" stroke={color} strokeWidth="1.5" />
      <line x1="90.7" y1="22.7" x2="113.3" y2="45.3" stroke={color} strokeWidth="1.2" />
      <line x1="113.3" y1="22.7" x2="90.7" y2="45.3" stroke={color} strokeWidth="1.2" />
      <circle cx="138" cy="34" r="16" fill="none" stroke={color} strokeWidth="3.5" />
      <circle cx="138" cy="34" r="4.5" fill={color} />
      <line x1="138" y1="18" x2="138" y2="50" stroke={color} strokeWidth="1.5" />
      <line x1="122" y1="34" x2="154" y2="34" stroke={color} strokeWidth="1.5" />
      <line x1="126.7" y1="22.7" x2="149.3" y2="45.3" stroke={color} strokeWidth="1.2" />
      <line x1="149.3" y1="22.7" x2="126.7" y2="45.3" stroke={color} strokeWidth="1.2" />
      <text x="92" y="52" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="46" fill={color} letterSpacing="-1">HABI</text>
      <text x="6" y="70" fontFamily="Arial, sans-serif" fontSize="10" fill={subColor} letterSpacing="1.5">AD CYCLING CLUB</text>
      <text x="88" y="70" fontFamily="Arial, sans-serif" fontSize="9" fill={subColor} letterSpacing="0.5">نادي أبوظبي للدراجات</text>
    </svg>
  );
}

function CloudyIcon() {
  return (
    <svg width="37" height="37" viewBox="0 0 37 37" fill="none">
      <circle cx="15" cy="13" r="5" fill="#F5A623" />
      <line x1="15" y1="5" x2="15" y2="8" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="15" y1="18" x2="15" y2="21" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="7" y1="13" x2="10" y2="13" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20" y1="13" x2="23" y2="13" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9.5" y1="7.5" x2="11.6" y2="9.6" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20.5" y1="7.5" x2="18.4" y2="9.6" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 26 Q13 21 19 21 Q20 16 26 18 Q32 18 32 24 Q32 30 22 30 Q10 30 10 26 Q10 22 15 22 Q13 24 13 26Z" fill="white" stroke="#b0bec5" strokeWidth="1.2" />
    </svg>
  );
}

function CyclingIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="8" cy="22" r="5" fill="none" stroke="#019839" strokeWidth="2" />
      <circle cx="24" cy="22" r="5" fill="none" stroke="#019839" strokeWidth="2" />
      <circle cx="19" cy="10" r="2" fill="#019839" />
      <path d="M19 12 L16 18 L8 22" stroke="#019839" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M19 12 L24 22" stroke="#019839" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M13 18 L24 18" stroke="#019839" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRight({ color = '#019839', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── QR Code placeholder ───────────────────────────────────────────────────*/
function QRCodePlaceholder() {
  return (
   <img src="/images/barcode.png" className=""/>
  );
}

/* ─── HEADER ─────────────────────────────────────────────────────────────────*/
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { label: 'About Us', href: '#about' },
    { label: 'Events', href: '/user-event' },
    { label: 'Community', href: '#community', active: true },
    { label: 'Challenges', href: '/user-challenges' },
    { label: 'Tracks', href: '#platform' },
  ];
  return (
    <header className="home-header" style={{ width: '100%', height: 134, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 86px', flexShrink: 0, position: 'relative', zIndex: 10 }}>
      <div className="home-logo-wrap" style={{ width: 180, height: 75.6, flexShrink: 0 }}><ADCCLogo /></div>
      <nav className="home-main-nav" style={{ display: 'flex', alignItems: 'center', gap: 48, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {navLinks.map(link => (
          <a key={link.label} href={link.href} className="hover-green" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 20, lineHeight: '27px', color: link.active ? '#019839' : '#000', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{link.label}</a>
        ))}
      </nav>
      <div className="home-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <CloudyIcon />
        <span className="home-language" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 17, color: '#000', cursor: 'pointer', whiteSpace: 'nowrap' }}>English</span>
        <button onClick={() => setMenuOpen(v => !v)} className="btn-green home-menu-button" style={{ width: 101, height: 49, background: menuOpen ? '#017a2e' : '#019839', borderRadius: 30, border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>Menu</button>
      </div>
    </header>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────────────────*/
function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="home-hero" style={{ position: 'relative', width: '100%', height: 806, overflow: 'hidden', flexShrink: 0 }}>
      <div className="home-hero-bg" style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div style={{ position: 'absolute', inset: 0, }} />
      <div className="home-hero-content" style={{ position: 'absolute', left: 86, bottom: 360, maxWidth: 520 }}>
        <motion.h1
          className="home-hero-title overflow-hidden"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontWeight: 900,
            fontSize: 72,
            lineHeight: 1.1,
            color: "#000000",
            textTransform: "uppercase",
            letterSpacing: "-0.5px",
            marginBottom: 28,
          }}
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {["RIDE", "ABU", "DHABI", "START"].map((word, index) => (
            <span
              key={word}
              className="inline-block overflow-hidden"
              style={{ marginRight: "14px" }}
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: {
                    y: "120%",
                    opacity: 0,
                  },
                  visible: {
                    y: "0%",
                    opacity: 1,
                  },
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}

          <br />

          {["YOUR", "CYCLING", "JOURNEY"].map((word, index) => (
            <span
              key={word}
              className="inline-block overflow-hidden"
              style={{ marginRight: "14px" }}
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: {
                    y: "120%",
                    opacity: 0,
                  },
                  visible: {
                    y: "0%",
                    opacity: 1,
                  },
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.32 + index * 0.02,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>
        <div className="home-hero-actions" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <button className="btn-green" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 22px', background: '#019839', border: 'none', borderRadius: 30, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 18, color: '#fff' }}>
            Download App <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 13h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <button onClick={() => navigate('/user-tracks')} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 22px', background: 'transparent', border: '2px solid #019839', borderRadius: 30, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#019839' }}>
            Explore Tracks <ArrowRight />
          </button>
        </div>
      </div>
      <div className="home-floating-bike" style={{ position: 'absolute', right: 40, bottom: 60, width: 60, height: 60, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', cursor: 'pointer' }}>
        <CyclingIcon />
      </div>
    </section>
  );
}

/* ─── STATS TICKER ───────────────────────────────────────────────────────────*/
function StatsTicker() {
  const stats = [
    { label: "35,000+ Active Members", bg: "#D9E7F9", dark: false },
    { label: "100KM Signature Loop", bg: "#435974", dark: true },
    { label: "250+ Events Hosted Annually", bg: "#D9E7F9", dark: false },
    { label: "1.5 Million+ KM Cycled", bg: "#435974", dark: true },
  ];
  return (
    <div className="home-ticker" style={{ width: '100%', height: 100, overflow: 'hidden', display: 'flex' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', animation: 'ticker-group-left 18s linear infinite', whiteSpace: 'nowrap' }}>
        {[0, 1].map((groupIndex) => (
          <div key={groupIndex} style={{ minWidth: '100vw', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
            {stats.map((s, i) => (
              <div className="home-ticker-item" key={`${groupIndex}-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 36px', height: 100, flex: '1 0 auto', background: s.bg }}>
                <span className="home-ticker-text" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 29, textTransform: 'uppercase', color: s.dark ? '#fff' : '#000' }}>{s.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function scrambleText(
  element: HTMLElement,
  finalText: string,
  speed = 2
) {
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
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const cards = [
    { label: "Find Cycling\nTracks", bg: "#777777", img: "/images/journey-1.png", to:"/user-tracks" },
    { label: "Discover\nEvents", bg: "#777777", img: "/images/journey-2.png", to:"/user-event" },
    { label: "Join Active\nChallenges", bg: "#777777", img: "/images/journey-3.png" , to:"/user-challenges"},
    { label: "Connect With\nRiders", bg: "#777777",img: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&q=80" , to:"/login"},
  ];

  useEffect(() => {
    const cardsEl = cardsRef.current;
    if (!cardsEl) return;

    if (textRef.current) {
      scrambleText(
        textRef.current,
        "Choose how you want to ride with ADCC. Discover routes, join challenges, and be part of a growing cycling community."
      );
    }

    const observer = new IntersectionObserver(
      ([entry]) => setCardsVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(cardsEl);

    return () => observer.disconnect();
  }, []);
  
  return (
    <section className="journey-section">
      <div className="journey-copy">
        <motion.h2
          className="journey-title overflow-hidden"
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
          {["Begin", "Your"].map((word, index) => (
            <span
              key={word}
              className="inline-block overflow-hidden"
              style={{ marginRight: "14px" }}
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: {
                    y: "120%",
                    opacity: 0,
                  },
                  visible: {
                    y: "0%",
                    opacity: 1,
                  },
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}

          <br />

          {["Cycling", "Journey"].map((word, index) => (
            <span
              key={word}
              className="inline-block overflow-hidden"
              style={{ marginRight: "14px" }}
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: {
                    y: "120%",
                    opacity: 0,
                  },
                  visible: {
                    y: "0%",
                    opacity: 1,
                  },
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.3 + index * 0.02,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
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
          <img src="/images/journey.png" alt="ADCC cyclist" />
        </motion.div>
      </div>
      <div className="journey-content">
        <div ref={cardsRef} className={`journey-cards${cardsVisible ? ' is-visible' : ''}`}>
          {cards.map((card, i) => (
            <div key={i} className="card-hover journey-card" style={{ background: card.bg }}
            onClick={()=>navigate(card?.to)}>
              <span className="journey-card-label">{card.label}</span>
              <div className="journey-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#C12D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              {/* <div className="journey-card-image">
                <img src={card.img} alt={card.label.replace('\n', ' ')} />
              </div> */}
              <div className="journey-card-image">
                <img
                  src={card.img}
                  alt={card.label.replace('\n', ' ')}
                  style={{
                    animation: cardsVisible
                      ? `imageExpand 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
                      : "none",
                    animationDelay: `${i * 0.18}s`,
                    transformOrigin: "center",
                    opacity: 0,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div>
          {/* <p className="journey-text">Choose how you want to ride with ADCC. Discover routes, join challenges, and be part of a growing cycling community.</p> */}
          <p ref={textRef} className="journey-text">
            Choose how you want to ride with ADCC. Discover routes, join challenges, and be part of a growing cycling community.
          </p>
          <button onClick={() => navigate('/user-tracks')} className="btn-green journey-button">
            Explore all Routes
            <span className="journey-button-icon">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── APP SECTION ────────────────────────────────────────────────────────────*/
function AppSection() {
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const features = [
    { icon: '/images/icon-1.png', label: 'Track Performance\nand Rides' },
    { icon: '/images/icon-2.png', label: 'Join Official\nChallenges' },
    { icon: '/images/icon-3.png', label: 'Connect With\nRiders' },
    { icon: '/images/icon-4.png', label: 'Discover Cycling\nRoutes' },
  ];

  useEffect(() => {
    const phoneEl = phoneRef.current;
    if (!phoneEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPhoneVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(phoneEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="app" className="home-app-section" style={{ background: '#435974', width: '100%', padding: '80px 86px', display: 'flex', alignItems: 'center', gap: 60, position: 'relative', overflow: 'hidden' }}>
      {/* Left text */}
      <div className="home-app-copy" style={{ flexShrink: 0, position: 'relative', width: '70%' }}>
        {/* <h2 className="home-app-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 80, lineHeight: 1.007, textTransform: 'uppercase', color: '#fff', marginBottom: 32 }}>Everything You Need.<br />In One App.</h2> */}
        <div>
          <motion.h2
            className="home-app-title overflow-hidden"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 80,
              lineHeight: 1,
              textTransform: "uppercase",
              color: "#fff",
              marginBottom: 32,
            }}
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
            {["Everything", "You", "Need."].map((word) => (
              <span
                key={word}
                className="inline-block overflow-hidden"
                style={{ marginRight: "14px" }}
              >
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: {
                      y: "120%",
                      opacity: 0,
                    },
                    visible: {
                      y: "0%",
                      opacity: 1,
                    },
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}

            <br />

            {["In", "One", "App."].map((word) => (
              <span
                key={word}
                className="inline-block overflow-hidden"
                style={{ marginRight: "14px" }}
              >
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: {
                      y: "120%",
                      opacity: 0,
                    },
                    visible: {
                      y: "0%",
                      opacity: 1,
                    },
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h2>
          {/* <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 32 }}>Track your rides, discover routes, join challenges, and stay connected with the cycling community — all from one powerful app.</p> */}
          <div style={{ marginBottom: 24 }}>
            <motion.p
              className="home-download-label overflow-hidden"
              style={{
                fontFamily: "'Outfit', sans-serif",
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
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
            >
              {["Download"].map((word) => (
                <span
                  key={word}
                  className="inline-block overflow-hidden"
                  style={{ marginRight: "10px" }}
                >
                  <motion.span
                    className="inline-block"
                    variants={{
                      hidden: {
                        y: "120%",
                        opacity: 0,
                      },
                      visible: {
                        y: "0%",
                        opacity: 1,
                      },
                    }}
                    transition={{
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}

              <br />

              {["ADCC", "APP"].map((word) => (
                <span
                  key={word}
                  className="inline-block overflow-hidden"
                  style={{ marginRight: "10px" }}
                >
                  <motion.span
                    className="inline-block"
                    variants={{
                      hidden: {
                        y: "120%",
                        opacity: 0,
                      },
                      visible: {
                        y: "0%",
                        opacity: 1,
                      },
                    }}
                    transition={{
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </motion.p>

            <motion.div
              className="home-qr-box"
              initial={{
                opacity: 0,
                x: 80,
              }}
              whileInView={{
                opacity: 1,
                x: "0%",
              }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              viewport={{ once: true }}
              style={{
                width: 256,
                height: 256,
                background: "#fff",
                borderRadius: 16,
                padding: 12,
                marginBottom: 40,
              }}
            >
              <QRCodePlaceholder />
            </motion.div>
          </div>
          {/* App store buttons */}
          <motion.div
            className="home-store-buttons"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {[0, 1].map((item) => (
              <motion.div
                key={item}
                variants={{
                  hidden: {
                    opacity: 0,
                    translateY: 80,
                  },
                  visible: {
                    opacity: 1,
                    translateY: 0,
                  },
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  background: "#fff",
                  borderRadius: 100,
                  padding: "10px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {item === 0 ? <>Google Play content here</> : <>App Store content here</>}
              </motion.div>
            ))}
          </motion.div>
        </div>
        {/* Phone mockup center */}
        <div ref={phoneRef} className={`app-phone-stage home-phone-stage${phoneVisible ? ' is-visible' : ''}`} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', minHeight: 500, top: 70, right: 0, width: '60%', zIndex: 1 }}>
          {/* Back phone */}
          <div style={{ width: '100%', maxWidth: 560 }}>
            <img src="/images/image%203066.png" alt="ADCC App" style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'contain', opacity: 1 }} />
          </div>
          {/* Front phone */}
        </div>
      </div>

      {/* Right features */}
      <div className="home-feature-list" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 80 }}>
        {features.map((f, i) => (
          <div key={i} className="app-feature" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, cursor: 'default', flexDirection: 'column' }}>
            <div className="feature-icon" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={f.icon} alt={f.label.replace('\n', ' ')} style={{ }} />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', textTransform: 'uppercase', lineHeight: 1.2, whiteSpace: 'pre-line' }}>{f.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── COMMUNITY / EAT SLEEP BIKE ────────────────────────────────────────────*/

function CommunitySection() {
    const navigate = useNavigate();

  const icons = [
    { icon: '/images/vegetabl.gif', label: 'Eat' },
    { icon: '/images/moon-night.gif', label: 'Sleep' },
    { icon: '/images/cycling.gif', label: 'Bike' },
    { icon: '/images/sync.gif', label: 'Repeat' },
  ];
  
  return (
    <section id="community" className="home-community-section" style={{ background: '#EAF4FF', padding: '125px 86px', textAlign: 'center' }}>
      {/* <p className="home-community-eyebrow" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 28, color: '#000', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>For the Cycling Community</p> */}
      <motion.p
        className="home-community-eyebrow overflow-hidden"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: 28,
          color: "#000",
          textTransform: "uppercase",
          letterSpacing: "2px",
          marginBottom: 16,
        }}
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
        {["For", "the", "Cycling", "Community"].map((word) => (
          <span
            key={word}
            className="inline-block overflow-hidden"
            style={{ marginRight: "12px" }}
          >
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "120%", opacity: 0 },
                visible: { y: "0%", opacity: 1 },
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.p>

      <motion.h2
        className="home-community-title overflow-hidden"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 74,
          color: "#000",
          textTransform: "uppercase",
          letterSpacing: "-0.5px",
          marginBottom: 48,
        }}
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
        {["Eat", "•", "Sleep", "•", "Bike", "•", "Repeat"].map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="inline-block overflow-hidden"
            style={{ marginRight: "12px" }}
          >
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "120%", opacity: 0 },
                visible: { y: "0%", opacity: 1 },
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.h2>
      {/* Icon row */}
      <div className="home-icon-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 56 }}>
        {icons.map((ic, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <img src={ic.icon} alt={ic.label} style={{ width: 64, height: 64, objectFit: 'contain', display: 'block' }} />
            </div>
            {i < icons.length - 1 && (
              <div className="home-icon-divider" style={{ display: 'flex', alignItems: 'center', padding: '0 24px',}}>
                <div style={{ width: 50, height: 2, background: '#000' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#000', margin: '0 4px' }} />
                <div style={{ width: 50, height: 2, background: '#000' }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* <p className="home-community-subtitle" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 28, color: '#000', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 28 }}>Everything you need to ride, track, and stay connected.</p> */}
      <motion.p
        className="home-community-subtitle overflow-hidden"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: 28,
          color: "#000",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: 28,
        }}
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
        {[
          "Everything",
          "you",
          "need",
          "to",
          "ride,",
          "track,",
          "and",
          "stay",
          "connected.",
        ].map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="inline-block overflow-hidden"
            style={{ marginRight: "10px" }}
          >
            <motion.span
              className="inline-block"
              variants={{
                hidden: {
                  y: "120%",
                  opacity: 0,
                },
                visible: {
                  y: "0%",
                  opacity: 1,
                },
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.p>
      <button 
      onClick={()=>navigate("/login")}
      className="btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#019839', border: 'none', borderRadius: 30, padding: '14px 28px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#FFF9EF' }}>
        Start Riding
        <span style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight /></span>
      </button>
    </section>
  );
}

/* ─── EXPLORE THE PLATFORM ───────────────────────────────────────────────────*/
function ExplorePlatformSection() {
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const cards = [
    {
      tag: 'EVENTS',
      img: '/images/explore-1.png',
      title: 'Join upcoming rides and cycling events across the city',
      action: 'View Events',
      to: '/user-events',
    },
    {
      tag: 'TRACK',
      img: '/images/explore-2.png',
      title: 'Discover official cycling routes across Abu Dhabi',
      action: 'View Tracks',
      to: '/user-tracks',
    },
    {
      tag: 'CHALLENGE',
            img: '/images/explore-3.png',
      title: 'Track progress and take on community challenges',
      action: 'View Challenges',
      to: '/user-tracks',
    },
  ];

  useEffect(() => {
    const cardsEl = cardsRef.current;
    if (!cardsEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setCardsVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(cardsEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="platform" className="home-platform-section" style={{ background: '#EAF4FF', padding: '0 86px 80px' }}>
      {/* <h2 className="home-section-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: '#000', textTransform: 'uppercase', textAlign: 'center', paddingTop: 35, marginBottom: 40, lineHeight: '72px' }}>Explore the Platform</h2> */}
      <motion.h2
        className="home-section-title overflow-hidden"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 72,
          color: "#000",
          textTransform: "uppercase",
          textAlign: "center",
          paddingTop: 35,
          marginBottom: 40,
          lineHeight: "72px",
        }}
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
        {["Explore", "the", "Platform"].map((word) => (
          <span
            key={word}
            className="inline-block overflow-hidden"
            style={{ marginRight: "14px" }}
          >
            <motion.span
              className="inline-block"
              variants={{
                hidden: {
                  y: "120%",
                  opacity: 0,
                },
                visible: {
                  y: "0%",
                  opacity: 1,
                },
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.h2>
      <div ref={cardsRef} className={`platform-cards home-platform-cards${cardsVisible ? ' is-visible' : ''}`} style={{ display: 'flex', gap: 0, borderRadius: 20, overflow: 'hidden', height: 480 }}>
        {cards.map((card, i) => (
          <div key={i} onClick={() => navigate(card.to)} className="card-hover platform-card home-platform-card" style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'pointer', borderLeft: i > 0 ? '2px solid rgba(255,255,255,0.3)' : 'none' }}>
            {/* <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} /> */}
            <img
              src={card.img}
              alt={card.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s',
                animation: cardsVisible
                  ? `imageExpand 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
                  : "none",
                animationDelay: `${i * 0.18}s`,
                transformOrigin: "center",
                opacity: 0,
              }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.75) 100%)' }} />
            {/* Tag */}
            <div style={{ position: 'absolute', top: 43, left: 32, background: '#435974', borderRadius: 20, padding: '5px 14px' }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{card.tag}</span>
            </div>
            {/* Bottom content */}
            <div className="home-platform-card-content" style={{ position: 'absolute', bottom: 24, left: 32, right: 32 }}>
              <p className="home-platform-card-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#F6EFE7', lineHeight: 1.1, textTransform: 'uppercase', marginBottom: 12 }}>{card.title}</p>
              <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, color: '#F6EFE7', cursor: 'pointer' }}>{card.action}</span>
                <div style={{ height: 3, background: '#435974', borderRadius: 2, marginTop: 2 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── ADCC STORE ─────────────────────────────────────────────────────────────*/
type StoreCardProduct = {
  id: string;
  type: string;
  action: string;
  title: string;
  sub: string;
  price: string;
  img: string;
  images: string[];
};

const STORE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const STORE_FALLBACK_PRODUCTS: StoreCardProduct[] = [
  {
    id: 'store-fallback-official-merchandise',
    type: 'Official Merchandise',
    action: 'View Store',
    title: 'ADCC Performance Jersey',
    sub: 'Lightweight • Breathable • Race Fit',
    price: 'AED 220',
    img: '/img/image 297012.png',
    images: ['/img/image 297012.png'],
  },
  {
    id: 'store-fallback-community-marketplace',
    type: 'Community Marketplace',
    action: 'Explore Marketplace',
    title: 'Pre-Owned Road Bike',
    sub: 'Verified listings from ADCC riders',
    price: 'AED 1,500',
    img: '/img/image 2970.png',
    images: ['/img/image 2970.png', '/img/image 2970 (1).png'],
  },
];

function formatStorePrice(item: StoreItem) {
  const currency = item.currency || 'AED';
  const price = Number.isFinite(Number(item.price)) ? Number(item.price).toLocaleString() : item.price;
  return `${currency} ${price}`;
}

function getStoreImage(item: StoreItem) {
  const image = item.coverImage || item.photos?.[0] || '';
  const trimmedImage = image.trim();

  if (!trimmedImage) return STORE_FALLBACK_IMAGE;
  if (/^(https?:|data:|blob:)/i.test(trimmedImage)) return trimmedImage;

  return new URL(trimmedImage.replace(/^\/+/, ''), `${API_BASE_URL}/`).toString();
}

function getStoreImages(item: StoreItem) {
  const images = [item.coverImage, ...(item.photos || [])]
    .filter((image): image is string => Boolean(image?.trim()))
    .map((image) => {
      const trimmedImage = image.trim();
      if (/^(https?:|data:|blob:)/i.test(trimmedImage)) return trimmedImage;
      return new URL(trimmedImage.replace(/^\/+/, ''), `${API_BASE_URL}/`).toString();
    });

  return Array.from(new Set(images));
}

function getStoreSubText(item: StoreItem) {
  const details = [item.condition, item.city].filter(Boolean);
  if (details.length) return details.join(' • ');
  return item.description || 'Available from ADCC store';
}

function StoreProductImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1, align: 'start' });

  useEffect(() => {
    emblaApi?.reInit();
    emblaApi?.scrollTo(0, true);
  }, [emblaApi, images]);

  useEffect(() => {
    if (!emblaApi || images.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [emblaApi, images.length]);

  return (
    <>
      <div className="store-featured-product store-product-carousel" ref={emblaRef}>
        <div className="store-product-carousel-track">
          {images.map((image, index) => (
            <div className="store-product-carousel-slide" key={`${image}-${index}`}>
              <img
                src={image}
                alt={title}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = STORE_FALLBACK_IMAGE;
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="store-carousel-controls">
          <button
            type="button"
            className="store-carousel-button"
            aria-label="Previous product image"
            onClick={(event) => {
              event.stopPropagation();
              emblaApi?.scrollPrev();
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="store-carousel-button"
            aria-label="Next product image"
            onClick={(event) => {
              event.stopPropagation();
              emblaApi?.scrollNext();
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}

function StoreSection() {
  const navigate = useNavigate();
  const storeRailRef = useRef<HTMLDivElement | null>(null);
  const [storeCardsVisible, setStoreCardsVisible] = useState(false);
  const [products, setProducts] = useState<StoreCardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadStoreProducts() {
      try {
        setIsLoading(true);
        setLoadError('');
        const items = await getStoreItems({ status: 'Approved', limit: 8 });
        if (!isMounted) return;

        const apiProducts = items.slice(0, 8).map((item, index) => ({
            id: item.id || item._id || item.title,
            type: index === 0 ? 'Official Merchandise' : 'Community Marketplace',
            action: index === 0 ? 'View Store' : 'Explore Marketplace',
            title: item.title,
            sub: getStoreSubText(item),
            price: formatStorePrice(item),
            img: getStoreImage(item),
            images: getStoreImages(item),
          }));
        const officialProduct = apiProducts[0] || STORE_FALLBACK_PRODUCTS[0];
        const marketplaceProducts = [
          ...apiProducts.slice(1).map((item) => ({
            ...item,
            type: 'Community Marketplace',
            action: 'Explore Marketplace',
          })),
          ...(apiProducts.length < 2 ? STORE_FALLBACK_PRODUCTS.slice(1) : []),
        ];

        setProducts([officialProduct, marketplaceProducts[0]].filter(Boolean).slice(0, 2));
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Failed to load store products');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStoreProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const railEl = storeRailRef.current;
    if (!railEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStoreCardsVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(railEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="store" className="home-store-section" style={{ background: '#EAF4FF', padding: '0 86px 80px' }}>
      <h2 className="home-section-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: '#000', textTransform: 'uppercase', textAlign: 'center', marginBottom: 40 }}>ADCC Store</h2>
      <div ref={storeRailRef} className={`store-rail${storeCardsVisible ? ' is-visible' : ''}`}>
        {isLoading && (
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, color: '#435974', padding: '36px 0' }}>Loading store products...</div>
        )}
        {!isLoading && loadError && (
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, color: '#C12D32', padding: '36px 0' }}>{loadError}</div>
        )}
        {!isLoading && !loadError && products.length === 0 && (
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, color: '#435974', padding: '36px 0' }}>No store products available.</div>
        )}
        {products.map((p, i) => (
          <div
            key={p.id}
            onClick={() => navigate('/user-adcc-store')}
            className={`store-card store-featured-card store-animated-card${i === 1 ? ' is-marketplace' : ''}`}
          >
            <div className="store-featured-icon">
              <img src="/images/users.png" alt="" />
            </div>
            <span className="store-featured-type">{p.type}</span>
            <span className="store-featured-action">{p.action}</span>
            <h3 className="store-featured-title">{p.title}</h3>
            <p className="store-featured-sub">{p.sub}</p>
            {i === 1 ? (
              <StoreProductImageCarousel images={p.images.length ? p.images : [p.img]} title={p.title} />
            ) : (
              <img
                className="store-featured-product"
                src={p.img}
                alt={p.title}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = STORE_FALLBACK_IMAGE;
                }}
              />
            )}
            <span className="store-featured-price">{p.price}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function scrambleNumber(
  element: HTMLElement,
  finalText: string,
  speed = 30
) {
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
  const hasAnimatedStats = useRef(false);
  const aboutRef = useRef<HTMLElement | null>(null);
  const statsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [aboutVisible, setAboutVisible] = useState(false);
  const stats = [
    { num: '15K+', label: 'Riders' },
    { num: '100+', label: 'Events' },
    { num: '10+', label: 'Years' },
  ];

  useEffect(() => {
    const aboutEl = aboutRef.current;
    if (!aboutEl) return;

      const observer = new IntersectionObserver(
      ([entry]) => {
        setAboutVisible(entry.isIntersecting);

        if (entry.isIntersecting && !hasAnimatedStats.current) {
          hasAnimatedStats.current = true;

          statsRefs.current.forEach((el, index) => {
            if (el) {
              setTimeout(() => {
                                scrambleNumber(el, stats[index].num, 25);
              }, index * 180);
            }
          });
        }
      },
      // { threshold: 0.35 }
      { threshold: 0.1 }
    );

    observer.observe(aboutEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={aboutRef} id="about" className={`about-section home-about-section${aboutVisible ? ' is-visible' : ''}`} style={{ background: '#EAF4FF', padding: '60px 86px 80px', display: 'flex', gap: 60, alignItems: 'center' }}>
      {/* Left image */}
      <motion.div
        className="home-about-left-image"
        initial={{ opacity: 0, x: -300 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        style={{
          flexShrink: 0,
          width: 380,
          height: 560,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80"
          alt="ADCC Cyclists"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </motion.div>
      {/* Right content */}
      <div className="home-about-content" style={{ flex: 1 }}>
        {/* <h2 className="home-about-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 74, color: '#000', textTransform: 'uppercase', lineHeight: 1.01, marginBottom: 24 }}>About Abu Dhabi<br />Cycling Club</h2> */}
        <motion.h2
          className="home-about-title overflow-hidden"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 74,
            color: "#000",
            textTransform: "uppercase",
            lineHeight: 1.0,
            marginBottom: 24,
          }}
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
          {["About", "Abu", "Dhabi"].map((word) => (
            <span
              key={word}
              className="inline-block overflow-hidden"
              style={{ marginRight: "14px" }}
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: {
                    y: "120%",
                    opacity: 0,
                  },
                  visible: {
                    y: "0%",
                    opacity: 1,
                  },
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}

          <br />

          {["Cycling", "Club"].map((word) => (
            <span
              key={word}
              className="inline-block overflow-hidden"
              style={{ marginRight: "14px" }}
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: {
                    y: "120%",
                    opacity: 0,
                  },
                  visible: {
                    y: "0%",
                    opacity: 1,
                  },
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        <p className="home-about-text" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, color: '#000', lineHeight: 1.6, marginBottom: 40, maxWidth: 600 }}>
          At Abu Dhabi Cycling Club, every ride is a step toward building a stronger, healthier, and more connected society. We are the heart of the UAE's cycling movement uniting enthusiasts, athletes, and families through the shared joy of cycling.
        </p>
        {/* Stats */}
        <div className="home-about-stats" style={{ display: 'flex', gap: 48, marginBottom: 40 }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div className="home-about-stat-number" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 50, color: '#000', lineHeight: 1 }}>
                <div ref={(el) => (statsRefs.current[i] = el)}>
                  {s.num}
                </div>
              </div>
              <div className="home-about-stat-label" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, color: '#444', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/communities-abu-dhabi-cycling-community')} className="btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#019839', border: 'none', borderRadius: 30, padding: '14px 28px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#FFF9EF' }}>
          Read More
          <span style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight /></span>
        </button>
      </div>
      {/* Decorative rider image */}
    <motion.div
      className="home-about-rider"
      initial={{ opacity: 0, x: 150 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      viewport={{ once: true }}
      style={{
        flexShrink: 0,
        width: 280,
        height: 340,
        overflow: 'hidden'
      }}
    >
      <img
        src="/images/right-cycle.png"
        alt="Rider"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </motion.div>
    </section>
  );
}

/* ─── CTA BANNER ─────────────────────────────────────────────────────────────*/
function CTABanner() {
  return (
    <section className="home-cta" style={{ position: 'relative', width: '100%', height: 420, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1508784411316-06c06401e69b?w=1440&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div className="home-cta-content" style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 86px' }}>
        <h2 className="home-cta-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 88, color: '#fff', textTransform: 'uppercase', lineHeight: 1.0, marginBottom: 16 }}>Start Your Ride Today</h2>
        <p className="home-cta-text" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, color: 'rgba(255,255,255,0.9)', marginBottom: 36 }}>Download the ADCC app and join the cycling community.</p>
        {/* App store buttons */}
        <div className="home-cta-buttons" style={{ display: 'flex', gap: 20 }}>
          {[
            { bg: 'white', top: 'GET IT ON', main: 'Google Play', icon: '▶' },
            { bg: 'white', top: 'Download on the', main: 'App Store', icon: '' },
          ].map((btn, i) => (
            <div key={i} style={{ background: btn.bg, borderRadius: 100, padding: '12px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 24 }}>{i === 0 ? '▶' : ''}</div>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: i === 1 ? 'block' : 'none' }}>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#000" />
              </svg>
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: '#555' }}>{btn.top}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#000' }}>{btn.main}</div>
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
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailMessageType, setEmailMessageType] = useState<'success' | 'error'>('success');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const quickLinks = ['About Us', 'Rides', 'Events', "Cyclist's Corner", 'Contact Us'];
  const contactItems = [
    { icon: '📞', text: '+971 2 654 5645' },
    { icon: '💬', text: '144226' },
    { icon: '✉️', text: 'info@adcyclingclub.ae' },
    { icon: '📍', text: 'Abu Dhabi, Yas Island, Yas Marina Circuit, Villa 18.' },
  ];

  const handleEmailSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailMessageType('error');
      setEmailMessage('Please enter your email address.');
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailMessageType('error');
      setEmailMessage('Please enter a valid email address.');
      return;
    }

    try {
      setIsSubmittingEmail(true);
      setEmailMessage('');
      await subscribeToNewsletter(normalizedEmail);
      setEmail('');
      setEmailMessageType('success');
      setEmailMessage('Thanks for subscribing.');
    } catch (error) {
      setEmailMessageType('error');
      setEmailMessage(error instanceof Error ? error.message : 'Failed to subscribe.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid #e5e5e5' }}>
      <div className="home-footer-main" style={{ padding: '60px 86px 30px', display: 'flex', gap: 60 }}>
        {/* Logo + tagline + newsletter */}
        <div className="home-footer-brand" style={{ flexShrink: 0, width: 340 }}>
          <div style={{ marginBottom: 24 }}><ADCCLogo size={0.83} /></div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: '#333', lineHeight: 1.6, marginBottom: 32 }}>
            From weekend warriors to elite athletes, we unite cyclists who share a passion for riding. ADCC is where your cycling journey thrives…
          </p>
          {/* Email signup */}
          <div className="home-newsletter" style={{ display: 'flex', background: '#8DDF93', borderRadius: 10, overflow: 'hidden', height: 52 }}>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (emailMessage) setEmailMessage('');
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleEmailSubmit();
              }}
              placeholder="Enter your email"
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 16px', fontFamily: "'Outfit', sans-serif", fontSize: 15, color: '#333', outline: 'none' }}
            />
            <button disabled={isSubmittingEmail} className="btn-green" onClick={handleEmailSubmit} style={{ background: '#019839', border: 'none', padding: '0 20px', cursor: isSubmittingEmail ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: '#fff', borderRadius: '0 10px 10px 0', opacity: isSubmittingEmail ? 0.72 : 1 }}>{isSubmittingEmail ? 'Saving...' : 'Submit'}</button>
          </div>
          {emailMessage && (
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: emailMessageType === 'success' ? '#019839' : '#C12D32', marginTop: 8 }}>
              {emailMessage}
            </p>
          )}
        </div>

        <div className="home-footer-links" style={{ flex: 1, display: 'flex', gap: 60 }}>
          {/* Quick links */}
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#000', textTransform: 'uppercase', marginBottom: 24 }}>Quick Links</h3>
            <ul style={{ listStyle: 'none' }}>
              {quickLinks.map(l => (
                <li key={l} style={{ marginBottom: 14 }}>
                  <a href="#" className="hover-green" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, color: '#000', textDecoration: 'none', transition: 'color 0.2s' }}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#000', textTransform: 'uppercase', marginBottom: 24 }}>Contact Us</h3>
            <ul style={{ listStyle: 'none' }}>
              {contactItems.map((c, i) => (
                <li key={i} style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{c.icon}</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: '#000', lineHeight: 1.4 }}>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Social */}
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#000', textTransform: 'uppercase', marginBottom: 24 }}>Follow Us</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['📘', '📷', '🐦', '▶️'].map((icon, i) => (
                <div key={i} style={{ width: 44, height: 44, background: '#EAF4FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, transition: 'background 0.2s' }}>{icon}</div>
              ))}
            </div>
            {/* Green badge */}
            <div style={{ marginTop: 32, width: 55, height: 55, background: '#019839', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(1,152,57,0.3)', cursor: 'pointer' }}>
              <ADCCLogo size={0.19} light={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Divider + copyright */}
      <div className="home-footer-bottom" style={{ borderTop: '1px solid #D5D5D5', margin: '0 86px', padding: '20px 0', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: 'rgba(0,0,0,0.6)' }}>Copyright 2026. Abu Dhabi Cycling Club</span>
      </div>
    </footer>
  );
}

/* ─── HOME PAGE ──────────────────────────────────────────────────────────────*/
export function Home() {
  useHomePageStyles();

  return (
    <div className="home-page" style={{ minHeight: '100vh', background: '#EAF4FF', display: 'flex', flexDirection: 'column' }}>
      <Header />
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
