import {
  Cloud, ArrowRight, Mail, Phone, MapPin, Bike, Apple
} from "lucide-react";

export default function ContactUsPage() {
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
            "linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url('/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png')",
        }}
      >
        <div className="absolute bottom-20 left-10 md:left-20 text-white">
          <h1 className="text-[60px] font-black uppercase">Contact Us</h1>
          <p className="mt-4 text-[24px]">Home / Contact us</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1268px] px-10 py-28">
        <div className="text-center">
          <h2 className="text-[60px] font-black uppercase">
            We’re Here to Help You Ride Better
          </h2>
          <p className="mt-4 text-[24px]">
            Ask us anything about events, tracks, or the cycling community in Abu Dhabi.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <img
              src="/img/490796704_1417267435941639_5633845168834004037_n. 1 (1).png"
              alt="Cycling group"
              className="h-[562px] w-full rounded-[15px] object-cover"
            />

            <div className="mt-8 rounded-[15px] border border-black/20 p-8">
              <div className="space-y-8">
                {[
                  [Mail, "Email", "INFO@ADCYCLINGCLUB.AE"],
                  [Phone, "Telephone", "+971 2 654 5645"],
                  [MapPin, "Location", "ABU DHABI, YAS ISLAND, YAS MARINA CIRCUIT, VILLA 18."],
                ].map(([Icon, label, value]) => (
                  <div key={label} className="flex items-center gap-6">
                    <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#019839] text-white">
                      <Icon size={34} />
                    </span>
                    <div>
                      <p className="text-[14px] text-black/50">{label}</p>
                      <h3 className="text-[18px] font-black uppercase">{value}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form className="rounded-[15px] border border-black/20 p-10">
            <h3 className="text-[40px] font-black uppercase">Get In Touch</h3>
            <p className="mt-3 max-w-[495px] text-[20px] leading-[25px] text-black/70">
              Reach out to us for any inquiries about cycling activities, events, or community support.
            </p>

            <div className="mt-12 space-y-8">
              <label className="block">
                <span className="text-[18px]">First Name</span>
                <input
                  placeholder="Enter your first name"
                  className="mt-3 h-[50px] w-full rounded-[10px] border border-[#CBCBCB] bg-transparent px-5 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[18px]">Email Address</span>
                <input
                  placeholder="Enter your email address"
                  className="mt-3 h-[50px] w-full rounded-[10px] border border-[#CBCBCB] bg-transparent px-5 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[18px]">Phone Number</span>
                <div className="mt-3 flex h-[50px] items-center rounded-[10px] border border-[#CBCBCB] px-4">
                  <span className="font-bold">🇦🇪 +971</span>
                  <div className="mx-4 h-6 border-l border-[#ccc]" />
                  <input
                    placeholder="Enter Your Mobile Number"
                    className="flex-1 bg-transparent outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[18px]">Message</span>
                <textarea
                  placeholder="Write message here"
                  className="mt-3 h-[100px] w-full rounded-[10px] border border-[#CBCBCB] bg-transparent px-5 py-4 outline-none"
                />
              </label>

              <label className="flex items-center gap-3 text-[#888]">
                <input type="checkbox" className="h-[27px] w-[27px]" />
                I agree to the privacy policy.
              </label>

              <button
                type="button"
                className="inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white"
              >
                Send Enquiry <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
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
              <input placeholder="Enter your email" className="flex-1 bg-transparent px-4 outline-none" />
              <button className="rounded-lg bg-[#019839] px-7 text-white">Submit</button>
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
              <li className="flex gap-3"><Mail size={22} /> Abu Dhabi, Yas island, yas marina circuit, Villa 18.</li>
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