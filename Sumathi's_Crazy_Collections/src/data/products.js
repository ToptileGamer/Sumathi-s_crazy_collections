import mc4 from "../assets/bracelets/mc4.png";
import pwwb from "../assets/bracelets/pwwb.png";
import wbb7 from "../assets/Earings/wbb7.png";
import fpgb from "../assets/bracelets/fpgb.png";
import pwws from "../assets/bracelets/pwws.png";
import pwgb4 from "../assets/bracelets/pwgb4.png";
import resize from "../assets/bracelets/resize.png";
import resized from "../assets/bracelets/resized.png";
import twob_twow from "../assets/bracelets/twob_twow.png";
import bw_alternative from "../assets/bracelets/bw_alternative.png";
import threeBoneonewhite from "../assets/bracelets/threeBoneonewhite.png";
import bluewhite_panda from "../assets/bracelets/bluewhite_panda.png";
import baby_pink from "../assets/Earings/baby_pink.png";
import gb from "../assets/Earings/gb.png";
import golden_rose from "../assets/Earings/golden_rose.png";
import pale_greenB from "../assets/Earings/pale_greenB.png";
import ps from "../assets/Earings/ps.png";
import yb from "../assets/Earings/yb.png";
import silver_S from "../assets/Earings/silver_S.png";
import white_perl from "../assets/Earings/white_perl.png";
import red_butterfly from "../assets/Earings/red_butterfly.png";

const formatPrice = (value) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const buildProduct = (product) => ({
  ...product,
  displayPrice: formatPrice(product.price),
});

const bracelets = [
  buildProduct({
    slug: "multi-color-pack-4",
    name: "Multi-Color (pack of 4)",
    image: mc4,
    price: 450,
    rating: 4.8,
    reviews: 128,
    category: "Bracelets",
    description: "Colorful pack of 4 bracelets for casual and festive wear.",
    tags: ["colorful", "festive", "gift"],
  }),
  buildProduct({
    slug: "black-white-pack-6",
    name: "Black-white (pack of 6)",
    image: wbb7,
    price: 399,
    rating: 4.6,
    reviews: 92,
    category: "Bracelets",
    description: "Classic black and white bracelet set of 6.",
    tags: ["classic", "minimal"],
  }),
  buildProduct({
    slug: "pink-with-white-bow",
    name: "Pink with White Bow",
    image: pwwb,
    price: 350,
    rating: 4.9,
    reviews: 211,
    category: "Bracelets",
    description: "Elegant pink bracelet with a cute white bow.",
    tags: ["cute", "gift"],
  }),
  buildProduct({
    slug: "pink-with-white-star",
    name: "Pink with White Star",
    image: pwws,
    price: 349,
    rating: 4.5,
    reviews: 87,
    category: "Bracelets",
    description: "Trendy pink bracelet featuring a white star charm.",
    tags: ["trendy", "sparkle"],
  }),
  buildProduct({
    slug: "pink-with-golden-bead",
    name: "Pink with Golden Bead",
    image: fpgb,
    price: 360,
    rating: 4.4,
    reviews: 76,
    category: "Bracelets",
    description: "Stylish bracelet with a golden bead on pink thread.",
    tags: ["gold", "minimal"],
  }),
  buildProduct({
    slug: "pastel-bracelets-set",
    name: "Bracelets",
    image: pwgb4,
    price: 399,
    rating: 4.7,
    reviews: 139,
    category: "Bracelets",
    description: "A charming bracelet set perfect for any occasion.",
    tags: ["pastel", "gift"],
  }),
  buildProduct({
    slug: "black-with-silver-butterfly",
    name: "Black with Silver Butterfly",
    image: resize,
    price: 299,
    rating: 4.3,
    reviews: 64,
    category: "Bracelets",
    description: "Adjustable bracelet design with unique flair.",
    tags: ["butterfly", "statement"],
  }),
  buildProduct({
    slug: "pink-blue-alternative",
    name: "Pink & Blue alternative",
    image: resized,
    price: 299,
    rating: 4.4,
    reviews: 59,
    category: "Bracelets",
    description: "Same great style, now in a resized version.",
    tags: ["casual", "color"],
  }),
  buildProduct({
    slug: "two-white-two-black",
    name: "Two White & Two Black",
    image: twob_twow,
    price: 420,
    rating: 4.5,
    reviews: 102,
    category: "Bracelets",
    description: "Two white and two black beads for balanced style.",
    tags: ["contrast", "minimal"],
  }),
  buildProduct({
    slug: "black-white-alternative",
    name: "Black & White Alternative",
    image: bw_alternative,
    price: 399,
    rating: 4.2,
    reviews: 48,
    category: "Bracelets",
    description: "Alternating black and white beads.",
    tags: ["classic", "statement"],
  }),
  buildProduct({
    slug: "three-black-one-white",
    name: "Three Black with One White",
    image: threeBoneonewhite,
    price: 430,
    rating: 4.7,
    reviews: 88,
    category: "Bracelets",
    description: "Strong contrast design with black and white tones.",
    tags: ["bold", "classic"],
  }),
  buildProduct({
    slug: "blue-white-panda-dollar",
    name: "Blue & White with Panda Dollar",
    image: bluewhite_panda,
    price: 470,
    rating: 4.8,
    reviews: 117,
    category: "Bracelets",
    description: "Fun panda dollar charm with blue & white theme.",
    tags: ["panda", "fun"],
  }),
];

const earrings = [
  buildProduct({
    slug: "baby-pink-earrings",
    name: "Baby Pink",
    image: baby_pink,
    price: 280,
    rating: 4.6,
    reviews: 64,
    category: "Earrings",
    description: "Delicate baby pink earrings.",
    tags: ["soft", "everyday"],
  }),
  buildProduct({
    slug: "green-butterfly-earrings",
    name: "Green Butterfly",
    image: gb,
    price: 300,
    rating: 4.5,
    reviews: 51,
    category: "Earrings",
    description: "Graceful green butterfly earrings.",
    tags: ["butterfly", "fresh"],
  }),
  buildProduct({
    slug: "golden-rose-earrings",
    name: "Golden Rose",
    image: golden_rose,
    price: 320,
    rating: 4.7,
    reviews: 73,
    category: "Earrings",
    description: "Elegant golden rose design.",
    tags: ["gold", "occasion"],
  }),
  buildProduct({
    slug: "pale-green-butterfly-earrings",
    name: "Pale Green Butterfly",
    image: pale_greenB,
    price: 290,
    rating: 4.4,
    reviews: 42,
    category: "Earrings",
    description: "Soft green butterfly charm earrings.",
    tags: ["soft", "garden"],
  }),
  buildProduct({
    slug: "pink-star-earrings",
    name: "Pink Star",
    image: ps,
    price: 310,
    rating: 4.6,
    reviews: 67,
    category: "Earrings",
    description: "Cute star-shaped pink earrings.",
    tags: ["star", "cute"],
  }),
  buildProduct({
    slug: "yellow-butterfly-earrings",
    name: "Yellow Butterfly",
    image: yb,
    price: 295,
    rating: 4.5,
    reviews: 58,
    category: "Earrings",
    description: "Bright yellow butterfly design.",
    tags: ["sunny", "statement"],
  }),
  buildProduct({
    slug: "silver-s-earrings",
    name: "Silver S",
    image: silver_S,
    price: 330,
    rating: 4.7,
    reviews: 81,
    category: "Earrings",
    description: "Stylish silver S-shaped earrings.",
    tags: ["silver", "minimal"],
  }),
  buildProduct({
    slug: "white-pearl-earrings",
    name: "White Perl",
    image: white_perl,
    price: 340,
    rating: 4.8,
    reviews: 94,
    category: "Earrings",
    description: "Classic pearl earrings in white.",
    tags: ["pearl", "classic"],
  }),
  buildProduct({
    slug: "red-butterfly-earrings",
    name: "Red Butterfly",
    image: red_butterfly,
    price: 315,
    rating: 4.6,
    reviews: 79,
    category: "Earrings",
    description: "Vibrant red butterfly charm.",
    tags: ["bold", "romantic"],
  }),
];

const allProducts = [...bracelets, ...earrings];

const getProductBySlug = (slug) => allProducts.find((item) => item.slug === slug);

export { bracelets, earrings, allProducts, getProductBySlug, formatPrice };
