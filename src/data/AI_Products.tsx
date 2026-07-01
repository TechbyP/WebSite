import { Wrench, Target, Gauge, Drill, Zap } from 'lucide-react';

export interface Product {
  id: number;
  date: number;
  name: string;

  nickname: string;
  category: string;
  categoryName?: string;
  bestseller?: boolean; // Optional field for bestseller products
  image: string;
  heroVideo: string;
  specs: string[];
  icon: any;
  description: string;
  detailedDescription: string | JSX.Element;
  herodescription?: string | JSX.Element;
  price: string;
  features: string[];
  howToUse?: string[]; // Optional field for usage instructions
  applications: string[];
  technicalSpecs: {
    [key: string]: string | JSX.Element;
  };
  gallery: string[];
  testimonials: {
    quote: string;
    author: string;
    company: string;
    rating: number;

  }[];
  // New sorting properties:
  priceValue?: number | null; // Numeric value for sorting by price
  electric?: boolean;         // Is it electric-powered?
  manual?: boolean;           // Is it manual operation?
  hydraulic?: boolean;        // Is it hydraulic-powered?
  layers?: number;            // Number of layers it can sample
  depth?: number;             // Max depth in cm
  weight?: number | string;            // Weight in kg
  operatingVoltage?: string;  // Operating voltage
  horizons?: number;          // Number of horizons
  magazines?: number;         // Number of magazines
  samplingCycleTime?: number; // Sampling cycle time in seconds
  table?: Array<{ emNo: string; articleName: string }>;
  warranty?: string;
  dimensions?: string;
  material?: string
  type?: string;

}
///1000
export const products: Product[] = [
  // mp-1
  {
    id: 1000,
    date: 1,
    name: "MP-1.90",
    nickname: "Full-Core Retriever",
    category: "SmartSystems",
    image: "",
    heroVideo: "",
    specs: [
      "Depth: 0–90 cm (stepless)",
      "Semi-automatic",
      "Full-core visibility",
      "16sec/core sampling cycle",
    ],
    icon: Gauge,

    priceValue: 14200, // Numeric value for sorting
    hydraulic: true,
    manual: false,
    electric: false,
    layers: 1,
    depth: 90,
    weight: 185,
    horizons: 1,
    magazines: 1,
    samplingCycleTime: 16,


    description: "Intact 0–90 cm soil cores, scientific precision, German stubbornness.",
    herodescription: (<>
      <p>
        It’s not flashy. It doesn't shout. It doesn’t do Wi-Fi. But what it <strong>does</strong> do—better than almost anything else—is give you a <strong>perfect, uninterrupted soil core</strong>, from surface to <strong>90 centimetres below</strong>. Yes, the whole story, from crust to subsoil, all in one go. It’s like an <strong>MRI for the earth</strong>.
      </p>
    </>
    ),

    detailedDescription: (
      <>
        <p className="mt-4">
          <strong>Universities love this thing</strong>. And not just because it looks vaguely like a rocket launcher. It gives <strong>full visibility of the soil profile</strong>—no mixing, no layering guesswork, just a clean, vertical slice of the Earth's innards. <strong>Perfect for N-min sampling</strong>, yes, but also for those who like to actually see what’s going on down there.
        </p>

        <p className="mt-4">
          Now, it's <strong>hydraulically powered, semi-automatic, and very clever</strong>. It’ll dig with millimetric politeness, and if it hits something unfriendly—like a rock or an old Roman coin—it simply <strong>stops</strong>. No drama. No broken bits.
        </p>

        <p className="mt-4">
          And best of all: it’s <strong>German engineering distilled to the essentials</strong>. Clean, efficient, utterly logical. Like <strong>Beethoven… if he were a soil sampler</strong>.
        </p>
      </>
    ),

    price: "From €14,200",
    features: [
      "Full-length (0–90 cm) intact soil core for profile visibility",
      "Centimetre-precise depth control",
      "Obstacle detection with automatic stop",
      "Manual core removal for sample integrity",
      "Fits pickups, trailers, and lightweight vehicles",
      "Upgradeable to MP-3.90 or MP-4.100"
    ],
    applications: [
      "N-min soil sampling",
      "Academic and university research",
      "Environmental monitoring",
      "Soil morphology and profile analysis",
      "Precision agriculture"
    ],
    howToUse: [
      "Step 1 – Impact Insertion: A grooved rod is driven into the soil using a high-frequency hydraulic hammer. It sounds aggressive, but it’s all very civilised.",
      "Step 2 – Hydraulic Retraction with Rotation: The rod is rotated and retracted hydraulically, ensuring the core stays pristine. Surgical precision, minus the scalpel.",
      "Step 3 – Core Revelation: The unbroken soil core is exposed for scientific admiration. All layers visible—from humus to hardpan.",
      "Step 4 – Manual Core Discharge: The core is manually removed. It's a quiet, satisfying moment of science. Like pulling data out of the Earth with your hands."
    ],
    technicalSpecs: {
      "Sampling Depth": "0–90 cm (stepless)",
      "Sample Type": "Single-core, full profile",
      "Sampling Cycle": "16 sec/core",
      "Power Supply": "Hydraulic (135 bar, 20 L/min, 12VDC)",
      "Obstacle Detection": "Yes",

      "Control Panel": "Digital",
      "Weight": "185 kg",
      "Mounting": "Pickup trucks, trailers, light agricultural vehicles"
    },
    gallery: [
     

    ],
    testimonials: [
      {
        quote: "The MP-1.90 is a true workhorse. It gives us full core visibility, which is essential for our teaching and fieldwork programs.",
        author: "Prof. Klaus Brenner",
        company: "University of Göttingen, Dept. of Soil Science",
        rating: 5
      },
      {
        quote: "It’s beautifully overengineered, in a very German way. Every core we extract is pristine. Students love using it.",
        author: "Dr. Lucia Romero",
        company: "University of Zaragoza – Faculty of Agronomy",
        rating: 5
      }
    ]
  },
  // mp-2
  {
    id: 1001,
    date: 2,
    name: "MP-2.60",
    nickname: "Mid Range MultiPRO",
    category: "SmartSystems",
    bestseller: true,
    image: "",
    heroVideo: '40DoQB6vey0',
    specs: [
      "Depth: up to 60 cm",
      "Fully Automatic",
      "Optimised for N-min profiling",
      "18 sec/core sampling cycle"
    ],
    icon: Gauge,


    priceValue: 16500,
    hydraulic: true,
    manual: false,
    electric: false,
    layers: 2,
    depth: 60,
    weight: 200,
    horizons: 2,
    magazines: 3,
    samplingCycleTime: 18,


    description: "Automatic nitrogen profiling without the faff.",
    herodescription: (
      <>
        <p>
          Say hello to the <strong>MP-2.60</strong> — a wonderfully practical piece of machinery for <strong>N-min soil sampling</strong>. It goes down to 60 cm, gets what it needs, and carries on without asking for tea or praise. Designed to be <strong>reliable, not ridiculous</strong>, it’s ideal for anyone who likes things to work properly the first time.
        </p>
      </>
    ),
    detailedDescription: (
      <>
        <p className="mt-4">
          In a world of overcomplication, the <strong>MP-2.60</strong> is refreshingly straightforward. It’s built specifically for <strong>automatic nitrogen profiling</strong>—none of that faffing about with manual augers or guesswork. It uses a high-frequency <strong>hydraulic hammer</strong> to punch through soil like a gentle jackhammer, then quietly rotates and lifts the rod before <strong>politely dropping the sample</strong> into its container.
        </p>

        <p className="mt-4">
          It has <strong>smart internal logic</strong> to decide which bits of soil to keep, and if you fancy it, you can even enable <strong>layer separation</strong> for horizon-specific sampling. The samples themselves land in <strong>waterproof containers</strong>, and the whole unit mounts comfortably on trailers, pickups, or basically anything that rolls and doesn’t fall apart.
        </p>

        <p className="mt-4">
          And should your research ambitions outgrow its 60 cm limit, don’t panic — the MP-2.60 is fully <strong>upgradeable to the MP-3.90 or MP-4.100</strong>.
        </p>
      </>
    ),
    price: "From €16,500",
    features: [
      "Fully automatic extraction to 60 cm",
      "Smart logic: discards or keeps samples based on your settings",
      "Impact-driven sampling with auto-discharge",
      "Layer separation option for horizon-specific sampling",
      "Waterproof sample containers",
      "Customisable sampling depth and horizon count",
      "Obstacle detection and safe auto-shutdown",
      "Built for real, daily use – not just weekend hobbyists"
    ],
    howToUse: [
      "Drives a grooved rod into the soil using a high-frequency hydraulic hammer — yes, it sounds as satisfying as it is",
      "Hydraulically rotates and retracts the rod without disturbing your samples",
      "Samples are automatically discharged into their proper containers",
      "Optional layer separation sorts the soil by horizon during extraction"
    ],
    applications: [
      "Nmin/Nitrate profiling",
      "Precision agriculture",
      "Environmental soil monitoring",
      "Field sampling on a budget with ambitions"
    ],
    technicalSpecs: {
      "Sampling Depth": "0–60 cm",
      "Sampling Type": "Impact-driven, fully automatic",
      "Hammer Unit": "Hydraulic, high-frequency",
      "Horizons": "1–2 layers",
      "Magazines": "3",
      "Sampling Cycle Time": "18 sec/core",
      "Mounting Options": "Pickup, trailer, or anything vaguely roadworthy",
      "Sample Sorting": "Automatic, horizon-specific separation",
      "Special Features": "Obstacle detection, Waterproof containers, Digital keyboard",
      "Power Source": "Hydraulic system (135 bar, 20 l/min, 12VDC)",
      "Weight": "200 kg"
    },
    gallery: [
   
    ],
    testimonials: [
      {
        quote: "Reliable, easy to use, and delivers exactly what we need for our soil nitrate work.",
        author: "Prof. Lars Becker",
        company: "AgriData Solutions",
        rating: 5
      },
      {
        quote: "A great choice for any team starting out with automated sampling. Solid performance, low maintenance.",
        author: "Dr. Hannah Lee",
        company: "Soil Research Group",
        rating: 4
      }
    ]
  },
  // mp-3
  {
    id: 1002,
    date: 3,
    name: "MP-3.90",
    nickname: "TripleLayer Pro",
    category: "SmartSystems",
    bestseller: true,
    image: "",
    heroVideo: '40DoQB6vey0',
    specs: [
      "Depth: up to 95 cm",
      "Fully Automatic",
      "3-Layer Separation",
      "20 sec/core sampling cycle"
    ],
    icon: Gauge,

    priceValue: 23500,
    hydraulic: true,
    manual: false,
    electric: false,
    layers: 3,
    depth: 95,
    weight: 200,
    horizons: 3,
    magazines: 3,
    samplingCycleTime: 20,


    description: "Tough enough to handle the soil, smart enough to work efficiently.",
    herodescription: (<>
      <p>
        The <strong>MP-3.90</strong> is what happens when you take <strong>German thinking</strong>, sprinkle in some <strong>overengineering</strong>, and then ask it to <strong>dig holes for science</strong>. Designed to extract soil samples down to <strong>95 cm</strong> without so much as a grunt from the operator, it can do <strong>3-layer separation</strong>, <strong>auto-discharge</strong>, and decide (all on its own) when to give up if the soil fights back.
      </p>

    </>
    ),
    detailedDescription: (
      <>
        <p className="mt-4">
          Now, <strong>precision and efficiency</strong> aren’t just buzzwords here—they’re thoughtfully built in, so you can concentrate on the data rather than wrestling with stubborn dirt. It manages tough soil with <strong>barely any fuss from the operator</strong>, making it a rather dependable companion for serious scientific work or proper field research.
        </p>

        <p className="mt-4">
          It’ll slot neatly onto pickups, trailers, tractors, or just about anything vaguely roadworthy, with <strong>customisable depth and horizon settings</strong> to suit whatever you need. Plus, your samples end up safe and sound in <strong>waterproof containers</strong>, which is a nice touch.
        </p>

        <p className="mt-4">
          And here’s the kicker—it’s built for <strong>proper, professional use</strong>, not some weekend warrior’s toy. Solid, reliable, and quietly competent—exactly what you’d expect from German engineering, really.
        </p>
      </>
    ),





    price: "From €23,500",
    features: [
      "Fully automatic extraction down to 95 cm",
      "Optional 3-layer separation for horizon-specific sampling",
      "Takes 3 consecutive samples without leaving the seat",
      "Mounts on pickups, trailers, or anything vaguely roadworthy",
      "Auto-discharge and sample sorting during extraction",
      "Customizable sampling depth and horizon count",
      "Waterproof containers for sample storage",
      "Auto-shutdown when it hits a rock and says 'nope'",
      "Smart logic: discards or keeps samples based on settings",
      "Built for serious, continuous use — this isn’t your casual, once-in-a-while gadget."
    ],
    howToUse: [
      "Drives a serious-looking grooved rod into the soil with a high-frequency hydraulic hammer — think of it as a very precise poke",
      "Hydraulically rotates and retracts the rod, avoiding the sort of brutish yanking that upsets soil and engineers alike",
      "Automatically empties the auger on the way up — no scooping, no fiddling, just a polite drop into the sample containers",
      "Distributes sample material neatly into separate containers depending on soil horizon — because even dirt should know where it belongs"
    ],
    applications: [
      "Precision agriculture",
      "Environmental soil monitoring",
      "Nmin/Nitrate testing",
      "Soil profiling & research",
      "Field work where speed, accuracy, and coffee breaks matter"
    ],
    technicalSpecs: {
      "Sampling Depth": "0–95 cm",
      "Sampling Type": "Impact-driven, fully automatic",
      "Hammer Unit": "Hydraulic, 2,200 strokes/min",
      "Horizons": "1–3 layers (user-configurable)",
      "Magazines": "3",
      "Sampling Cycle Time": "18 sec/core",
      "Mounting Options": "Pickup, trailer, or light-duty vehicle",
      "Sample Sorting": "Automatic, horizon-specific separation",
      "Special Features": (<p>Obstacle detection, Waterproof containers, Digital<br />keyboard</p>),
      "Penetration Control": "Automatic shutdown",
      "Power Source": "Hydraulic system (135 bar, 20 l/min, 12VDC)",
      "Weight": "200 kg",

    },
    gallery: [
    
    ],
    testimonials: [
      {
        quote: "Perfect for our wetland research. Works exceptionally well in clay-rich soils where other augers fail.",
        author: "Dr. Maria Santos",
        company: "Wetland Research Center",
        rating: 5
      },
      {
        quote: "The half-cylinder design is brilliant for cohesive soils. Sample quality is consistently excellent.",
        author: "Robert Taylor",
        company: "Soil Dynamics Lab",
        rating: 5
      }
    ]
  },
  // mp-4
  {
    id: 1003,
    date: 4,
    name: "MP-4.100",
    nickname: "UltraDepth MAX",
    category: "SmartSystems",
    bestseller: false,
    image: "",
    heroVideo: "",
    specs: [
      "Depth: up to 100 cm",
      "Fully Automatic",
      "4-Layer Separation",
      "22 sec/core sampling cycle"
    ],
    icon: Gauge,


    priceValue: 25500,
    hydraulic: true,
    manual: false,
    electric: false,
    layers: 4,
    depth: 100,
    weight: 215,
    horizons: 4,
    magazines: 4,
    samplingCycleTime: 22,

    description: "Deep soil, sorted smartly. No fuss, just depth.",
    herodescription: (<>
      <p>
        This is the <strong>MP-4.100</strong> — imagine if a hydraulic hammer and a PhD in soil science had a child. It’s a <strong>fully automatic sampler</strong> that goes down a full <strong>100 cm</strong>, pulls out up to <strong>four layers</strong>, and sorts them like a butler with a geological hobby. It's what you'd get if you asked Germany to make a mole.
      </p>
    </>),

    detailedDescription: (<>
      <p className="mt-4">
        Designed for those who demand <strong>depth and discipline</strong>, the MP-4.100 gets right into the soil and does the job with no grumbling and no manual scooping. A <strong>hydraulic impact system</strong> powers a grooved rod into the ground, where it quietly gets on with the job of extracting science-grade samples. Once retracted, it <strong>automatically empties</strong> the goods into their proper places.
      </p>

      <p className="mt-4">
        It’s got <strong>smart logic</strong> that decides whether to keep or toss material based on your settings, and a <strong>layer separation mechanism</strong> that’s surprisingly polite about where each horizon goes. Mount it on a pickup, trailer, or anything vaguely roadworthy and off you go.
      </p>


    </>),

    price: "From €25,500",
    features: [
      "Fully automatic extraction to 100 cm",
      "Optional 4-layer separation for horizon-specific sampling",
      "Auto-discharge and sample sorting during extraction",
      "Smart logic: discards or keeps samples based on your settings",
      "Customizable sampling depth and horizon count",
      "Mounts on pickups, trailers, or anything vaguely roadworthy",
      "Obstacle detection and safe auto-shutdown",
      "Waterproof sample containers",
      "Digital keyboard for on-the-fly adjustments",
      "Built for real, daily use – not just occasional science days"
    ],
    howToUse: [
      "Drives a grooved rod into the soil using a high-frequency hydraulic hammer — elegantly brutal",
      "Hydraulically rotates and retracts the rod — no yanking, no drama",
      "Automatically empties the auger into appropriate containers on the way up",
      "Distributes sample material neatly into separate containers depending on soil horizon"
    ],
    applications: [
      "Deep soil profiling",
      "Environmental and agricultural research",
      "Nmin/Nitrate testing",
      "Precision agriculture",
      "Field work requiring serious depth and sample fidelity"
    ],
    technicalSpecs: {
      "Sampling Depth": "0–100 cm",
      "Sampling Type": "Impact-driven, fully automatic",
      "Hammer Unit": "Hydraulic, high-frequency",
      "Horizons": "1–4 layers",
      "Magazines": "4",
      "Sampling Cycle Time": "22 sec/core",
      "Mounting Options": "Pickup, trailer, or light-duty vehicle",
      "Sample Sorting": "Automatic, horizon-specific separation",
      "Special Features": "Obstacle detection, Waterproof containers, Digital keyboard",
      "Power Source": "Hydraulic system (135 bar, 20 l/min, 12VDC)",
      "Weight": "215 kg"
    },
    gallery: [
   
    ],
    testimonials: [
      {
        quote: "It handles heavy soils and deep profiles better than any manual method we've tried. Truly hands-off and precise.",
        author: "Dr. Felix Hartmann",
        company: "GeoCrop Labs",
        rating: 5
      },
      {
        quote: "Reliable and smart — the sample logic saves us hours of post-processing.",
        author: "Dr. Nina Weber",
        company: "AgroField Analytics",
        rating: 5
      }
    ]
  },
  // dh
  {
    id: 1004,
    date: 5,
    name: "DH-1.30",
    nickname: "Hydraulic Scout",
    category: "SmartSystems",
    bestseller: true,
    image: "",
    heroVideo: "",
    specs: [
      "Depth: up to 30 cm",
      "Fully Automatic",
      "Suspension-independent depth control",
      "5 sec/core sampling cycle",
    ],
    icon: Wrench,

    priceValue: 8950,
    electric: false,
    manual: false,
    hydraulic: true,
    depth: 30,
    weight: 45,
    operatingVoltage: "",
    horizons: 1,
    magazines: 1,
    samplingCycleTime: 14,

    description: "Efficient, dependable, and quietly confident. Soil sampling, but with a bit of hydraulic muscle behind it.",
    herodescription: (
      <>
        <p>
          The <strong>DH-1.30</strong> is a robust, hydraulic soil sampler built to perform with quiet confidence and steady power—no overcomplication, just solid results.
          Drilling smoothly up to <strong>30 centimetres</strong>, it’s powered by a hydraulic engine—so you get plenty of grunt, no electrics needed. A little louder than its electric cousin, sure, but it’s no show-off. Just reliable, solid work, day in, day out.
        </p>
      </>
    ),
    detailedDescription: (
      <>
        <p className="mt-4">
          The <strong>DH-1.30</strong> takes the sensible design of its <strong>electric sibling</strong> but swaps out the battery for a <strong>hydraulic engine</strong> — ideal if you’ve got access to hydraulic power and want a bit more <strong>torque</strong>.
        </p>
        <p className="mt-4">
          <strong>Depth control</strong> is sharp and precise, with <strong>millimetre adjustments</strong> to handle uneven ground as if it’s nothing.
        </p>
        <p className="mt-4">
          Operation is delightfully straightforward: <strong>one button, two preset depths</strong> — because life’s too short for fiddly controls.
        </p>
        <p className="mt-4">
          It weighs a sturdy <strong>45 kg</strong>, built <strong>tough enough</strong> to handle real fieldwork but <strong>light enough</strong> that you won’t need a forklift or a strongman to move it.
        </p>
        <p className="mt-4">
          <strong>Easily mounted</strong> on quads, trailers, pickups, or light-duty vehicles, this thing is made for <strong>versatility</strong>.
        </p>
        <p className="mt-4">
          For those who prefer the <strong>classic reliability of hydraulic power</strong> with <strong>dependable German engineering</strong>, this sampler is the sensible choice.
        </p>
      </>
    ),

    price: "From €8,950",


    features: [
      "Hydraulic drive for dependable, powerful drilling",
      "Precision millimetre depth adjustment",
      "Not affected by vehicle suspension—no surprises underground",
      "Two preset depths for fast switching",
      "Compact and portable at 45 kg",
      "Mounts easily on a range of light vehicles",
    ],

    applications: [
      "Macronutrient soil sampling",
      "Precision farming (with a bit of old-school power)",
      "Agricultural and environmental research",
      "Soil health and nutrient monitoring",
    ],

    howToUse: [
      "Park your rig and position the sampler where the soil’s calling.",
      "Select your preferred depth (yes, down to the millimetre).",
      "Hit the button and let the hydraulic muscle do the heavy lifting.",
      "Pull out your perfect soil core and feel quietly pleased with yourself.",
    ],

    technicalSpecs: {
      "Sampling Depth": "0–30 cm",
      "Sample Type": "Single-core, fully automatic",
      "Horizons": "1",
      "Magazines": "1",
      "Sampling Cycle Time": "5 seconds per core",
      "Mounting Options": "Quad, pickup, trailer, or light-duty vehicle",
      "Control": "Electric push-button panel",
      "Power Source": "Hydraulic engine",
      "Weight": "45 kg"
    },

    gallery: [
   
    ],

    testimonials: [
      {
        quote: "The DH-1.30’s hydraulic drive means no compromises on power or precision. Perfect for tougher soils and longer field days.",
        author: "Sven Becker",
        company: "AgriTech Solutions",
        rating: 5
      },
      {
        quote: "Mounted on our trailer, the DH-1.30 handles everything with quiet confidence. Depth control is spot on every time.",
        author: "Maria Schneider",
        company: "Soil Science Research Group",
        rating: 5
      },
      {
        quote: "A rugged, reliable machine with enough grunt to make fieldwork feel less like hard work.",
        author: "Tomás Herrera",
        company: "Precision Agriculture Co.",
        rating: 4
      }
    ],
  },
  // de
  {
    id: 1005,
    date: 6,
    name: "DE-1.30",
    nickname: "Electric Scout",
    category: "SmartSystems",
    bestseller: true,
    image:"",
    heroVideo: 'm6BqgLotHT8',
    specs: [
      "Depth: up to 30 cm ",
      "Fully electric drilling system ",
      "Suspension-independent depth control",
      "5 sec/core sampling cycle ",
    ],
    icon: Zap,

    priceValue: 12600,
    electric: true,
    manual: false,
    hydraulic: false,
    depth: 30,
    weight: 45,
    operatingVoltage: "24 VDC",
    horizons: 1,
    magazines: 1,
    samplingCycleTime: 5,

    description: "Smart, silent, and very nimble. Making soil sampling look almost effortless.",
    herodescription: (
      <>
        <p>
          The <strong>DE-1.30</strong> is the <strong>sensible, compact soil sampler</strong> that quietly gets on with the job—drilling down up to <strong>30 centimetres</strong> without making a fuss or needing you to chain-smoke while it works. It’s <strong>electric</strong>, so <strong>no fumes, no noise</strong>, just clean, reliable soil sampling.
        </p>
      </>
    ),
    detailedDescription: (
      <>
        <p className="mt-4">
          Building on the trusty <strong>N2012 model</strong>, the <strong>DE-1.30</strong> uses an <strong>electric drill</strong> that’s so precise it could probably thread a needle—if soil sampling were into embroidery. <strong>Millimetre adjustments</strong> mean you get exactly the depth you want, no matter how bumpy or unpredictable the terrain. It’s a bit like a <strong>polite butler</strong> who won’t let you down.
        </p>
        <p className="mt-4">
          The <strong>control unit</strong> is simplicity itself—press a button and off it goes. <strong>Two preset depths</strong> let you switch between sampling jobs faster than you can say <em>“groundbreaking technology”</em> (see what I did there?). No faffing about with complicated menus or cryptic controls.
        </p>
        <p className="mt-4">
          At just <strong>45 kilograms</strong> and powered by a <strong>24 V battery pack</strong> (sold separately), it’s <strong>light enough to be nimble</strong> but <strong>tough enough to handle real-world fieldwork</strong>. No need to call in a crane or an ex-army sergeant to move it.
        </p>
        <p className="mt-4">
          The DE-1.30 can be easily mounted on <strong>quads, trailers, and a variety of light vehicles</strong>, making it versatile for many field conditions.
        </p>
        <p className="mt-4">
          So, if you want <strong>precise, dependable soil samples</strong> without the petrol engine drama or the noise of a heavy drill, the DE-1.30 is your go-to machine. It’s <strong>German engineering</strong> with a <strong>quiet, electric twist</strong> that just gets the job done.
        </p>
      </>
    ),


    price: "From €12,600",
    features: [
      "Fully electric drilling for clean, precise sampling",
      "Millimeter-precise depth adjustment (because close enough isn’t good enough)",
      "Independent of vehicle suspension to avoid depth tantrums",
      "Two quick-select depth presets",
      "Compact and lightweight at 45 kg",
      "Runs on a 24 V external battery pack (sold separately)",
    ],
    applications: [
      "Macronutrient soil sampling",
      "Precision farming with a bit of style",
      "Agricultural and environmental research",
      "Soil health and nutrient monitoring",
    ],
    howToUse: [
      "Position the sampler where the soil needs a look-see.",
      "Choose your depth. Millimeter increments, because we're picky.",
      "Press the button and watch the electric drill politely do its job.",
      "Pull out the soil core and marvel at your perfectly sampled earth.",
    ],
    technicalSpecs: {
      "Sampling Depth": "0–30 cm",
      "Sample Type": "Single-core, full automatic",
      "Horizons": "1",
      "Magazines": "1",
      "Sampling Cycle Time": "5 sec/core",
      "Mounting Options": "Quads, pickup, trailer, or light-duty vehicle",
      "Control": "Electric push-button control panel",
      "Operating Voltage": "24 VDC",
      "Weight": "45 kg",


    },
    gallery: [
 
    ],
    testimonials: [
      {
        quote: "The DE-1.30’s precision and ease of use have transformed our soil sampling routine. The electric drill is whisper-quiet and remarkably reliable.",
        author: "Sven Becker",
        company: "AgriTech Solutions",
        rating: 5
      },
      {
        quote: "Mounting the DE-1.30 on our quad made fieldwork incredibly efficient. Its depth control and battery power are perfect for on-the-go sampling.",
        author: "Maria Schneider",
        company: "Soil Science Research Group",
        rating: 5
      },
      {
        quote: "Lightweight but robust, the DE-1.30 handles tough soil conditions with ease. The user-friendly control unit is a big plus in remote locations.",
        author: "Tomás Herrera",
        company: "Precision Agriculture Co.",
        rating: 4
      }
    ],

  },
  // boprob
  {
    id: 1006,
    date: 7,
    name: "BOPROB III",
    nickname: "The Sixteen Express",
    category: "SmartSystems",
    bestseller: true,
    image: "",
    heroVideo: "VKJGuOLXzIQ",
    specs: [
      "Depth: 10–30 cm",
      "Fully Automatic",
      "Tow-behind sampling while driving",
      "16 samples in ~4 min"
    ],
    icon: Target,

    priceValue: 28500,
    electric: false,
    manual: false,
    hydraulic: true,
    depth: 30,
    weight: 600,
    operatingVoltage: "",
    horizons: 1,
    magazines: 16,
    samplingCycleTime: 9,

    description: "Tow it, sample it, then keep on moving—no fuss, no waiting.",


    herodescription: (
      <>
        <p>
          This is the <strong>BOPROB III</strong>—also known, rather jauntily, as the <strong>The Sixteen Express</strong>. It’s a trailer that takes soil samples while you drive. Yes, really. No stopping, no button-mashing, no shouting at interns. Just tow it behind something with wheels and let it get on with the job.
        </p>
      </>
    ),



    detailedDescription: (
      <>
        <p className="mt-4">
          Now, the <strong>The Sixteen Express</strong> is what you'd call a clever bit of kit. It’s a <strong>tow-behind soil sampler</strong> designed to do its work while you keep moving. Which, frankly, is how everything should work—but doesn’t.
        </p>
        <p className="mt-4">
          Sampling happens at a rather brisk pace thanks to a <strong>hydraulic hammer</strong> and a <strong>rotating crank</strong> that goes the full 360°, stabbing into the ground like a polite little jackhammer, then politely ejecting the core into the sample magazine.
        </p>
        <p className="mt-4">
          Everything is watched over by a <strong>7-inch touchscreen</strong>—lovely bit of kit—so you know exactly what it’s doing at any time. There's even an optional camera, in case you want to see it work, or just admire your purchase.
        </p>
        <p className="mt-4">
          The wheels are large and soft—<strong>235/60 R16</strong>, if you're into that sort of thing—which means minimal ground pressure and no getting bogged down in a muddy field, unless you've really tried.
        </p>
        <p className="mt-4">
          It hitches easily to <strong>tractors, pickups, quads—or anything else with a tow hitch</strong>, really. No fiddling, no adapters, no workshop heroics required. And once you're done, it unhitches just as easily.
        </p>
        <p className="mt-4">
          If you’re driving too fast—or too slowly, perhaps because you’re admiring the scenery—the system simply refuses to sample. Which is brilliant, because it means the machine is smarter than the average driver.
        </p>
      </>
    ),




    price: "€28,500",

    features: [
      "Hydraulic impact and rotation system",
      "360° rotating crank with auto-discharge",
      "Samples while driving—no need to stop",
      "7-inch touchscreen display for control and monitoring",
      "Optional onboard camera for visual feedback",
      "Low soil compaction from 235/60 R16 wheels",
      "No tractor mods needed—trailer mounts quickly",
      "Speed-sensitive protection against misuse"
    ],

    applications: [
      "High-throughput macronutrient sampling",
      "Precision farming with minimal fuel use",
      "Soil health monitoring on large acreages",
      "Shallow horizon sampling during transit"
    ],

    howToUse: [
      "Attach the trailer to a suitable tractor or tow-capable vehicle—no modifications needed.",
      "Set your desired depth and sample interval on the touchscreen.",
      "Drive at 4–15 km/h and let the machine sample automatically.",
      "Check camera and screen as needed, or just carry on farming.",
      "When 16 samples are collected, empty and reload the magazine."
    ],


    technicalSpecs: {
      "Sampling Depth": "10–30 cm",
      "Sample Type": "Impact-driven, fully automatic",
      "Horizons": "1",
      "Magazines": "16",
      "Sampling Cycle Time": "8–10 seconds per sample",
      "Mounting Options": (
        <p>Tow-behind trailer (fits tractors or any vehicle<br />with standard hitch)</p>),
      "Control": "7-inch touchscreen panel",
      "Power Source": "Hydraulic",
      "Wheels": "235/60 R16, low soil compaction",
      "Weight": "Approx. 600 kg"
    },


    gallery: [
      
    ],

    testimonials: [
      {
        quote: "We finished a 10-hectare survey in under an hour. The The Sixteen Express just works. No drama, no stopping.",
        author: "Lena Hoffmann",
        company: "TerraCrop Systems",
        rating: 5
      },
      {
        quote: "The touchscreen is responsive, and the sampling quality is spot on. It handles our clay-heavy soils beautifully.",
        author: "Henrik Voss",
        company: "Nordland AgriTech",
        rating: 5
      },
      {
        quote: "It saves wear on the tractor and the driver. One of the best investments for large-scale sampling we’ve made.",
        author: "Jürgen Möller",
        company: "FieldScan GmbH",
        rating: 5
      }
    ],
  },

  ///2000
  

  // Lay-down
  {
    id: 2000,
    date: 2025,
    name: "Lay‑down Frame",
    nickname: "Mount Kit",
    category: "accessory",
    bestseller: false,

    image: "",
    heroVideo: "",
    icon: "",

    specs: [
      "Standard 50 mm tow hitch with a 13‑pin 12 V socket required.",
      "Weight: ≈70 kg (DH/DE); ≈80 kg (MP bracket)",
      "EN 10025 S355 steel, powder-coated, 4 mm thick",
      "Fold-down & hitch stability"
    ],


    priceValue: 1650,
    price: "From €1 650",

    electric: false,
    manual: false,
    hydraulic: true,


    description: "A no‑nonsense mounting bracket for your sampler—fits the back end of most civilized vehicles without turning them into Franken-trucks.",

    herodescription: (
      <>
        <p>
          <strong>Brilliantly sensible.</strong> This lay-down frame, TÜV-certified Mount Kit bolts to your tow hitch like it belongs there. Supports our MP, DH, and DE series samplers.
        </p>
      </>
    ),

    detailedDescription: (
      <>
        <p className="mt-4">
          Mounted on the truck bed connected to that place where your <strong>tow bar lives</strong>—just below the <strong>boot lid</strong> and above the <strong>exhaust pipe drama</strong>—this frame lets you carry a full soil sampler with <strong>elegance</strong>. <strong>Fold it down to operate, fold it up to drive off to dinner</strong>. It’s <strong>sturdy</strong>, <strong>tested</strong>, and <strong>painted like a German tool cabinet</strong>.
        </p>

        <p className="mt-4">
          Clients can choose their level of involvement: some prefer to <strong>install the frame themselves</strong> with the help of our <strong>foolproof instructions</strong>; others <strong>drop by with their vehicle</strong> and let us handle the <strong>mounting and hydraulic wizardry</strong>; and for those who enjoy <strong>instant gratification</strong>, we also offer <strong>fully kitted-out field rigs</strong>—<strong>pre-mounted</strong>, <strong>tested</strong>, and generally quite <strong>smug about it</strong>.
        </p>


      </>
    ),

    features: [
      "Tow‑hitch + 13‑pin mounting (no welding, no trauma)",
      "TÜV‑approved for road and field use",
      "Structural EN S355 steel, powder-coated",
      "Quick‑release M16 mounting hardware included",
      "Foldable design tested to 10 000 deployment cycles",
      "Supports external power packs (hydraulic or battery)",
    ],

    applications: [
      "ATV/UTV soil sampling platforms",
      "Utility and pickup truck installations",
      "Hydraulic MP‑series or electric DE/DH samplers",
      "Seasonal use or fully mounted field rigs"
    ],

    howToUse: [
      "Vehicle has ISO 50 mm tow ball? Check.",
      "Vehicle has a 13‑pin 12 V socket (for DE‑1.30)? Check.",
      "Hydraulic output available (135–220 bar @60 L/min)?",
      "Fold down, test power, and begin sampling.",
    ],

    technicalSpecs: {
      "Weight": "70 kg (DH/DE); 80 kg (MP version)",
      "Material": "EN S355 steel, 4 mm thick, RAL 9005 powder-coat",
      "Mount Interface": "50 mm ISO tow hitch + DE‑1.30 13‑pin plug",
      "Hydraulic Input": (
        <>
          135–220 bar; 20–90 L/min; DN 19/¾″ hose, burst
          <br />
          ≥500 bar
        </>
      ),
      "Power Options": "External hydraulic power pack or battery",
      "Certifications": (
        <>
          TÜV DE‑745‑K‑2024; EN 12642 + ISO 1496‑3
          <br />
          compliant
        </>
      ),

      "Corrosion Resistance": "≥1 000 h neutral salt spray (ISO 9227)",
      "Included Hardware": (
        <>
          M16×45‑8.8 + self‑locking M10 bolts, all
          <br />
          plated
        </>
      ),

      "Cycle Life": "10 000 folds (mechanism durability test)",
      "Warranty": "12 months standard",
      "Bracket Compatibility": (
        <>
          All MP (MP‑1.90 to MP‑4.100), DH, and
          <br />
          DE models
        </>
      )

    },

    gallery: [
   
    ],
    testimonials: []
  },
  //Three-Point Hitch
  {
    id: 2001,
    date: 2025,
    name: "Three‑Point Hitch",
    nickname: "Mount Kit",
    category: "accessory",
    bestseller: false,

    image: "",
    heroVideo: "",
    icon: "",

    specs: [
      "Fits Cat‑2 or Cat‑3 tractor 3‑point PTO systems",
      "Heavy‑duty A‑frame steel construction",
      "Black epoxy corrosion protection",
      "Compatible with all MP-series, DH, and DE soil sampling machines"
    ],

    priceValue: 2790,
    price: "From €2 790",

    electric: false,
    manual: false,
    hydraulic: true,

    description:
      "Makes your tractor be a soil-sampling beast, harnessing PTO power for hydraulic sampler integration. Tough, reliable, no-nonsense.",

    herodescription: (
      <>
        <p>
          <strong>Tractor 3‑Point Hitch Frame</strong>: The heavyweight champion for Cat‑2/3 tractors, designed to mount your hydraulic soil sampler straight onto the tractor’s PTO system with a hydraulic pump platform to match.
        </p>
      </>
    ),

    detailedDescription: (
      <>
        <p className="mt-4">
          Imagine the <strong>steel backbone</strong> your tractor never knew it needed. Crafted from <strong>thick A‑frame steel</strong> and cloaked in <strong>black epoxy armor</strong>, this mount bolts cleanly onto your tractor’s lift arms. It’s built to survive farm life — rain, mud, and the odd tractor tantrum included. The kit comes with <strong>lift bars and all mounting bolts</strong>, so no improvising with rusty nails or duct tape.
        </p>
        <p className="mt-4">
          Suitable for <strong>compact tractors with lift arm spacing around 50 to 60 inches</strong>, this frame supports the hydraulic pump directly powered by your PTO shaft, giving you efficient hydraulic flow for smooth soil sampling. It’s the upgrade that makes your tractor feel like it’s ready to take on the <strong>field Olympics</strong>.
        </p>
      </>
    ),

    features: [
      "Welded A‑frame steel—sturdy enough for actual work",
      "PTO pump mount—because zip ties aren’t engineering",
      "Black epoxy finish—like paint, but smarter",
      "Comes with bolts and lift bars—no scrounging required",
      "Fits Cat‑2/3 lift arms (50–60\")",
      "Works with MP, DH, and DE samplers"
    ],

    applications: [
      "Hydraulic soil sampling—properly",
      "PTO-powered fieldwork with minimal swearing",
      "Tractor retrofits that make sense"
    ],

    howToUse: [
      "Attach to lift arms—tighten like you mean it",
      "Mount pump baseplate—don’t cross-thread",
      "Connect PTO and route hoses neatly",
      "Fit sampler, test, nod approvingly"
    ],



    technicalSpecs: {
      "Type": "Cat‑2/3 Tractor 3‑Point Hitch Frame",
      "Construction": "Welded heavy-duty A‑frame steel with epoxy finish",
      "PTO Compatibility": "Standard tractor PTO drives hydraulic pump",
      "Includes": "Lift bars, mounting bolts, and installation hardware",
      "Frame Size": "Fits 50–60\" lift arm spacing typical of compact tractors",
      "Corrosion Protection": "Durable black epoxy coating",
      "Weight": "Approx. 120 kg",
      "Certification": "Commercial-grade robustness for farm use",
      "Compatibility": (
        <>
          Works with all MP-series, DH, and DE soil sampling
          <br />
          machines
        </>
      )

    },

    gallery: [
    
    ],

    testimonials: [
      {
        quote: "Bolted right on, no surprises. Used it with our MP-2.60 — solid frame, everything fit, no rattling. Would buy again.",
        author: "J. Bauer",
        company: "Bauer Agrar GmbH",
        rating: 5
      },
      {
        quote: "Got it on the tractor in under an hour. PTO pump runs smooth, sampler mounts clean. Just works.",
        author: "L. Schneider",
        company: "Schneider Feldtechnik",
        rating: 5
      }
    ],



  },
  // Full conversion
  {
    id: 2003,
    date: 2025,
    name: "Full Conversion",
    nickname: "Conversion Kit",
    category: "accessory",
    bestseller: true,

    image: "",
    heroVideo: "",
    icon: "",

    specs: [
      "Compatible with pickups and UTVs",
      "Custom powder-coated steel frame with aluminium tool panels",
      "OEM parts removed and stored; frame TÜV-certified",
      "Supports all MP-series, DH, and DE soil samplers",
    ],

    priceValue: 2790,
    price: "From €4590",

    electric: false,
    manual: false,
    hydraulic: false,


    description:
      "Turns your utility vehicle or pickup into a no-nonsense soil sampling beast. Bed off, frame on, tools loaded.",

    herodescription: (
      <>
        <p>
          <strong>Full Conversion Kit</strong> replaces the standard truck bed or UTV platform with a custom steel frame and aluminium covers—purpose-built for soil sampling with <strong>MP-series, DH, and DE machines</strong>. TÜV-approved, road-legal, and rather clever.
        </p>
      </>
    ),

    detailedDescription: (
      <>
        <p className="mt-4">
          <strong>
            If your UTV or pickup dreams of greatness, this is its moment.
          </strong>{" "}
          We carefully remove the stock bed and replace them with a
          steel conversion frame, wrapped in aluminium panels that scream
          “professional operator” louder than a flat-out Hilux on gravel.
        </p>
        <p className="mt-4">
          <strong>
            It gives you proper mounting for all our machines, integrated
            storage for coolers, tools, lighting—basically everything but the
            packed lunch.
          </strong>{" "}
          Certified by TÜV, built for serious campaigns, and oddly satisfying
          to look at.
        </p>
      </>
    ),

    features: [
      "Universal fit for pickups and UTVs (Hilux, Gator, Kubota, etc.)",
      "Aluminium-covered steel frame: durable and corrosion-resistant",
      "Supports tool storage, lighting, coolers, and sampler systems",
      "TÜV-certified and road-legal in EU",
      "Fully compatible with all MP, DE, and DH machines"
    ],

    applications: [
      "Permanent field rig conversions",
      "Fleet builds for large-scale soil sampling",
      "Upgrades for agricultural and environmental research vehicles"
    ],

    howToUse: [
      "Select your sampling machine — MP-series, DH, or DE. Sensible choices, all of them.",
      "Ensure your vehicle has a hitch receiver or trailer coupling. If not, one can be arranged. We're not savages.",
      "Bring us the vehicle — or let us source a suitable model. ",
      "We fit the steel frame, bolt on the sampler, handle the paperwork, and send you off to do battle with soil."
    ],


    technicalSpecs: {
      "Compatible Vehicles": "Pickups (Hilux, Ranger, etc.) and UTVs (Gator,RTV, Ranger, etc.)",
      "Construction": "Steel frame, powder-coated. Aluminium boxes.",
      "Vehicle Requirements": "Standard hitch receiver or trailer coupling. Of course.",
      "Certification": "TÜV-approved. Naturally.",
      "OEM Parts": "Removed. Stored. Labelled. Very German.",
      "Sampler Compatibility": "MP-series, DH, DE.",
      "Frame Weight": "Approx. 110 kg.",
      "Price": "€4 590"
    }
    ,

    gallery: [
    

    ],

    testimonials: [
      {
        quote: "Dropped off the Hilux, picked it up a week later ready to sample. Clean build, everything fit right. No hassle.",
        author: "T. Klein",
        company: "GeoFarm Solutions",
        rating: 5
      },
      {
        quote: "Solid frame, smart layout. We run two DH units off converted Rangers — way easier than trailers in tight fields.",
        author: "M. Becker",
        company: "AgroTest GmbH",
        rating: 5
      }
    ],
  },
  //Trailers
  {
    id: 2004,
    date: 2025,
    name: "Special Trailers",
    nickname: "Field Haulers",
    category: "accessory",
    type: "Trailer",
    bestseller: true,

    image: "",
    heroVideo: "",
    icon: "",

    specs: [
      "Hot-dip galvanised—rust doesn’t stand a chance.",
      "Braked or non-braked options: choose your level of control",
      "Track width fixed at 1.35 m",
      "Designed to fit MP-series, DH, and DE samplers perfectly"
    ],

    priceValue: 3600,
    price: "From €3 600",

    electric: false,
    manual: false,
    hydraulic: false,

    description:
      "These trailers transport MP-series, DH/DE systems effortlessly across anything that isn't actually a wall.",

    herodescription: (
      <>
        <p>
          <strong>Special Trailers – Field Haulers</strong> are <strong>rugged, hot-dip galvanised trailers</strong> with both <strong>braked and non-braked options</strong>, designed to carry your soil sampling kit—be it <strong>MP, DH, or DE</strong>—through fields and farms with <strong>Germanic precision</strong>.
        </p>
        <p>
          They come with <strong>clever storage for tools, lights, and coolers</strong>—so you can work all day without the usual fuss.
        </p>
      </>
    ),

    detailedDescription: (
      <>
        <p className="mt-4">
          With a fixed <strong>1.35 m track width</strong> and <strong>jack-castor wheels</strong>, the Field Hauler maneuvers like a sensible shopping trolley—only with more steel and fewer weak points.
        </p>
        <p className="mt-4">
          Choose <strong>braked models</strong> for heavier loads or steeper inclines—up to <strong>3,500 kg GTW</strong>—so you can haul soil samplers without dreaming of new brake pads every trip.
        </p>
      </>
    ),

    features: [
      "Hot-dip galvanised body and chassis—long life, fewer complaints",
      "Braked and non-braked options—pick your handling style",
      "Single-axle with mechanical drum brakes for stable towing",
      "Shock absorbers for 100 km/h road approval—smooth ride, no rattling",
      "Track width 1.35 m with jack‑castor wheels included",
      "LT285/75 R16 aluminium rims or MT215/75 R15 steel—tread the fields, not flip over",
      "Support wheel included for easy hand maneuvering",
      "Built to haul MP-series, DH, and DE samplers—no IKEA instructions required",
      "Integrated tool, light, and cooler storage—work smarter, not harder"
    ],

    applications: [
      "Field transport of MP, DH, and DE sampler kits",
      "Hauling crates, coolboxes, and more across farms",
      "Light-duty environments, both rural and contracting sites"
    ],

    howToUse: [
      "Select braked or non-braked depending on your towing vehicle and load.",
      "Hitched with standard 50 mm ball coupling—no exotic engineering required.",
      "Load your sampler and kit, secure all straps and tie-downs.",
      "Tow it at sensible speeds—no drifting or unintended adventure."
    ],

    technicalSpecs: {
      "Track Width": "1.35 m",
      "Load Options": (
        <>
          550 kg (braked/non-braked), heavy‑duty upgrade to<br />
          1,500 kg GTW
        </>
      ),
      "Rims/Tyre Size": "LT285/75 R16 on aluminium rims or MT215/75 R15",
      "Brakes": (
        <>
          Mechanical drum brakes (braked version), single-axle<br />
          configuration
        </>),
      "Shock Absorbers": "Approved for 100 km/h towing",
      "Support Wheel": "Included",
      "Chassis": "Hot-dip galvanised steel, S235 rated",
      "Body Height": "1.2 m",
      "Trailer Weight": "Approx. 300 kg",
      "Lighting": "LED 12 V, road-legal lighting board",
      "Warranty": "12 months manufacturer warranty",
      "Price": "From €3 600"
    },

    gallery: [
   
    ],

    testimonials: [
      {
        quote: "A rugged, reliable machine with enough grunt to make fieldwork feel less like hard work.",
        author: "Tomás Herrera",
        company: "Precision Agriculture Co.",
        rating: 4
      }
    ]
  },

  ///3000
  // Power Packs
  {
    id: 3000,
    date: 2025,
    name: "Power Pack",
    nickname: "Independent Drive Units",
    category: "accessory",
    type: "Powerpack",
    bestseller: false,

    image: "",
    heroVideo: "",
    icon: "",

    specs: [
      "Hydraulic or electric powered to fit your power needs",
      "Portable, durable steel casing built for rough fieldwork",
      "LCD battery status on electric models—know your charge at a glance",
      "Return and suction filtration included for clean hydraulic operation"
    ],

    priceValue: 3450,
    price: "From €3,450",

    electric: true,
    manual: false,
    hydraulic: true,

    description:
      "For those running MP or DH units without onboard power, these packs deliver consistent hydraulic or electric energy wherever your work takes you.",

    herodescription: (
      <>
        <p>
          <strong>Power Packs</strong> are like the dependable butlers of soil sampling—offering <strong>reliable, portable power</strong> so your machines don’t throw a tantrum. Whether you fancy the <strong>classic hydraulic grunt</strong> or prefer the <strong>whisper-quiet electric charm</strong>, these packs have your back.
        </p>
        <p>
          Wrapped in a <strong>rugged steel casing</strong> tougher than your average tractor, with sensible perks like <strong>LCD battery status</strong> and <strong>filtration systems</strong>, they’re the trusty sidekick you never knew you needed out in the field.
        </p>
      </>
    ),

    detailedDescription: (
      <>
        <p className="mt-4">
          The hydraulic model, perfectly matched to <strong>MP-series</strong> and <strong>DH-series</strong> machines, boasts a <strong>13 HP gasoline engine</strong> and a <strong>22 L oil tank</strong>, pushing out <strong>135 bar pressure</strong> at <strong>20 L/min</strong>—that’s serious grunt for when you want to feel like a proper mechanical overlord.
        </p>
        <p className="mt-4">
          The electric cousin, designed specifically for the <strong>DE-series</strong>, sports a <strong>24 V / 100 Ah battery</strong>, a <strong>stainless steel suit of armour</strong>, and an <strong>LCD screen</strong> to keep an eye on its own power levels. Ideal for those who prefer a quieter, cleaner, and frankly more polite approach to soil sampling.
        </p>
        <p className="mt-4">
          Both models are <strong>portable</strong>, <strong>ruggedly built</strong>, and come with <strong>return/suction filtration</strong> to keep your precious hydraulics from choking on dirt—because nobody likes premature wear, do they?
        </p>
      </>
    ),



    features: [
      "Hydraulic or electric powered to suit your workflow",
      "Rugged steel casing with corrosion protection",
      "LCD battery status on electric models",
      "Return and suction filtration for hydraulic longevity",
      "Portable and easy to mount or transport"
    ],

    applications: [
      "Power source for MP-series and DH-series soil samplers",
      "Field operations requiring independent hydraulic or electric power",
      "Remote sampling locations without vehicle power supply"
    ],

    howToUse: [
      "Pick hydraulic or electric depending on how much oomph your sampler demands (and how fancy you feel).",
      "Bolt it on securely to your vehicle or trailer—no improvising with duct tape, please.",
      "Keep an eye on power levels via LCD (electric) or fuel/oil gauges (hydraulic)—because surprises are for birthday parties, not fieldwork.",
      "Top up oil and change filters regularly—treat it well, and it’ll keep your sampler humming like a charm."
    ],

    technicalSpecs: {
      "Hydraulic Model": "13 HP gasoline engine, 22 L oil tank, 135 bar pressure, 20 L/min flow, 12 V electrical system",
      "Electric Model": "24 V / 100 Ah battery, LCD status display, stainless steel enclosure",
      "Weight": "Approx. 65 kg (hydraulic), 48 kg (electric)",
      "Dimensions": "50 x 40 x 45 cm (HxWxD)",
      "Material": "Steel casing with corrosion protection",
      "Warranty": "12 months warranty on electrical components"
    },

    gallery: [
    
    ],

    testimonials: [
      {
        quote: "A rugged, reliable machine with enough grunt to make fieldwork feel less like hard work.",
        author: "Tomás Herrera",
        company: "Precision Agriculture Co.",
        rating: 4
      }
    ]
  }
  ,
  // Spare Parts
  {
    id: 3001,
    date: 2025,
    name: "Recommended Spare Parts",
    nickname: "The Lifesavers",
    category: "accessory",
    categoryName: "Extras",
    type: "Spare Parts",
    bestseller: true,

    image: "",
    heroVideo: "",
    icon: "",

    specs: [
      "Factory-approved spares for all models",
      "Critical components for high-wear and mission-critical assemblies",
      "Individually packaged, labelled, and field-service ready",
      "Backed by TechbyP’s reliability standards"
    ],

    priceValue: 450,
    price: "From €450",

    electric: true,
    manual: true,
    hydraulic: true,

    description:
      "Because nothing ruins a good day in the field like a broken fitting or a leaky seal. These are the official, recommended spare parts—hand-picked for your MP, DH, DE or BOPROB III machine, and ready to get you out of trouble before it starts.",

    herodescription: (
      <>
        <p>
          Think of these as the first-aid kit for your soil sampler. Whether you’re out in a bog in Bavaria or a dust bowl in Bulgaria, having the right <strong>OEM spare parts</strong> on hand turns a potential disaster into a smugly handled hiccup.
        </p>
        <p>
          Each kit includes the usual suspects—<strong>O-rings, hydraulic couplings, filters, belts</strong>, and the bits that quietly work the hardest. No improvising with baling wire or borrowed parts from your mate's combine.
        </p>
      </>
    ),

    detailedDescription: (
      <>
        <p className="mt-4">
          These are the <strong>recommended spare parts kits</strong> for the <strong>MP-series</strong>, <strong>DH-series</strong>, <strong>DE-series</strong>, and <strong>BOPROB III</strong> samplers. And no, they're not optional. They're what the engineers use. What the service techs use. What you should have in the toolbox if you're even slightly serious about uptime.
        </p>
        <p className="mt-4">
          Inside each kit, you’ll find the usual suspects—<strong>seals, filters, hydraulic fittings, relays, and pressure lines</strong>—the bits that keep the fluid where it’s supposed to be and the current flowing in the right direction. It's like carrying a spare pair of underpants on a long-haul flight: you hope you won’t need them, but you’ll be damn glad if you do.
        </p>
        <p className="mt-4">
          Parts are <strong>individually packaged and labelled</strong>, so you don’t spend half a day figuring out if that washer fits the return line or the oil filter. And of course, they're all <strong>factory-certified</strong> and designed to slot right in without any butchery.
        </p>
      </>
    ),

    features: [
      "Recommended spare parts for MP, DH, DE and BOPROB III soil samplers",
      "Includes critical wear components and emergency repair items",
      "Factory-approved for seamless compatibility",
      "Clearly labelled and packaged for field use",
      "Helps reduce downtime during critical sampling campaigns"
    ],

    applications: [
      "Field repairs and preventive maintenance on BPT soil samplers",
      "Keeping high-wear components in service-ready condition",
      "Avoiding project delays due to unavailable parts"
    ],

    howToUse: [
      "Keep one kit per machine—because nobody likes cannibalising parts from the unit you’re not using.",
      "Replace high-wear components according to service intervals or visible wear.",
      "Use only the labelled components for their intended locations (guessing is not heroic, it’s expensive).",
      "Restock your kit after use so you’re never caught without it twice."
    ],

    technicalSpecs: {
      "Compatibility": "MP-1.90, MP-2.60, MP-3.90, MP-4.100, MP-1.120, DH-series, DE-1.30, BOPROB III",
      "Included Parts": "Hydraulic couplings, filters, O-rings, solenoids, belts, relays, pressure lines (varies by kit)",
      "Packaging": "Individually bagged and labelled",
      "Shelf Life": "5 years in dry storage conditions",
      "Restock Options": "Individual parts available upon request"
    },

    gallery: [
    
    ],

    testimonials: [
      {
        quote: "I used to wing it with random parts—until I spent two hours in the mud rebuilding a valve with chewing gum. Never again.",
        author: "Elena Mihăilescu",
        company: "AgroTest România",
        rating: 5
      }
    ]
  },
  // Extras

  // Coolbox
  {
    id: 3002,
    date: 2025,
    name: "Coolbox 95L",
    nickname: "The Chiller",
    category: "accessory",
    categoryName: "Extras",
    type: "Compressor Cooler",
    bestseller: false,
    image: "", // Add image path or URL
    heroVideo: "", // Optional: Add promotional video URL
    icon: "", // Optional: Add small icon path
    specs: [
      "Dual-zone compressor cooling/freezing to -20°C",
      "Independent compartments with LED lighting",
      "Digital display, USB charging, and app control",
      "Works on 12/24 V DC or 230 V AC power"
    ],
    priceValue: 1000,
    price: "€1000",
    electric: true,
    manual: false,
    hydraulic: false,
    description: "Because sometimes your samples—or your beer—deserve better than lukewarm misery. With this 95L beast, you’re bringing a portable arctic tundra to the job site. Possibly overkill. But definitely brilliant.",
    herodescription: (
      <>
        <p>
          You know the feeling—you're halfway up a mountain, everything’s on schedule, and then someone opens the cooler to find... <strong>soup</strong>. Not anymore. <strong>The Chiller turns smug grins into icy relief</strong>, literally.
        </p>
        <p>
          It <strong>cools</strong>. It <strong>freezes</strong>. It <strong>glows</strong>. And yes, it has an <strong>app</strong>—because your phone isn’t smug enough already. German engineers might call this a <em>Kühlbox</em>. <strong>We call it “bringing the fridge, because we can.”</strong>
        </p>
      </>
    ),
    detailedDescription: (
      <>
        <p className="mt-4">
          The <strong>Coolbox 95L</strong> is, frankly, <strong>more capable than most hotel minibars</strong>. Dual compartments, each configurable as fridge or freezer, mean you can keep your sample kit on one side and lunch on the other—and still have room for <strong>smug satisfaction</strong>.
        </p>
        <p className="mt-4">
          It’s powered by a <strong>high-efficiency LG compressor</strong> (which is more than your car’s AC can say), and chills down to <strong>-20°C</strong> even when it's hot enough to fry an egg on the roof rack. Use it via the control panel or the <strong>Alpicool app</strong> if you’re the sort of person who controls their fridge from a hammock.
        </p>
        <p className="mt-4">
          For extended autonomy, pair it with the <strong>optional battery</strong> (not included), giving you <strong>4 to 24 hours</strong> of standalone cooling. Or plug it into the vehicle and <strong>never worry again</strong>. It’s built to take a beating—<strong>though we advise against that, obviously.</strong>
        </p>
      </>
    ),

    features: [
      "Dual compartments can cool or freeze independently",
      "Digital display with touch controls and mobile app",
      "Built-in LED lighting and USB charging port",
      "Lids open from both sides for maximum faffing potential",
      "Runs on 12/24 V DC or 110–240 V AC"
    ],
    applications: [
      "Transporting temperature-sensitive samples in hot climates",
      "Multi-day expeditions without sacrificing cold beverages",
      "Keeping gel packs and specimens within lab-compliant temperatures",
      "Emergency beer preservation at remote job sites"
    ],
    howToUse: [
      "Plug into vehicle or AC power before loading",
      "Set target temperatures via the control panel or app",
      "Use compartments as fridge-freezer, fridge-fridge, or freezer-freezer",
      "Load samples upright, and avoid overstuffing (yes, we know you will anyway)",
      "Clean regularly unless you're conducting a microbial growth study"
    ],
    technicalSpecs: {
      Capacity: "95 L",
      TemperatureRange: "-20°C to +10°C",
      PowerSupply: "12/24 V DC or 110–240 V AC",
      PowerConsumption: "6 A (12 V) / 3 A (24 V) ≈ 0.3 kWh/24h",
      ExternalDimensions: "826 × 528 × 465 mm (+25 mm handle clearance)",
      InternalConfiguration: "2 LED-lit compartments with individual lids",
      Weight: "24 kg (dry weight)"
    },
    gallery: [
     
    ], // Add image URLs
    testimonials: [] // Add user reviews if available
  },


  // LED Light Kit
  {
    id: 3003,
    date: 2025,
    name: "LED Work Light 1700",
    nickname: "The Midnight Sun",
    category: "accessory",
    categoryName: "Extras",
    type: "Lighting",
    bestseller: false,
    image: "", // Add product image path
    heroVideo: "", // Optional
    icon: "", // Optional
    specs: [
      "Pivot-mounted LED work light for near-field illumination",
      "Blinding 1700 lumen output from 4 LEDs",
      "Durable aluminum housing, IP6K9K rated",
      "Compatible with 12–24 V DC systems"
    ],
    priceValue: 67,
    price: "€67",
    electric: true,
    manual: false,
    hydraulic: false,
    description: "Darkness is no excuse. With 1700 lumenspacked into a compact, armored unit, this LED work light is what happens when you cross a headlamp with a small sun. Whether you're mid-sample or mid-swear word, you'll see everything—clearly.",
    herodescription: (
      <>
        <p><strong>Sampling in the dark? Forgot the sun?</strong> No problem. The Midnight Sun delivers <strong>seriously powerful illumination</strong> without the heat, the noise, or the diesel bill.</p>
        <p>Mount it, point it, fire it up—then wonder how you ever lived without it. It’s not romantic lighting. It’s <strong>get-the-job-done lighting</strong>.</p>
      </>
    ),
    detailedDescription: (
      <>
        <p className="mt-4">
          The <strong>LED Work Light 1700</strong> is a <strong>field-tested, no-nonsense luminaire</strong> designed to cut through darkness like a chainsaw through butter. With a brutal <strong>1700 lumen output</strong>, it delivers focused near-field lighting for sampling rigs, machinery, or any situation where “I think I see something” isn’t good enough.
        </p>
        <p className="mt-4">
          Built with a <strong>black anodized aluminum housing</strong> and meeting <strong>IP6K7 and IP6K9K standards</strong>, this unit shrugs off water jets, dust storms, and probably most of your mistakes. A <strong>pivoting bracket</strong> allows precise aiming, while the <strong>patterned lens</strong> keeps the beam wide and usable.
        </p>
        <p className="mt-4">
          Compatible with <strong>12–24 V DC</strong> systems, the light draws 24 W and comes with open cable ends for easy integration. Assembly by qualified personnel is required—<strong>because melting wires is less funny in real life</strong>.
        </p>
      </>
    ),
    features: [
      "1700 lumen output from 4 high-intensity LEDs",
      "Pivoting bracket for precise aiming",
      "IP6K9K and IP6K7 ingress protection",
      "Patterned lens for near-field spread",
      "Compact and rugged aluminum housing"
    ],
    applications: [
      "Night-time drilling and soil sampling",
      "Equipment lighting on rigs and trailers",
      "Work zones in tunnels, forests, or 'middle of nowhere'",
      "Emergency repair lighting"
    ],
    howToUse: [
      "Mount securely using included pivot bracket",
      "Wire into 12 or 24 V DC supply (assembly by qualified personnel)",
      "Aim beam toward work zone",
      "Avoid staring directly into it unless you enjoy retinal regret"
    ],
    technicalSpecs: {
      Voltage: "12/24 V DC",
      PowerConsumption: "24 W",
      LuminousFlux: "1700 lm",
      ColorTemperature: "5700 K",
      NumberOfLEDs: "4",
      LightDistribution: "Near-field illumination",
      Mounting: "Pivoting mounting bracket",
      PlugType: "Open cable ends",
      CableLength: "800 mm",
      IngressProtection: "IP6K7 / IP6K9K",
      Housing: "Aluminum, black finish",
      Dimensions: "75 mm (H) × 98 mm (W) × 41 mm (D)",
      Diameter: "75 mm",
      Certification: "ECE R10 compliant"
    },
    gallery: [
    ], // Add product images
    testimonials: []
  },

  // External Camera
  {
    id: 3004,
    date: 2025,
    name: "External Camera",
    nickname: "The Watchtower",
    category: "accessory",
    categoryName: "Extras",
    type: "Monitoring",
    bestseller: false,
    image: "", // Add image path
    heroVideo: "", // Optional
    icon: "", // Optional
    specs: [
      "5MP 4G camera for soil sampling rigs",
      "Mounts directly to your machine frame",
      "Live video feed to your mobile or tablet via app",
      "75° field of view with IR night vision up to 15 m"
    ],
    priceValue: 225,
    price: "€225",
    electric: true,
    manual: false,
    hydraulic: false,
    description: "Why guess what’s going on behind the rig when you can watch it happen in real time. The Watchtower mounts to your machine and streams live footage straight to your cab. No cables. No blind spots. No surprises.",
    herodescription: (
      <>
        <p><strong>Ever tried reversing your rig blind with a 3-ton sampler on the back?</strong> Not ideal. The Watchtower gives you <strong>eyes on the drill</strong>—from the comfort of your driver's seat. Monitor every move, strike, and wobble.</p>
        <p>Connect via 4G. View from your phone. <strong>Because being in two places at once is now technically possible.</strong></p>
      </>
    ),
    detailedDescription: (
      <>
        <p className="mt-4">
          <strong>The Watchtower</strong> is a <strong>field-ready 5MP camera</strong> built for mounting directly to your soil sampling machine. Once installed, it streams live video to your tablet or phone using 4G—so you can see what's happening at the back of the rig without leaving your seat (or shouting across a muddy field).
        </p>
        <p className="mt-4">
          Its <strong>75° viewing angle</strong> gives full visibility of the sampling head, while <strong>infrared night vision</strong> extends that confidence well into the dusk. Whether you're checking alignment, confirming core drop, or just admiring your drilling skills, it’s all visible in real time.
        </p>
        <p className="mt-4">
          The app is free, the setup takes minutes, and there’s no need for local Wi-Fi. With an optional micro SD card (up to 128 GB), you can even <strong>record operations for documentation or training</strong>. Setup is plug-and-play, with one important caveat: <strong>insert the SIM card properly or spend the afternoon diagnosing your own impatience</strong>.
        </p>
        <p className="mt-4">
          It’s rainproof, mud-proof, and stubbornly reliable—exactly what you want from something bolted to a vibrating machine in the middle of nowhere.
        </p>
      </>
    ),
    features: [
      "Live video streaming over 4G network",
      "75° fixed-angle lens with night vision",
      "Mounts directly to TechByp sampling machines",
      "App control with image adjustment (WDR, BLC, etc.)",
      "Optional onboard recording via micro SD"
    ],
    applications: [
      "Monitoring soil sampling operations from inside the vehicle",
      "Live alignment checks during drilling",
      "Operator training and video documentation",
      "Avoiding blind drilling and unexpected surprises"
    ],
    howToUse: [
      "Mount securely to machine using bracket",
      "Insert SIM card and optional SD card",
      "Connect to 12V power supply on the rig",
      "Launch app to stream live feed from camera",
      "Wipe clean occasionally—but only when unplugged!"
    ],
    technicalSpecs: {
      Resolution: "5 MP",
      Transmission: "4G LTE",
      IRIllumination: "Yes, up to 15 m",
      ViewingAngle: "75°",
      PanTilt: "No (fixed lens)",
      Audio: "Yes",
      ControlViaApp: "Yes (iOS/Android)",
      SDCardSlot: "Yes, up to 128 GB",
      PowerSupply: "12V DC",
      HousingType: "Mini camera, rugged body",
      Mounting: "Screw/pivot mount (included)",
      Dimensions: "80 mm (W) × 45 mm (H) × 80 mm (D)",
      IngressProtection: "Weatherproof for outdoor mounting",


    },
    gallery: [
    
    ], // Add machine-mount images
    testimonials: []
  },

  ///4000

  // Probes, Dipsticks and Accessories

  {
    id: 4000,
    date: 2025,
    name: "Probes, Dipsticks and Accessories",
    nickname: "The N-min Purist",
    category: "manual",
    categoryName: "Manual Samplers",
    type: "DrillRod",
    bestseller: true,
    image: "",
    heroVideo: "",
    icon: Drill,
    specs: [
      "Tool steel construction (HRC 52)",
      "Conical taper profile (40→38 mm / 35→33 mm / 30→28 mm)",
      "Laser-etched depth markings every 10 cm",
      "Compatible with N-min sampling protocols (VDLUFA, ISO 14255)"
    ],
    priceValue: 150,
    price: "Price on request",
    electric: false,
    manual: true,
    hydraulic: false,
    description: "The gold standard for manual N-min sampling—precision-engineered, tapered drill rods built for hard soils and lab-grade accuracy.",
    herodescription: (
      <>
        <p>
          Not just any rods—these are <strong>razor-sharp, tool steel scalpels</strong> for the soil aficionado who demands precision. Their tapered design means less fuss, less friction, and those <strong>laser-etched 10 cm marks</strong>? Perfect for knowing exactly how deep you’ve poked—because soil layers don’t like to be disturbed, and neither should you.
        </p>
      </>
    ),
    detailedDescription: (
      <>
        <p className="mt-4">
          Designed for those who take soil seriously (and themselves, a little less): three slick tapered sizes—<strong>40→38 mm</strong> for 0-30 cm, <strong>35→33 mm</strong> for 30-60 cm, and <strong>30→28 mm</strong> for 60-90 cm—cut through stubborn clay and gravel like a hot knife through butter, thanks to pre-broken edges ready to do the hard work for you.
        </p>
        <p className="mt-4">
          Each rod sports <strong>laser-etched 10 cm increments</strong> that won’t fade faster than your enthusiasm on a Monday morning. Pair them with toggles (Items 1030/1031) for easy lifting, and a chisel (Item 1051) to strip samples clean—because sampling should feel like a gentle nudge, not an arm wrestle.
        </p>
      </>
    ),

    features: [
      "Three tapered diameters minimize friction and maximize sampling ease",
      "HRC 52 hardened tool steel for durability and strength",
      "Laser-etched depth markings every 10 cm for precise sampling",
      "Pre-broken cutting edges for consistent, clean penetration",
      "Compatible with toggle handles and chisels for efficient sample extraction"
    ],
    applications: [
      "N-min nitrate profiling",
      "Academic and commercial soil research",
      "Manual sampling in hard, stony, or clay-heavy soils"
    ],
    howToUse: [
      "Choose rod diameter based on desired sample depth",
      "Rotate the rod while applying downward pressure; taper does the heavy lifting",
      "Use toggle handles (Items 1030 or 1031) to extract the rod smoothly",
      "Clean soil residues with the chisel (Item 1051) to maintain groove integrity between samples"
    ],
    technicalSpecs: {
      "Material": "Tool steel (HRC 52)",
      "Taper": "40→38 mm / 35→33 mm / 30→28 mm",
      "Markings": "Laser-etched every 10 cm",
      "Compatibility": "N-min protocols (VDLUFA, ISO 14255)",
      "Weight": "Approx. 2.1 kg per meter (40 mm diameter rod)"
    },
    table: [
      { emNo: "1001", articleName: "Boring bar, effective length 1000 mm, total length 1150 mm, groove 18 mm, conical, round" },
      { emNo: "1001.2", articleName: "Boring bar, usable length 1000 mm, total length 1150 mm, groove 18 mm, conical, round with markings in 10 cm sections and broken cutting edges" },
      { emNo: "1003", articleName: "Boring bar, effective length 1200 mm, total length 1350 mm, groove 18 mm, conical, round" },
      { emNo: "1005", articleName: "Boring bar, effective length 1500 mm, total length 1650 mm, groove 18 mm, conical, round" },
      { emNo: "1030", articleName: "Toggle for lifting and emptying the drill rod, length 300 mm" },
      { emNo: "1031", articleName: "Toggle for lifting and emptying the drill rod, length 600 mm" },
      { emNo: "1040", articleName: "1 set of sampling probes (N-min drill bit set) for three depths. Each drill bit consists of the actual sampling probe, an extension, and the impact head with a cross-bore.\n(0-30 cm Ø 40-38 mm, 30-60 cm Ø 35-33 mm, 60-90 cm Ø 30-28 mm). All parts tool steel, developed for hard soils." },
      { emNo: "1041", articleName: "Probe, useful length 0-30 cm, outer diameter 40-38 mm, conical" },
      { emNo: "1042", articleName: "Extension for the 0-30 cm probe" },
      { emNo: "1043", articleName: "Probe, usable length 30-60 cm, outer diameter 35-33 mm, conical" },
      { emNo: "1044", articleName: "Extension for the 30-60 cm probe" },
      { emNo: "1045", articleName: "Probe, usable length 60-90 cm, outer diameter 30-28 mm, conical" },
      { emNo: "1046", articleName: "Extension for the 60-90 cm probe" },
      { emNo: "1049", articleName: "Impact head with cross hole" },
      { emNo: "1050", articleName: "Dial rod with shrink-fitted impact head for taking soil samples up to 2 m deep, Ø 15 mm, 8x8 groove. Used with NL 1000 percussion drill rod (Art. No. 1001)." },
      { emNo: "1051", articleName: "Chisel for stripping and removing the soil sample, 18 mm, round" },
      { emNo: "1052", articleName: "Chisel for stripping and removing the soil sample, 15 mm, round" },
      { emNo: "1053", articleName: "Chisel for stripping and removing the soil sample, 14 mm, square" },
      { emNo: "1054", articleName: "Chisel for stripping and removing the soil sample, 8 mm, square" },
      { emNo: "1055", articleName: "Chisel for stripping and removing the soil sample, 12 mm, square" },
      { emNo: "1060", articleName: "Impact-lifting combination for impact drill rods and 2 m long dipsticks (square hammer, pull hook, and pull ring). Hammer impact surface 135 x 135 mm, 200 mm long, weight approx. 4300 g." },
      { emNo: "1061", articleName: "Square hammer complete" },
      { emNo: "1064", articleName: "drawing ring" },
      { emNo: "1065", articleName: "Pulling hook" },
      { emNo: "1085", articleName: "Stainless steel soil probe for locating soil compaction and soil layers. Effective length 1000 mm with markings at 100 mm intervals, 8 mm diameter." }
    ],
    gallery: [


    ],
    testimonials: [
      {
        quote: "We've used these rods for 15 years—still the most reliable tool for N-min work. The taper makes all the difference in clay.",
        author: "Dr. Lena Bauer",
        company: "AgroLab Germany",
        rating: 5
      }
    ]
  },
  // Drill Rods
  {
    id: 4001,
    date: 2025,
    name: "Drill Rods Ø22 mm for Normal Soil Profiles",
    nickname: "The Deep Opener",
    category: "manual",
    categoryName: "Manual Samplers",
    type: "DrillRod",
    bestseller: false,
    image: "",  // you can replace with actual image variable if available
    heroVideo: "",
    icon: null,   // add icon if you have one
    specs: [
      "Drilling groove Ø 22 mm, total length 1100 mm, usable length 1000 mm",
      "12 mm groove for holding soil samples",
      "Extensions 1000 mm long with 5/8” internal thread on both sides",


      "Includes special wrenches for tightening",

    ],
    priceValue: null,
    price: "Price on request",
    electric: false,
    manual: true,
    hydraulic: false,
    description: "Robust drill rods (Ø 22 mm) designed to open normal soil profiles up to 10 m depth with modular, interchangeable parts for flexible length adjustment.",
    herodescription: (
      <>
        <p>
          Meet the <strong>modular drill rods</strong> with a neat <strong>22 mm drilling groove</strong>, built to tackle soil profiles up to a serious <strong>10 meters deep</strong>. Thanks to connecting bolts, you can adjust the length faster than you can say “Bob’s your uncle,” and the striking heads handle everything—from the casual tap to the full machine punch.
        </p>
      </>
    ),
    detailedDescription: (
      <>
        <p className="mt-4">
          Each section is a solid <strong>1000 mm of engineering precision</strong>, sporting a <strong>12 mm groove</strong> to keep your soil samples firmly in place while you pull them up from the depths. Extensions screw on easily with <strong>5/8” internal threads</strong>—because sometimes, more is just more.
        </p>
        <p className="mt-4">
          Tighten with special <strong>SW 18 wrenches</strong>—no slipping, no drama. For the grand finale, pick your weapon: a <strong>jack lifter with clamping chain</strong> or a <strong>one-arm puller with a ball clamp</strong>, both designed to get the job done safely and without breaking a sweat.
        </p>
      </>
    ),


    features: [
      "Ø 22 mm drilling groove with 12 mm soil sample groove",
      "Modular design with interchangeable parts bolted together",
      "1000 mm usable length per rod section",
      "Special striking heads for hand hammer or machine use",
      "Special wrenches for secure tightening",
      "Lifting devices for easy rod extraction"
    ],
    applications: [
      "Opening normal soil profiles up to 10 meters depth",
      "Manual soil sampling in non-rocky soils",
      "Flexible rod length adjustment for variable depth sampling"
    ],
    howToUse: [
      "Assemble rods and extensions to required length using connecting bolts",
      "Use appropriate striking head with hand hammer or machine",
      "Tighten rod sections using special wrenches (SW 18)",
      "Extract rods using jack lifting device with clamp chain or one-arm puller with ball clamp"
    ],
    technicalSpecs: {
      "Diameter": "22 mm",
      "Groove width": "12 mm",
      "Rod length": "Total 1100 mm, usable 1000 mm",
      "Extension length": "1000 mm with 5/8” internal thread",
      "Thread size": "5/8\" internal and external threads",
      "Recommended tools": "Special wrenches SW 18",
      "Lifting devices": "Jack with lifting bar and clamping chain, one-arm puller with integrated ball clamp"
    },
    table: [
      { emNo: "1100", articleName: "Drill groove Ø 22 mm, NL 1000 mm, groove 12 mm" },
      { emNo: "1101", articleName: "Extension with 5/8\" internal thread" },
      { emNo: "1102", articleName: "Connecting bolt, 5/8\" external thread SW 18" },
      { emNo: "1103", articleName: "Special wrench SW 18" },
      { emNo: "1049", articleName: "Impact head for hand probing" },
      { emNo: "1110", articleName: "Jack with lifting bar (short)" },
      { emNo: "1111", articleName: "Lifting bar (long)" },
      { emNo: "1112", articleName: "Clamp frog" },
      { emNo: "1113", articleName: "Clamp chain" },
      { emNo: "1120", articleName: "One-arm puller with integrated ball clamp" },
      { emNo: "1125", articleName: "Single-arm puller for probes and rods Ø 32-65 mm, lifting tube Ø 44 mm x 1500 mm, lifting capacity approx. 4 t" },
      { emNo: "1126", articleName: "Jaw clamp" },
      { emNo: "645250", articleName: "Wooden field book frame, size DIN A4, weight 0.6 kg" },
      { emNo: "645242", articleName: "Field book frame made of plastic, size DIN A4, weight 0.4 kg" },
      { emNo: "645245", articleName: "Wooden field book frame, size DIN A3, weight 0.9 kg" },
      { emNo: "645260", articleName: "Field book frame made of plastic, size DIN A3, weight 0.7 kg" }
    ],
    gallery: [],
    testimonials: []
  },
  // Hammers
  {
    id: 4003,
    date: 2025,
    name: "Hammer Selection & Accessories",
    nickname: "The Right Hammer for Every Job",
    category: "manual",
    categoryName: "Manual Tools",
    type: "HammerSet",
    bestseller: false,
    image: "",
    heroVideo: "",
    icon: null,
    specs: [
      "Variety of hammers with impact surfaces from 80 mm Ø to 150 mm square",
      "Soft-face and nylon hammers with malleable cast iron housing",
      "Handles made of wood or hickory with various lengths",
      "Interchangeable hammer heads and inserts",

    ],
    priceValue: 231,
    price: "Price on request",
    electric: false,
    manual: true,
    hydraulic: false,
    description: "Every hammer’s a hero in its own right. Pick the one that fits your soil-sampling saga and don’t forget the trusty sidekicks—our accessories.",

    herodescription: (
      <>
        <p>
          From the <strong>solid, no-nonsense square hammer</strong> to the <strong>gentle touch of a nylon soft-face</strong>, we’ve got the tools to make your soil sampling <strong>less grunt, more finesse</strong>. Choose wisely—<strong>precision, power, and comfort</strong> await.
        </p>
      </>
    ),

    detailedDescription: (
      <>
        <p className="mt-4">
          Need to channel your inner Thor with a hefty <strong>4.3 kg square hammer</strong> boasting a <strong>135x135 mm impact surface</strong>? Or perhaps a <strong>featherlight nylon soft-face hammer</strong> to coax the soil with subtlety? Either way, <strong>your wish is our command</strong>.
        </p>
        <p className="mt-4">
          Fancy a bit of DIY flair? <strong>Swap heads like a chef changes knives</strong>, pick from <strong>wooden or hickory handles of all lengths</strong>, and top it off with <strong>inserts as tough or gentle as you like</strong>. It’s like a bespoke suit—only for your hammer.
        </p>
      </>
    ),

    features: [
      "Square hammer with 135x135 mm impact surface, 4.3 kg",
      "Round plastic hammer with 150 mm Ø impact surface",
      "Soft-face hammers with malleable cast iron housing",
      "Nylon soft-face hammer variants",
      "Interchangeable hammer heads and inserts",
      "Wooden and hickory handles of varying lengths",

    ],
    applications: [
      "Manual soil sampling requiring precise impact force",
      "Protection of delicate soil structures with soft-face hammers",
      "Versatile hammer selection for different sampling equipment"
    ],
    howToUse: [
      "Select hammer type according to soil hardness and sampling method",
      "Use appropriate handle length for leverage and comfort",
      "Replace hammer heads or inserts as needed for optimal performance",
      "Maintain wooden handles and tighten screws regularly"
    ],
    technicalSpecs: {
      "Square hammer": "Impact surface 135x135 mm, head length 200 mm, weight 4.3 kg",
      "Round plastic hammer": "Impact surface 150 mm Ø, head length 200 mm, weight 4.3 kg",
      "Soft-face hammer": "Impact surface 80-125 mm Ø, wooden handle, weight 2.9 - 6.7 kg",
      "Nylon soft-face hammer": "Impact surface 80 mm Ø, wooden handle, weight 3.0 - 3.2 kg",
      "Handles": "Wooden and hickory, lengths 395 mm to 900 mm",
      "Inserts": "Superplastic and nylon, various diameters",
      "Screws": "Allen screw with nut for soft-face hammer sizes 80 and 100 mm Ø"
    },
    table: [
      { emNo: "1061", articleName: "Square hammer, impact surface 135x135 mm, head length: 200 mm, weight 4.3 kg" },
      { emNo: "1062", articleName: "Hammer head for square hammer (Art. No. 1061)" },
      { emNo: "1063", articleName: "Handle for the square hammer with screw" },
      { emNo: "1070", articleName: "Round plastic hammer, impact surface 150 mm Ø, head length: 200 mm, weight 4.3 kg" },
      { emNo: "1071", articleName: "Hammer head for round plastic hammer (Art. No. 1070)" },
      { emNo: "1072", articleName: "Hammer handle for round plastic hammer (Art. No. 1070)" },
      { emNo: "3007.080", articleName: "Soft-face hammer made of superplastic with malleable cast iron housing and wooden handle, impact surface 80 mm Ø, length 490 mm, weight approx. 2,930 g" },
      { emNo: "3007.081", articleName: "Soft-face hammer made of superplastic with malleable cast iron housing and wooden handle, impact surface 80 mm Ø, length 800 mm, weight approx. 3,240 g" },
      { emNo: "3007.100", articleName: "Soft-face hammer made of superplastic with malleable cast iron housing and wooden handle, impact surface 100 mm Ø, length 1000 mm, weight approx. 5,300 g" },
      { emNo: "3007.125", articleName: "Soft-face hammer made of superplastic with malleable cast iron housing and wooden handle, impact surface 125 mm Ø, length 1040 mm, weight approx. 6,700 g" },
      { emNo: "3008.080", articleName: "Nylon soft-face hammer with malleable cast iron housing and wooden handle, impact surface 80 mm Ø, length 490 mm, weight approx. 3,090 g" },
      { emNo: "3008.081", articleName: "Nylon soft-face hammer with malleable cast iron housing and wooden handle, impact surface 80 mm Ø, length 700 mm, weight approx. 3,240 g" },
      { emNo: "3207.080", articleName: "Insert for the soft-face hammer, super plastic 80 mm Ø" },
      { emNo: "3207.100", articleName: "Insert for the soft-face hammer, super plastic 100 mm Ø" },
      { emNo: "3207.125", articleName: "Insert for the soft-face hammer, super plastic 125 mm Ø" },
      { emNo: "3208.080", articleName: "Insert for the soft-face hammer, nylon 80 mm Ø" },
      { emNo: "3244.080", articleName: "Hickory handle for hammer 80 mm Ø, handle length 395 mm" },
      { emNo: "3244.081", articleName: "Hickory handle for hammer 80 mm Ø, handle length 700 mm" },
      { emNo: "3244.100", articleName: "Hickory handle for hammer 100 mm Ø, handle length 900 mm" },
      { emNo: "3244.125", articleName: "Hickory handle for hammer 125 mm Ø, handle length 900 mm" },
      { emNo: "3299.080", articleName: "Allen screw with nut for soft-face hammer 80 mm Ø" },
      { emNo: "3299.100", articleName: "Allen screw with nut for soft-face hammer 100 mm Ø" }
    ],
    gallery: [],
    testimonials: []
  },
{
  id: 5001,
  date: 2025,
  name: "Göttinger Soil Corers",
  nickname: "Precision Sampling Made Effortless",
  category: "manual",
  categoryName: "Manual Tools",
  type: "GoettingerDrillSet",
  bestseller: false,
  image: "",
  heroVideo: "",
  icon: null,
  specs: [
    "Designed for Nmin sampling down to 90 cm",
    "Manual operation—no extra tools required",
    "Specially hardened steel groove ensures minimal friction",
    "Three interlocking drill diameters optimize insertion and extraction"
  ],
  priceValue: undefined,
  price: "Price on request",
  electric: false,
  manual: true,
  hydraulic: false,
  description: "Who needs a gym membership when you have the Göttinger Soil Corers? One person, a light 2.5 kg tool, and you’re ready to conquer the soil—without leaving a trace on the field or terrorizing any buried cables.",
  herodescription: (
    <>
      <p>
        From the <strong>delicate clay</strong> to <strong>lightly compacted sand</strong>, these corers slice through with <strong>minimal fuss</strong>. Three perfectly calibrated drill layers, <strong>cushioned handles</strong>, and a clever <strong>fräs profile</strong> make sampling feel less like work and more like wizardry.
      </p>
    </>
  ),
  detailedDescription: (
    <>
      <p className="mt-4">
        Single-handed operation, <strong>no heavy machinery</strong>, <strong>no extra helpers</strong>, just you and the earth. The Göttinger drills separate <strong>three soil layers</strong> with precision, giving you reliable N-min samples weighing <strong>500–1000g</strong> from <strong>16 parallel strikes per depth section</strong>.
      </p>
      <p className="mt-4">
        Caution: these are champions of <strong>gentle soils</strong>. <strong>Rocky, bone-dry, or tightly packed sand</strong> might push their patience. But in ideal conditions, it’s as close as you’ll get to a <strong>soil-sampling magic wand</strong>.
      </p>
    </>
  ),
  features: [
    "Single-person operation",
    "Lightweight at just ~2.5 kg",
    "Higher efficiency than conventional hand tools",
    "Zero field damage—no crushing crops",
    "Safe for drains, cables, and underground lines",
    "Works even in wet soils",
    "Exact 3-layer separation for N-min samples",
    "Improved grip comfort thanks to reinforced handle padding"
  ],
  applications: [
    "Manual Nmin soil sampling in light soils",
    "Field conditions where machinery cannot be used",
    "Reliable layer separation for precise analysis"
  ],
  howToUse: [
    "Insert the corer by hand into the soil",
    "Pull out carefully to collect the sample",
    "Repeat 16 parallel strikes per depth section for reliable results",
    "Avoid rocky or overly compacted soils"
  ],
  technicalSpecs: {
    "0-30 cm corer": "Diameter 18 mm, groove 14 mm",
    "30-60 cm corer": "Diameter 16 mm, groove 12 mm",
    "60-90 cm corer": "Diameter 14 mm, groove 10 mm",
    "Complete set": "Includes one corer for each depth section (0-30 cm, 30-60 cm, 60-90 cm)"
  },
  table: [
    { emNo: "5001", articleName: "Göttinger corer (0-30 cm), Ø 18 mm, groove 14 mm" },
    { emNo: "5002", articleName: "Göttinger corer (30-60 cm), Ø 16 mm, groove 12 mm" },
    { emNo: "5003", articleName: "Göttinger corer (60-90 cm), Ø 14 mm, groove 10 mm" },
    { emNo: "5004", articleName: "Complete Göttinger corer set, including all three depth sections" }
  ],
  gallery: [],
  testimonials: []
}

  



];



export const getProductsByCategory = (category: string) => {
  if (category === "All Products") return products;
  return products.filter(product => product.category === category);
};

export const getProductById = (id: number) => {
  return products.find(product => product.id === id);
};