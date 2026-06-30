import {
  Cloud,
  Star,
  MapPin,
  Phone,
  Share2,
  Apple,
  Mail,
} from "lucide-react";

// const similarProducts = [
//   ["Trek Domane SL 6 - Like New", "12,000 AED"],
//   ["Shimano Ultegra Groupset", "3,500 AED"],
//   ["Shimano Ultegra Groupset", "3,500 AED"],
// ];

const similarProducts = [
  [
    "Trek Domane SL 6 - Like New",
    "12,000 AED",
    "/img/image 297012.png",
  ],
  [
    "Shimano Ultegra Groupset",
    "3,500 AED",
    "/img/image 2972123.png",
  ],
  [
    "Shimano Ultegra Groupset",
    "3,500 AED",
    "/img/image 2973.png",
  ],
];

export default function StoreDetailPage() {
  return (
    <div className="min-h-screen bg-[#eaf4ff] text-black">
      <header className="h-[134px] flex items-center justify-between px-10 md:px-20">
        <img src="/ADCC-Logo.png" alt="ADCC" className="h-[57px] w-[135px] object-contain" />

        <nav className="hidden lg:flex gap-12 text-[20px] font-medium">
          <span>About Us</span>
          <span>Events</span>
          <span>Community</span>
          <span>Tracks</span>
        </nav>

        <div className="flex items-center gap-6">
          <Cloud size={24} />
          <span className="text-[17px]">English</span>
          <button className="rounded-full bg-black px-8 py-4 text-[18px] font-bold text-white">
            Menu
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1268px] px-10 py-20">
        {/* <section className="grid grid-cols-1 gap-16 lg:grid-cols-[574px_1fr]"> */}
        <section className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[574px_1fr]">
          <div>
            <div className="flex h-[538px] items-center justify-center rounded-2xl bg-[#435974]">
              <img
                src="/img/image 306912.png"
                alt="Colnago BE"
                className="h-[390px] w-[510px] object-contain mix-blend-multiply"
              />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                "/img/Frame 531768.png",
                "/img/Frame 531769.png",
                "/img/Frame 531770.png",
              ].map((image, index) => (
                <div
                  key={index}
                  className="h-[178px] overflow-hidden rounded-xl bg-[#f4f4f4]"
                >
                  <img
                    src={image}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* <div className="pt-8"> */}
          {/* <div className="flex h-full flex-col justify-between"> */}
          {/* <div className="-mt-2 flex h-full flex-col"> */}
          <div className="flex h-[748px] flex-col">
            <div className="flex items-center gap-1 text-[#F58700]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={26} fill="currentColor" />
              ))}
              <span className="ml-3 text-[21px] font-bold text-[#555]">
                Trusted by 5,000+ Cyclists
              </span>
            </div>

            <h1 className="mt-4 text-[50px] font-black uppercase">Colnago BE</h1>

            <p className="mt-6 max-w-[499px] text-[18px] leading-[23px] text-[#555]">
              The DMT KR0 road shoes offer lightweight design and a precise fit for
              optimal power transfer and comfort.
            </p>

            <h2 className="mt-8 text-[36px] font-bold">AED 1,350</h2>

            <div className="mt-10 rounded-xl bg-[#323232] p-8 text-white">
              <div className="flex items-center gap-6">
                <img
                  src="/img/ImageWithFallback.png"
                  alt="Seller"
                  className="h-[90px] w-[90px] rounded-full object-cover"
                />
                <div>
                  <h3 className="text-[32px] font-semibold">Ahmed Al Mansouri</h3>
                  <p className="mt-1 flex items-center gap-2 text-[25px] text-white/60">
                    <MapPin size={24} /> Abu Dhabi City
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-5 text-[17px]">
                {[
                  ["Category", "Bikes"],
                  ["Condition", "Excellent"],
                  ["Location", "Abu Dhabi, UAE"],
                  ["Posted", "2 days ago"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between border-b border-white/30 pb-4"
                  >
                    <span className="text-white/80">{label}</span>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="mt-10 flex gap-8"> */}
            <div className="mt-[42px] flex gap-8">
              <button className="flex h-[60px] items-center gap-4 rounded-full bg-[#019839] px-10 text-[22px] font-bold text-white">
                <Phone size={24} /> Contact seller
              </button>
              <button className="flex h-[60px] items-center gap-4 rounded-full border border-[#019839] px-10 text-[22px] font-bold text-[#019839]">
                <Share2 size={24} /> Share
              </button>
            </div>
          </div>
        </section>

        <section className="mt-28">
          <div className="grid grid-cols-4 border-b border-[#ccc] text-[24px]">
            <button className="border-b-4 border-[#435974] pb-5 font-bold text-black">
              Description
            </button>
            <button className="pb-5 text-black/70">Specifications</button>
            <button className="pb-5 text-black/70">Benefits</button>
            <button className="pb-5 text-black/70">Shipping information</button>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-20 lg:grid-cols-2">
            <div>
              <h2 className="text-[40px] font-black uppercase text-[#333]">
                About This Product
              </h2>
              <p className="mt-8 text-[18px] leading-[23px] text-black/80">
                The DMT KR0 road cycling shoes are designed for riders who demand
                top-level performance. Built with advanced 3D knit technology, these
                shoes provide a lightweight, breathable, and adaptive fit that feels
                like a second skin.
                <br />
                <br />
                The carbon sole ensures efficient power transfer with every pedal
                stroke, making them ideal for racing and high-performance training.
                Combined with the BOA® closure system, the KR0 offers a secure and
                customizable fit for long-distance comfort.
              </p>
            </div>

            <img
              src="/img/image 3073.png"
              alt="Product detail"
              className="h-[414px] w-full rounded-md object-cover"
            />
          </div>
        </section>

        <section className="mt-32">
          <h2 className="text-center text-[50px] font-black uppercase">
            Similar Collections
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {similarProducts.map(([name, price, image]) => (
              <div
                key={name}
                className="min-h-[381px] rounded-[10px] border border-black/5 p-8 shadow-inner"
              >
                <h3 className="text-[24px] font-black uppercase">{name}</h3>
                <p className="mt-1 text-[18px] font-bold">{price}</p>
                <img
                  src={image}
                  alt={name}
                  className="mt-8 h-[240px] w-full object-contain mix-blend-multiply"
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <section
        className="flex h-[502px] items-center justify-center bg-cover bg-center text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url('https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=1600&auto=format&fit=crop')",
        }}
      >
        <div>
          <h2 className="text-[80px] font-black uppercase">Start Your Ride Today</h2>
          <p className="mt-7 text-[26px]">
            Download the ADCC app and join the cycling community.
          </p>

          <div className="mt-10 flex justify-center gap-5">
            <button className="rounded-full bg-white px-9 py-4 text-black">
              <span className="text-xs">GET IT ON</span> <b>Google Play</b>
            </button>
            <button className="flex items-center gap-3 rounded-full bg-white px-9 py-4 text-black">
              <Apple size={24} /> <b>App Store</b>
            </button>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1268px] px-10 py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          <div>
            <img src="/ADCC-Logo.png" alt="ADCC" className="h-[63px] w-[149px] object-contain" />
            <p className="mt-8 max-w-[402px] text-[18px] leading-[23px]">
              From weekend warriors to elite athletes, we unite cyclists who share a
              passion for riding. ADCC is where your cycling journey thrives...
            </p>

            <div className="mt-8 flex h-[57px] max-w-[367px] rounded-lg bg-[#8DDF93] p-[6px]">
              <input
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-4 outline-none"
              />
              <button className="rounded-lg bg-[#019839] px-7 text-white">
                Submit
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">Quick Links</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li>About Us</li>
              <li>Rides</li>
              <li>Events</li>
              <li>Cyclist’s Corner</li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">Contact Us</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li className="flex gap-3"><Phone size={22} /> +971 2 654 5645</li>
              <li className="flex gap-3"><Phone size={22} /> 144226</li>
              <li className="flex gap-3">
                <Mail size={22} /> Abu Dhabi, Yas island, yas marina circuit, Villa 18.
              </li>
              <li className="flex gap-3"><MapPin size={22} /> info@adcyclingclub.ae</li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-[#d5d5d5] pt-8 text-center text-[18px] text-black/70">
          Copyright 2026. Abu Dhabi Cycling Club
        </div>

      </footer>
    </div>
  );
}