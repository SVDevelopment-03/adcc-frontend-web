import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Cloud,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Apple,
} from "lucide-react";
import { getMerchandiseProducts } from "../../services/merchandiseApi";
import type { Product } from "../merchandise/merchandiseData";
import { AnimatedWords, useWordList } from "../public/publicPageHelpers";

const cyclingEquipment = [
  ["Ivan Njuki", "25,000 AED", "/img/image 2970.png"],
  ["Colnago Be", "15,000 AED", "/img/image 3069.png"],
  ["Tacx Galaxia Rollers Bike", "800 AED", "/img/image 2973.png"],
  ["Trek Domane SL 6 - Like New", "12,000 AED", "/img/image 2970 (1).png"],
  ["Shimano Ultegra Groupset", "3,500 AED", "/img/image 2972.png"],
  ["Shimano Ultegra Groupset", "3,500 AED", "/img/image 2973.png"],
];

function ProductCard({ name, price, image }: { name: string; price: string; image: string }) {
  return (
    <div className="min-h-[381px] rounded-[10px] border border-black/5 p-8 shadow-inner transition-all duration-300 hover:border-[#435974] hover:bg-[#435974] hover:text-white">
      <h3 className="text-[24px] uppercase">{name}</h3>
      <p className="mt-1 text-[18px]">{price}</p>
      <img
        src={image}
        alt={name}
        className="mt-8 h-[240px] w-full object-contain mix-blend-multiply"
      />
    </div>
  );
}

function MerchandiseCard({ product }: { product: Product }) {
  const image = product.images?.[0] ?? "";
  const price = `${product.price.toLocaleString()} AED`;
  return (
    <div className="min-h-[381px] rounded-[10px] border border-black/5 p-8 shadow-inner transition-all duration-300 hover:border-[#435974] hover:bg-[#435974] hover:text-white">
      <h3 className="text-[24px] uppercase">{product.name}</h3>
      <p className="mt-1 text-[18px]">{price}</p>
      {image && (
        <img
          src={image}
          alt={product.name}
          className="mt-8 h-[240px] w-full object-contain mix-blend-multiply"
        />
      )}
    </div>
  );
}

export default function AdccStorePage() {
  const { t } = useTranslation();
  const heroTitleWords = useWordList("public.store.listing.hero.titleWords");
  const browseTitleWords = useWordList("public.store.listing.browseTitleWords");
  const gearUpTitleWords = useWordList("public.store.listing.gearUp.titleWords");
  const [merchandiseProducts, setMerchandiseProducts] = useState<Product[]>([]);
  const [merchandiseLoading, setMerchandiseLoading] = useState(true);

  useEffect(() => {
    getMerchandiseProducts({ source: "adcc", status: "published" })
      .then(setMerchandiseProducts)
      .catch(() => setMerchandiseProducts([]))
      .finally(() => setMerchandiseLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#eaf4ff] text-black">
      <header className="flex h-[78px] items-center justify-between px-4 sm:h-[96px] sm:px-6 md:px-10 lg:h-[134px] lg:px-20">
        <img
          src="/ADCC-Logo.png"
          alt="ADCC"
          className="h-[57px] w-[135px] object-contain"
        />

        <nav className="hidden lg:flex gap-12 text-[20px] font-medium">
          <span>{t("public.nav.aboutUs")}</span>
          <span>{t("public.nav.events")}</span>
          <span>{t("public.nav.community")}</span>
          <span>{t("public.nav.tracks")}</span>
        </nav>

        <div className="flex items-center gap-6">
          <Cloud size={24} />
          <span className="text-[17px]">{t("public.language.english")}</span>
          <button className="rounded-full bg-black px-8 py-4 text-[18px] font-bold text-white">
            {t("public.auth.menu")}
          </button>
        </div>
      </header>

      <section
        className="public-hero-bleed relative h-screen min-h-[480px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('/img/pexels-zakhar-36955801 1.png')",
        }}
      >
        <div className="absolute bottom-20 left-4 text-white sm:left-6 md:left-10 lg:left-20">
          <h1 className="text-[60px] font-black uppercase leading-none overflow-hidden">
            <AnimatedWords words={heroTitleWords} gap={16} />
          </h1>
          <p className="mt-4 text-[24px]">{t("public.store.listing.hero.breadcrumb")}</p>
        </div>
      </section>

      <section className="w-full px-4 py-28 sm:px-6 md:px-10 lg:px-20">
        <h2 className="flex justify-center overflow-hidden text-center text-[50px] font-black uppercase">
          <AnimatedWords words={browseTitleWords} gap={16} />
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_292px_292px_156px]">
          <div className="flex h-[66px] items-center rounded-full border border-[#CBCBCB] bg-white px-8">
            <input
              placeholder={t("public.store.listing.searchPlaceholder")}
              className="flex-1 bg-transparent text-[18px] outline-none"
            />
            <Search size={24} />
          </div>

          <button className="flex h-[66px] items-center justify-between rounded-full border border-[#CBCBCB] bg-white px-8 text-[18px]">
            {t("public.store.listing.allCategories")} <ChevronDown size={24} />
          </button>

          <button className="flex h-[66px] items-center justify-between rounded-full border border-[#CBCBCB] bg-white px-8 text-[18px]">
            {t("public.store.listing.allConditions")} <ChevronDown size={24} />
          </button>

          <button className="h-[66px] rounded-full bg-[#019839] text-[20px] font-bold text-white">
            {t("public.common.search")}
          </button>
        </div>

        {/* Cycling Equipment */}
        <div className="mt-20 flex items-center gap-6">
          <h3 className="text-[32px] font-black uppercase">{t("public.store.listing.cyclingEquipmentHeading")}</h3>
          <span className="rounded-full bg-[#019839]/10 px-4 py-1 text-[14px] font-bold text-[#019839]">
            {t("public.store.listing.itemsCount", { count: cyclingEquipment.length })}
          </span>
        </div>
        <div className="mt-2 h-px bg-black/10" />
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cyclingEquipment.map(([name, price, image]) => (
            <ProductCard key={`eq-${name}-${price}`} name={name} price={price} image={image} />
          ))}
        </div>

        {/* Club Merchandise */}
        <div className="mt-20 flex items-center gap-6">
          <h3 className="text-[32px] font-black uppercase">{t("public.store.listing.clubMerchandiseHeading")}</h3>
          {!merchandiseLoading && (
            <span className="rounded-full bg-[#435974]/10 px-4 py-1 text-[14px] font-bold text-[#435974]">
              {t("public.store.listing.itemsCount", { count: merchandiseProducts.length })}
            </span>
          )}
        </div>
        <div className="mt-2 h-px bg-black/10" />
        {merchandiseLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-h-[381px] animate-pulse rounded-[10px] bg-black/5" />
            ))}
          </div>
        ) : merchandiseProducts.length === 0 ? (
          <p className="mt-8 text-[18px] text-black/50">{t("public.store.listing.noMerchandise")}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {merchandiseProducts.map((product) => (
              <MerchandiseCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-20 flex items-center justify-center gap-8 text-[#019839] text-[20px] font-medium">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#019839] text-white">
            1
          </button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <span className="tracking-[0.25em]">..........</span>
          <button>10</button>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#019839] text-white">
            <ChevronRight size={22} />
          </button>
        </div>
      </section>

      <section className="pt-10 relative grid w-full grid-cols-1 items-end gap-16 overflow-hidden px-4 pb-28 sm:px-6 md:px-10 lg:grid-cols-2 lg:px-20">
        <div>
          <h2 className="max-w-[516px] overflow-hidden text-[50px] font-normal font-[#000000] uppercase leading-[60px]">
            <AnimatedWords words={gearUpTitleWords} gap={16} />
          </h2>

          <p className="mt-12 max-w-[615px] text-[24px] font-normal leading-[30px]">
            {t("public.store.listing.gearUp.body")}
          </p>

          <button className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white">
            {t("public.common.getInTouch")} <ArrowRight size={20} />
          </button>
        </div>

        <img
          src="/img/image 30691.png"
          alt={t("public.store.listing.gearUp.imageAlt")}
          className="h-[568px] w-full max-w-[686px] object-contain lg:absolute lg:bottom-[-25px] lg:right-0"
        />
      </section>

      <footer className="w-full px-4 py-24 sm:px-6 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          <div>
            <img
              src="/ADCC-Logo.png"
              alt="ADCC"
              className="h-[63px] w-[149px] object-contain"
            />
            <p className="mt-8 max-w-[402px] text-[18px] leading-[23px]">
              {t("public.footer.brandText")}
            </p>

            <div className="mt-8 flex h-[57px] max-w-[367px] rounded-lg bg-[#8DDF93] p-[6px]">
              <input
                placeholder={t("public.footer.emailPlaceholder")}
                className="flex-1 bg-transparent px-4 outline-none"
              />
              <button className="rounded-lg bg-[#019839] px-7 text-white">
                {t("public.footer.submit")}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">{t("public.footer.quickLinks")}</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li>{t("public.nav.aboutUs")}</li>
              <li>{t("public.footer.rides")}</li>
              <li>{t("public.nav.events")}</li>
              <li>{t("public.footer.cyclistsCorner")}</li>
              <li>{t("public.footer.contactUs")}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">{t("public.footer.contactUs")}</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li className="flex gap-3">
                <Phone size={22} /> +971 2 654 5645
              </li>
              <li className="flex gap-3">
                <Phone size={22} /> 144226
              </li>
              <li className="flex gap-3">
                <Mail size={22} /> {t("public.store.listing.footer.address")}
              </li>
              <li className="flex gap-3">
                <MapPin size={22} /> info@adcyclingclub.ae
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-[#d5d5d5] pt-8 text-center text-[18px] text-black/70">
          {t("public.footer.copyright")}
        </div>
      </footer>
    </div>
  );
}
