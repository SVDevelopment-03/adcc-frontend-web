import {
  Cloud, Search, ChevronDown, ChevronRight, ArrowRight,
  Phone, Mail, MapPin, Bike, Apple
} from "lucide-react";

const products = [
  ["Ivan Njuki", "25000 AED", true, "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?q=80&w=900&auto=format&fit=crop"],
  ["Colnago Be", "15000 AED", false, "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=900&auto=format&fit=crop"],
  ["Tacx Galaxia Rollers Bike", "800 AED", false, "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=900&auto=format&fit=crop"],
  ["Trek Domane SL 6 - Like New", "12,000 AED", false, "https://images.unsplash.com/photo-1505705694340-019e1e335916?q=80&w=900&auto=format&fit=crop"],
  ["Shimano Ultegra Groupset", "3,500 AED", false, "https://images.unsplash.com/photo-1544191696-15693072e5dc?q=80&w=900&auto=format&fit=crop"],
  ["Shimano Ultegra Groupset", "3,500 AED", false, "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=900&auto=format&fit=crop"],
];

export default function AdccStorePage() {
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

      <section
        className="relative h-[640px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1600&auto=format&fit=crop')",
        }}
      >
        <div className="absolute bottom-20 left-10 md:left-20 text-white">
          <h1 className="text-[60px] font-black uppercase leading-none">ADCC Store</h1>
          <p className="mt-4 text-[24px]">Home / ADCC Store</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1268px] px-10 py-28">
        <h2 className="text-center text-[50px] font-black uppercase">
          Browse Our Cycling Collection
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[483px_292px_292px_156px]">
          <div className="flex h-[66px] items-center rounded-full border border-[#CBCBCB] bg-white px-8">
            <input
              placeholder="Search Communities"
              className="flex-1 bg-transparent text-[18px] outline-none"
            />
            <Search size={24} />
          </div>

          <button className="flex h-[66px] items-center justify-between rounded-full border border-[#CBCBCB] bg-white px-8 text-[18px]">
            All Categories <ChevronDown size={24} />
          </button>

          <button className="flex h-[66px] items-center justify-between rounded-full border border-[#CBCBCB] bg-white px-8 text-[18px]">
            All Conditions <ChevronDown size={24} />
          </button>

          <button className="h-[66px] rounded-full bg-[#019839] text-[20px] font-bold text-white">
            Search
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map(([name, price, active, image]) => (
            <div
              key={`${name}-${price}`}
              className={`min-h-[381px] rounded-[10px] border p-8 shadow-inner ${
                active ? "bg-[#435974] text-white border-[#727272]" : "border-black/5"
              }`}
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

      <section className="mx-auto grid max-w-[1268px] grid-cols-1 items-center gap-16 px-10 pb-28 lg:grid-cols-2">
        <div>
          <h2 className="max-w-[516px] text-[50px] font-black uppercase leading-tight">
            Gear Up with Official Cycling Essentials from ADCC
          </h2>

          <p className="mt-12 max-w-[615px] text-[24px] leading-[30px]">
            Explore a curated collection of cycling gear, apparel, and accessories
            designed for performance and comfort. Whether you’re training, racing, or
            riding for leisure, find everything you need to elevate your cycling experience.
          </p>

          <button className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white">
            Get In touch <ArrowRight size={20} />
          </button>
        </div>

        <img
          src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1000&auto=format&fit=crop"
          alt="Cycling essentials"
          className="h-[520px] w-full object-contain"
        />
      </section>

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
              From weekend warriors to elite athletes, we unite cyclists who share a passion
              for riding. ADCC is where your cycling journey thrives...
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

        <button className="fixed bottom-10 right-10 rounded-full bg-[#019839] p-4 text-white shadow-lg">
          <Bike size={28} />
        </button>
      </footer>
    </div>
  );
}