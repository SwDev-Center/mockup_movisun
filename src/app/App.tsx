import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart, X, Plus, Minus, Search, Star, Play,
  CheckCircle, ArrowRight, Watch, Headphones, Bluetooth,
  Battery, Zap, Speaker, Cable, Package, Menu, ChevronDown,
  ChevronRight, Volume2, VolumeX, Phone, Tag, SlidersHorizontal,
  Radio, Zap as FlashIcon, Info, Users, MessageCircle, Clock,
  TrendingUp, ChevronLeft,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import movisunLogo from "@/imports/image.png";
import img2 from "@/imports/image-2.png";
import img3 from "@/imports/image-3.png";
import img4 from "@/imports/image-4.png";
import img5 from "@/imports/image-5.png";
import audi1 from "@/imports/audi1.png";
import audi2 from "@/imports/audi2.png";
import dia1 from "@/imports/dia1.png";
import dia2 from "@/imports/dia2.png";
import par1 from "@/imports/par1.png";
import par2 from "@/imports/par2.png";
import loca1 from "@/imports/loca1.png";
import inter1 from "@/imports/inter1.png";
import inter2 from "@/imports/inter2.png";
import gamerImg from "@/imports/gamer.png";
import gamer2 from "@/imports/gamer2.png";
import blue1 from "@/imports/blue1.png";
import blue2 from "@/imports/blue2.png";
import blue3 from "@/imports/blue3.png";
import blue4 from "@/imports/blue4.png";
import blue5 from "@/imports/blue5.png";
import bannerParlante2 from "@/imports/bannerParlante2.png";

// ─── Config ───────────────────────────────────────────────────────────────────

const PRIMARY = "#1A2F5F";
const HERO_BG = "linear-gradient(160deg, #071120 0%, #1A2F5F 55%, #1e3f7a 100%)";
const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const HERO_VIDEO_ID = "9PbNPvzUvSQ";
const BRAND_VIDEO_ID = "ScMzIvxBSi4";

const ADVISORS = [
  { name: "Asesor de Ventas", phone: "3200000001", wa: "573200000001", label: "Ventas" },
  { name: "Asesor de Soporte", phone: "3200000002", wa: "573200000002", label: "Soporte" },
];

const waGeneral = `https://wa.me/${ADVISORS[0].wa}?text=${encodeURIComponent("Hola Movisun Nariño! Me gustaría ver el catálogo.")}`;

function buildOrder(cart: CartItem[]) {
  const lines = cart.map(i => `• ${i.name}${i.selectedColor ? ` (${i.selectedColor})` : ""} x${i.quantity} — ${fmt(i.price * i.quantity)}`);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  return `https://wa.me/${ADVISORS[0].wa}?text=${encodeURIComponent(["Hola Movisun Nariño! Mi pedido:", "", ...lines, "", `*Total: ${fmt(total)}*`, "", "¡Gracias!"].join("\n"))}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "home" | "catalog" | "eventos" | "promociones" | "dist-info" | "dist-contacto";

interface Product {
  id: number; name: string; price: number; originalPrice?: number;
  category: string; subcategory: string; description: string;
  features: string[]; image: string; badge?: string; rating: number; reviews: number;
  colors?: string[]; isNew?: boolean; addedDaysAgo?: number;
}
interface CartItem extends Product { quantity: number; selectedColor?: string }

// ─── Navigation Data ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    id: "smartwatch", label: "Smartwatch", children: [
      { label: "Sumergible", catId: "smartwatch", sub: "Sumergible" },
      { label: "No sumergible", catId: "smartwatch", sub: "No sumergible" },
      { label: "Con chip", catId: "smartwatch", sub: "Con chip" },
    ],
  },
  {
    id: "audio", label: "Audio y Carga", children: [
      { label: "Manos libres", catId: "audio", sub: "Manos libres" },
      { label: "Cargadores", catId: "audio", sub: "Cargadores" },
      { label: "Power Bank", catId: "audio", sub: "Power Bank" },
      { label: "Cables", catId: "audio", sub: "Cables" },
      { label: "Pilas", catId: "audio", sub: "Pilas" },
    ],
  },
  {
    id: "bluetooth", label: "Bluetooth", children: [
      { label: "Diademas", catId: "bluetooth", sub: "Diademas" },
      { label: "Parlantes", catId: "bluetooth", sub: "Parlantes" },
      { label: "Audífonos", catId: "bluetooth", sub: "Audífonos" },
      { label: "Localizador", catId: "bluetooth", sub: "Localizador" },
      { label: "Intercomunicadores", catId: "bluetooth", sub: "Intercomunicadores" },
      { label: "Gamer", catId: "bluetooth", sub: "Gamer" },
    ],
  },
  { id: "promociones", label: "Promociones", view: "promociones" as View },
  { id: "eventos", label: "Eventos", view: "eventos" as View },
  {
    id: "distribuidores", label: "Distribuidores", children: [
      { label: "Información", view: "dist-info" as View },
      { label: "Contacto", view: "dist-contacto" as View },
    ],
  },
];

// ─── Category Data ────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "smartwatch", label: "Smartwatch", tagline: "Mide cada momento",
    description: "Relojes inteligentes con salud avanzada, GPS y larga autonomía.",
    icon: <Watch size={16} />, color: "#1A2F5F",
    coverImg: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=500&fit=crop&auto=format",
    heroImg: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop&auto=format",
    subcategories: [
      { label: "Sumergible", icon: <Watch size={13} /> },
      { label: "No sumergible", icon: <Watch size={13} /> },
      { label: "Con chip", icon: <Radio size={13} /> },
    ],
  },
  {
    id: "audio", label: "Audio y Carga", tagline: "Sonido y energía",
    description: "Manos libres, cargadores rápidos, baterías y cables premium.",
    icon: <Headphones size={16} />, color: "#0d3b6e",
    coverImg: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&h=500&fit=crop&auto=format",
    heroImg: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop&auto=format",
    subcategories: [
      { label: "Manos libres", icon: <Headphones size={13} /> },
      { label: "Cargadores", icon: <Zap size={13} /> },
      { label: "Power Bank", icon: <Battery size={13} /> },
      { label: "Cables", icon: <Cable size={13} /> },
      { label: "Pilas", icon: <Battery size={13} /> },
    ],
  },
  {
    id: "bluetooth", label: "Bluetooth y Parlantes", tagline: "Sonido sin límites",
    description: "Parlantes, diademas inalámbricas y accesorios Bluetooth premium.",
    icon: <Bluetooth size={16} />, color: "#122650",
    coverImg: bannerParlante2,
    heroImg: bannerParlante2,
    subcategories: [
      { label: "Diademas", icon: <Headphones size={13} /> },
      { label: "Parlantes", icon: <Speaker size={13} /> },
      { label: "Audífonos", icon: <Headphones size={13} /> },
      { label: "Localizador", icon: <Bluetooth size={13} /> },
      { label: "Intercomunicadores", icon: <Radio size={13} /> },
      { label: "Gamer", icon: <Headphones size={13} /> },
    ],
  },
];

// ─── Product Data ─────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: 1,     name: "Smartwatch Pro X9", price: 89900, originalPrice: 129900,
    category: "smartwatch", subcategory: "Sumergible",
    description: "Reloj inteligente con pantalla AMOLED de 1.9\", monitoreo 24/7, GPS integrado e IP68. Disponible en tres elegantes acabados.",
    features: ["AMOLED 1.9\"", "GPS integrado", "IP68", "7 días batería", "Monitor SpO2", "iOS y Android"],
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&h=500&fit=crop&auto=format",
    badge: "Oferta", rating: 4.7, reviews: 128, colors: ["Negro", "Plata", "Dorado"], isNew: false, addedDaysAgo: 45,
  },
  {
    id: 2,     name: "Smartwatch Fit Band T5", price: 49900,
    category: "smartwatch", subcategory: "No sumergible",
    description: "Banda fitness con pantalla táctil, notificaciones inteligentes y monitoreo de sueño. Correa intercambiable.",
    features: ["Pantalla táctil color", "Monitor sueño", "Notificaciones", "10 días batería"],
    image: "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=500&h=500&fit=crop&auto=format",
    rating: 4.4, reviews: 87, colors: ["Negro", "Azul marino", "Rosa"], addedDaysAgo: 30,
  },
  {
    id: 3,     name: "Smartwatch Ultra S20", price: 149900, originalPrice: 189900,
    category: "smartwatch", subcategory: "Con chip",
    description: "El smartwatch más avanzado. Retina 2\", voz NFC, +100 deportes, carga inalámbrica. El futuro en tu muñeca.",
    features: ["Retina 2\"", "Pagos NFC", "+100 deportes", "Llamadas BT", "Carga inalámbrica"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&auto=format",
    badge: "Nuevo", rating: 4.9, reviews: 214, colors: ["Negro", "Plata"], isNew: true, addedDaysAgo: 5,
  },
  {
    id: 4, name: "Audífonos TWS Pro", price: 59900, originalPrice: 79900,
    category: "audio", subcategory: "Manos libres",
    description: "TWS con cancelación activa de ruido (ANC), 30h autonomía total, driver 10mm. Sonido que te aísla del mundo.",
    features: ["ANC activo", "30h autonomía", "IPX4", "Carga rápida 15min = 2h"],
    image: audi1,
    badge: "Más vendido", rating: 4.6, reviews: 342, colors: ["Negro", "Blanco", "Azul"], addedDaysAgo: 20,
  },
  {
    id: 5, name: "Manos Libres Sport X3", price: 29900,
    category: "audio", subcategory: "Manos libres",
    description: "Auriculares deportivos con gancho, micrófono HD e IPX5. Ideales para entrenar.",
    features: ["Gancho ergonómico", "Micrófono HD", "8h batería", "IPX5"],
    image: audi2,
    rating: 4.3, reviews: 156, colors: ["Negro", "Rojo"], addedDaysAgo: 60,
  },
  {
    id: 7, name: "Cargador Inalámbrico 15W", price: 34900,
    category: "audio", subcategory: "Cargadores",
    description: "Base Qi 15W, compatible con todos los dispositivos Qi. Diseño minimalista.",
    features: ["15W Qi", "Indicador LED", "Antideslizante", "Protección sobrecarga"],
    image: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=500&h=500&fit=crop&auto=format",
    rating: 4.5, reviews: 118, addedDaysAgo: 40,
  },
  {
    id: 9,     name: "Power Bank Slim 10000mAh", price: 44900,
    category: "audio", subcategory: "Power Bank",
    description: "Solo 12mm de grosor, 18W carga rápida, diseño ultradelgado de bolsillo.",
    features: ["10000mAh", "12mm grosor", "18W rápido", "2 salidas USB"],
    image: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500&h=500&fit=crop&auto=format",
    rating: 4.4, reviews: 94, addedDaysAgo: 50,
  },
  {
    id: 10, name: "Cable USB-C 100W 2m", price: 19900,
    category: "audio", subcategory: "Cables",
    description: "Nylon trenzado 100W, 2 metros, transferencia 480Mbps. Durabilidad garantizada.",
    features: ["100W PD", "2 metros", "Nylon trenzado", "480Mbps"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&auto=format",
    rating: 4.6, reviews: 412, addedDaysAgo: 35,
  },
  {
    id: 11, name: "Cable Lightning MFi 1.5m", price: 24900, originalPrice: 34900,
    category: "audio", subcategory: "Cables",
    description: "Certificado MFi para iPhone/iPad, carga rápida 18W, nylon resistente.",
    features: ["Certificado MFi", "1.5 metros", "18W rápido", "10000+ flexiones"],
    image: "https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=500&h=500&fit=crop&auto=format",
    badge: "Oferta", rating: 4.5, reviews: 178, addedDaysAgo: 22,
  },
  {
    id: 12, name: "Parlante XBoom 40W", price: 119900, originalPrice: 159900,
    category: "bluetooth", subcategory: "Parlantes",
    description: "40W potencia, sonido 360°, 20h batería, IPX7, RGB y True Wireless Stereo. La fiesta donde vayas.",
    features: ["40W", "20h batería", "IPX7", "RGB", "TWS"],
    image: par1,
    badge: "Nuevo", rating: 4.8, reviews: 167, colors: ["Negro", "Azul", "Rojo"], isNew: true, addedDaysAgo: 3,
  },
  {
    id: 13, name: "Mini Parlante Bass", price: 49900,
    category: "bluetooth", subcategory: "Parlantes",
    description: "10W, 12h batería, mosquetón incluido, IPX5. Compacto, potente, aventurero.",
    features: ["10W", "12h batería", "IPX5", "Mosquetón"],
    image: par2,
    rating: 4.4, reviews: 231, colors: ["Negro", "Verde", "Naranja"], addedDaysAgo: 18,
  },
  {
    id: 14,     name: "Mouse Inalámbrico Silent Pro", price: 39900, originalPrice: 54900,
    category: "bluetooth", subcategory: "Gamer",
    description: "Bluetooth dual, 1600 DPI ajustable, silencioso y ergonómico. Productividad sin ruido.",
    features: ["BT + USB nano", "1600 DPI", "Silencioso", "Ergonómico"],
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop&auto=format",
    rating: 4.5, reviews: 143, colors: ["Negro", "Blanco"], addedDaysAgo: 28,
  },
  {
    id: 15,     name: "Teclado Bluetooth Compacto", price: 59900,
    category: "bluetooth", subcategory: "Gamer",
    description: "Conecta hasta 3 dispositivos, recargable USB-C, retroiluminado. Multiplataforma.",
    features: ["3 dispositivos", "USB-C", "Retroiluminado", "Win/Mac/iOS"],
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop&auto=format",
    badge: "Nuevo", rating: 4.6, reviews: 89, colors: ["Negro", "Gris"], isNew: true, addedDaysAgo: 7,
  },
  {
    id: 16, name: "Diadema Gamer Pro RGB", price: 79900, originalPrice: 99900,
    category: "bluetooth", subcategory: "Diademas",
    description: "Diadema gaming inalámbrica con sonido 7.1 surround, micrófono ANC, RGB personalizable y 20h de batería.",
    features: ["7.1 surround", "Mic ANC", "RGB", "20h", "Multi-platform"],
    image: dia1,
    badge: "Oferta", rating: 4.7, reviews: 198, colors: ["Negro", "Blanco"], addedDaysAgo: 12,
  },
  {
    id: 17, name: "Diadema Bluetooth Premium", price: 89900,
    category: "bluetooth", subcategory: "Diademas",
    description: "Diadema over-ear con cancelación activa de ruido, 40h de autonomía y sonido Hi-Fi. Para escuchar en serio.",
    features: ["ANC premium", "40h batería", "Hi-Fi audio", "Plegable", "Carga rápida"],
    image: dia2,
    badge: "Nuevo", rating: 4.8, reviews: 76, colors: ["Negro", "Blanco", "Gris"], isNew: true, addedDaysAgo: 4,
  },
  // ── Bluetooth → Audífonos ──
  {
    id: 18, name: "Audífonos TWS Mini", price: 35900,
    category: "bluetooth", subcategory: "Audífonos",
    description: "Audífonos TWS compactos con estuche de carga, sonido equilibrado y 20h de autonomía. Ideales para el día a día.",
    features: ["TWS", "20h total", "Estuche de carga", "Bluetooth 5.3"],
    image: blue1,
    rating: 4.3, reviews: 95, colors: ["Negro", "Blanco"], addedDaysAgo: 10,
  },
  {
    id: 19, name: "Audífonos Deportivos Air", price: 49900,
    category: "bluetooth", subcategory: "Audífonos",
    description: "Diseño ergonómico con gancho, IPX5 y drivers de 12mm. El compañero perfecto para tu entrenamiento.",
    features: ["Gancho deportivo", "IPX5", "Driver 12mm", "10h batería"],
    image: blue2,
    rating: 4.4, reviews: 72, colors: ["Negro", "Azul", "Rojo"], addedDaysAgo: 8,
  },
  {
    id: 20, name: "Audífonos ANC Pro", price: 79900,
    category: "bluetooth", subcategory: "Audífonos",
    description: "Cancelación activa de ruido de última generación, 35h de reproducción y carga inalámbrica.",
    features: ["ANC híbrido", "35h autonomía", "Carga inalámbrica", "IPX4"],
    image: blue3,
    badge: "Nuevo", rating: 4.7, reviews: 48, colors: ["Negro", "Gris"], isNew: true, addedDaysAgo: 2,
  },
  {
    id: 21, name: "Audífonos Plegables XT", price: 29900,
    category: "bluetooth", subcategory: "Audífonos",
    description: "Audífonos plegables ultraligeros con micro SD, FM y 8h de música. Sonido potente a bajo costo.",
    features: ["Plegable", "Micro SD", "FM Radio", "8h batería"],
    image: blue4,
    rating: 4.1, reviews: 134, colors: ["Negro", "Azul marino"], addedDaysAgo: 30,
  },
  {
    id: 22, name: "Audífonos Hi-Fi Premium", price: 94900,
    category: "bluetooth", subcategory: "Audífonos",
    description: "Sonido Hi-Fi con códec LDAC, drivers de 13.5mm y 40h de batería. Para audiófilos exigentes.",
    features: ["LDAC", "Driver 13.5mm", "40h batería", "Carga rápida USB-C"],
    image: blue5,
    badge: "Nuevo", rating: 4.9, reviews: 31, colors: ["Negro", "Plata"], isNew: true, addedDaysAgo: 1,
  },
  // ── Bluetooth → Localizador ──
  {
    id: 23, name: "Localizador Bluetooth Key Finder", price: 22900,
    category: "bluetooth", subcategory: "Localizador",
    description: "Localizador inteligente con app gratuita. Encuentra tus llaves, billetera o mochila en segundos. Alarma integrada y alcance de 50m.",
    features: ["App gratuita", "Alarma integrada", "Alcance 50m", "Batería reemplazable"],
    image: loca1,
    rating: 4.2, reviews: 56, colors: ["Negro", "Blanco", "Azul"], addedDaysAgo: 14,
  },
  // ── Bluetooth → Intercomunicadores ──
  {
    id: 24, name: "Intercomunicador Moto V1", price: 59900,
    category: "bluetooth", subcategory: "Intercomunicadores",
    description: "Intercomunicador Bluetooth para casco, hasta 800m de alcance, con cancelación de ruido y música en streaming.",
    features: ["800m alcance", "Cancelación ruido", "Music streaming", "8h batería"],
    image: inter1,
    rating: 4.4, reviews: 89, colors: ["Negro"], addedDaysAgo: 20,
  },
  {
    id: 25, name: "Intercomunicador Moto V2", price: 89900,
    category: "bluetooth", subcategory: "Intercomunicadores",
    description: "Intercomunicador premium multipunto, conector para 4 personas, 1200m de alcance y sonido HD.",
    features: ["Multipunto 4 pers.", "1200m alcance", "Sonido HD", "12h batería", "Carga rápida"],
    image: inter2,
    badge: "Nuevo", rating: 4.6, reviews: 37, colors: ["Negro", "Gris"], isNew: true, addedDaysAgo: 6,
  },
  // ── Bluetooth → Gamer ──
  {
    id: 26, name: "Auriculares Gamer", price: 74900,
    category: "bluetooth", subcategory: "Gamer",
    description: "Auriculares gaming con sonido envolvente 7.1, micrófono retráctil y almohadillas de memory foam.",
    features: ["Sonido 7.1", "Mic retráctil", "Memory foam", "RGB", "Multi-platform"],
    image: gamerImg,
    rating: 4.5, reviews: 112, colors: ["Negro"], addedDaysAgo: 12,
  },
  {
    id: 27, name: "Audífonos Gamer", price: 89900,
    category: "bluetooth", subcategory: "Gamer",
    description: "Audífonos gaming inalámbricos con baja latencia, batería de 30h y drivers de 50mm para experiencia inmersiva.",
    features: ["Inalámbrico", "Baja latencia", "Driver 50mm", "30h batería", "Mic ANC"],
    image: gamer2,
    badge: "Nuevo", rating: 4.7, reviews: 63, colors: ["Negro", "Blanco"], isNew: true, addedDaysAgo: 4,
  },
];

// ─── Events Data ──────────────────────────────────────────────────────────────

const EVENTOS_VIVO = [
  {
    id: 1, title: "Lanzamiento Smartwatch Ultra S20",
    desc: "Presentación en vivo del nuevo Smartwatch Ultra S20 con demostraciones en tiempo real y precios especiales de lanzamiento.",
    date: "Hoy, 7:00 PM", live: true,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop&auto=format",
    viewers: 248,
  },
  {
    id: 2, title: "Guía de Accesorios para Gaming",
    desc: "Descubre la combinación perfecta de diademas, teclado y mouse para llevar tu gaming al siguiente nivel.",
    date: "Mañana, 8:00 PM", live: false,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=600&h=400&fit=crop&auto=format",
    viewers: 0,
  },
  {
    id: 3, title: "Cargadores GaN — Lo que necesitas saber",
    desc: "Sesión informativa sobre la tecnología GaN y por qué debes actualizar tu cargador ahora.",
    date: "Viernes, 6:00 PM", live: false,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=400&fit=crop&auto=format",
    viewers: 0,
  },
];

const EVENTOS_FLASH = [
  { productId: 1, extraDiscount: 15, endsInHours: 3.5, stock: 8 },
  { productId: 4, extraDiscount: 20, endsInHours: 6, stock: 12 },
  { productId: 12, extraDiscount: 10, endsInHours: 1.5, stock: 5 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `$${n.toLocaleString("es-CO")}`;

// ─── Motion Variants ─────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.45, ease } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const slideUp = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.44, ease } },
  exit: { opacity: 0, y: "100%", transition: { duration: 0.32, ease } },
};
const slideRight = {
  hidden: { opacity: 0, x: "100%" },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease } },
  exit: { opacity: 0, x: "100%", transition: { duration: 0.28, ease } },
};

// ─── Small components ─────────────────────────────────────────────────────────

function WaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function Stars({ r }: { r: number }) {
  return (
    <div className="flex gap-px">
      {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= Math.round(r) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />)}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  const c = text === "Nuevo" ? "bg-emerald-100 text-emerald-700" : text === "Más vendido" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c}`}>{text}</span>;
}

const COLOR_HEX: Record<string, string> = {
  "Negro": "#1a1a1a", "Blanco": "#f5f5f5", "Plata": "#c0c0c0", "Dorado": "#d4af37",
  "Azul": "#2563eb", "Azul marino": "#1e3a5f", "Rosa": "#f472b6", "Rojo": "#dc2626",
  "Verde": "#16a34a", "Naranja": "#ea580c", "Gris": "#6b7280",
};

// ─── Countdown ────────────────────────────────────────────────────────────────

function Countdown({ hours }: { hours: number }) {
  const target = useRef(Date.now() + hours * 3600000);
  const [tl, setTl] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, target.current - Date.now());
      setTl({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-1">
      {[{ v: tl.h, l: "h" }, { v: tl.m, l: "m" }, { v: tl.s, l: "s" }].map(({ v, l }) => (
        <div key={l} className="flex items-center gap-0.5">
          <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[28px] text-center">
            {String(v).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">{l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Video Modal ──────────────────────────────────────────────────────────────

function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" variants={fadeIn} initial="hidden" animate="visible" exit="hidden">
      <div className="absolute inset-0 bg-black/88 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }} transition={{ duration: 0.32, ease }}>
        <iframe src={`https://www.youtube.com/embed/${HERO_VIDEO_ID}?autoplay=1&rel=0`}
          title="Movisun" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
        <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur transition-colors"><X size={16} /></button>
      </motion.div>
    </motion.div>
  );
}

// ─── Product Modal ────────────────────────────────────────────────────────────

function ProductModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (p: Product, qty: number, color?: string) => void }) {
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState<string | undefined>(product.colors?.[0]);
  const disc = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" variants={fadeIn} initial="hidden" animate="visible" exit="hidden">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto" variants={slideUp} initial="hidden" animate="visible" exit="exit">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors backdrop-blur"><X size={17} /></button>
          <div className="absolute top-4 left-4 flex gap-1.5">
            {product.badge && <Badge text={product.badge} />}
            {disc && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white">-{disc}%</span>}
          </div>
        </div>
        <div className="p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">{product.subcategory}</p>
          <h2 className="text-2xl font-extrabold text-foreground mb-2 leading-tight">{product.name}</h2>
          <div className="flex items-center gap-2 mb-4">
            <Stars r={product.rating} />
            <span className="text-xs text-muted-foreground">{product.rating} · {product.reviews} reseñas</span>
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-extrabold" style={{ color: PRIMARY }}>{fmt(product.price)}</span>
            {product.originalPrice && <span className="text-base text-muted-foreground line-through">{fmt(product.originalPrice)}</span>}
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed mb-5">{product.description}</p>

          {/* Color selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-bold text-foreground mb-3">
                Color: <span className="font-semibold text-muted-foreground">{color}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    title={c}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all ${color === c ? "border-primary shadow-sm" : "border-border hover:border-muted-foreground"}`}
                    style={color === c ? { borderColor: PRIMARY } : {}}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ background: COLOR_HEX[c] ?? c }}
                    />
                    {c}
                    {color === c && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white" style={{ background: PRIMARY }}>
                        <CheckCircle size={10} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mb-6">
            <p className="text-sm font-bold text-foreground mb-3">Características</p>
            <div className="grid grid-cols-1 gap-2">
              {product.features.map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle size={13} className="shrink-0" style={{ color: PRIMARY }} />
                  <span className="text-sm text-foreground/70">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3 hover:bg-muted transition-colors" style={{ color: PRIMARY }}><Minus size={14} /></button>
              <span className="w-8 text-center font-bold text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-3 hover:bg-muted transition-colors" style={{ color: PRIMARY }}><Plus size={14} /></button>
            </div>
            <button onClick={() => { onAdd(product, qty, color); onClose(); }} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[.98]" style={{ background: PRIMARY }}>
              Agregar — {fmt(product.price * qty)}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({ cart, onClose, onUpdate, onRemove }: { cart: CartItem[]; onClose: () => void; onUpdate: (id: number, qty: number) => void; onRemove: (id: number) => void }) {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  return (
    <motion.div className="fixed inset-0 z-[60] flex justify-end" variants={fadeIn} initial="hidden" animate="visible" exit="hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl" variants={slideRight} initial="hidden" animate="visible" exit="exit">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={19} style={{ color: PRIMARY }} />
            <h2 className="font-extrabold text-lg text-foreground">Carrito</h2>
            {count > 0 && <span className="text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ background: PRIMARY }}>{count}</span>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"><X size={17} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <ShoppingCart size={52} strokeWidth={1} />
              <div className="text-center"><p className="font-semibold text-sm">Tu carrito está vacío</p><p className="text-xs mt-1">Agrega productos para comenzar</p></div>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <motion.div key={item.id} layout className="flex gap-3 bg-muted rounded-2xl p-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.subcategory}</p>
                    <p className="text-sm font-bold text-foreground leading-tight line-clamp-2 mt-0.5">{item.name}</p>
                    {item.selectedColor && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ background: COLOR_HEX[item.selectedColor] ?? item.selectedColor }} />
                        <span className="text-[10px] text-muted-foreground">{item.selectedColor}</span>
                      </div>
                    )}
                    <p className="text-sm font-bold mt-1" style={{ color: PRIMARY }}>{fmt(item.price)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-lg bg-white overflow-hidden">
                        <button onClick={() => item.quantity > 1 ? onUpdate(item.id, item.quantity - 1) : onRemove(item.id)} className="px-2 py-1.5" style={{ color: PRIMARY }}><Minus size={11} /></button>
                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => onUpdate(item.id, item.quantity + 1)} className="px-2 py-1.5" style={{ color: PRIMARY }}><Plus size={11} /></button>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors">Eliminar</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="px-5 py-5 border-t border-border space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{fmt(total)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Envío</span><span className="text-emerald-600 font-semibold">Por WhatsApp</span></div>
            <div className="h-px bg-border" />
            <div className="flex justify-between"><span className="font-extrabold">Total</span><span className="text-2xl font-extrabold" style={{ color: PRIMARY }}>{fmt(total)}</span></div>
            <a href={buildOrder(cart)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-sm text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors">
              <WaIcon size={18} /> Pedir por WhatsApp
            </a>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onSelect, onAdd }: { product: Product; onSelect: () => void; onAdd: () => void }) {
  const disc = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
      whileHover={{ y: -3, transition: { duration: 0.22, ease } }} onClick={onSelect}>
      <div className="relative aspect-square bg-muted overflow-hidden">
        <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1">
          {product.badge && <Badge text={product.badge} />}
          {disc && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white">-{disc}%</span>}
        </div>
        {product.colors && product.colors.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {product.colors.slice(0, 4).map(c => (
              <span key={c} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ background: COLOR_HEX[c] ?? c }} title={c} />
            ))}
          </div>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{product.subcategory}</p>
        <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-1.5 mb-3"><Stars r={product.rating} /><span className="text-[10px] text-muted-foreground">({product.reviews})</span></div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-base font-extrabold" style={{ color: PRIMARY }}>{fmt(product.price)}</p>
            {product.originalPrice && <p className="text-xs text-muted-foreground line-through">{fmt(product.originalPrice)}</p>}
          </div>
          <button onClick={e => { e.stopPropagation(); onAdd(); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm hover:opacity-90 active:scale-95 transition-all" style={{ background: PRIMARY }} aria-label="Agregar"><Plus size={16} /></button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── New Products Carousel ────────────────────────────────────────────────────

function NewProductsCarousel({ onSelect, onAdd }: { onSelect: (p: Product) => void; onAdd: (p: Product) => void }) {
  const newProducts = PRODUCTS.filter(p => p.isNew || p.badge === "Nuevo");
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const visible = 2;

  useEffect(() => {
    if (paused || newProducts.length <= visible) return;
    const t = setInterval(() => setIdx(i => (i + 1) % (newProducts.length - visible + 1)), 3500);
    return () => clearInterval(t);
  }, [paused, newProducts.length]);

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase mb-1" style={{ color: PRIMARY }}>Recién llegados</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Productos nuevos</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIdx(i => Math.max(0, i - 1))} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors" disabled={idx === 0}>
              <ChevronLeft size={16} className={idx === 0 ? "text-muted-foreground" : "text-foreground"} />
            </button>
            <button onClick={() => setIdx(i => Math.min(newProducts.length - visible, i + 1))} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors" disabled={idx >= newProducts.length - visible}>
              <ChevronRight size={16} className={idx >= newProducts.length - visible ? "text-muted-foreground" : "text-foreground"} />
            </button>
          </div>
        </motion.div>

        <div className="overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <motion.div
            className="flex gap-4"
            animate={{ x: `-${idx * (100 / visible)}%` }}
            transition={{ duration: 0.5, ease }}
          >
            {newProducts.map(p => (
              <div key={p.id} className="shrink-0" style={{ width: `calc(${100 / visible}% - 8px)` }}>
                <ProductCard product={p} onSelect={() => onSelect(p)} onAdd={() => onAdd(p)} />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: Math.max(1, newProducts.length - visible + 1) }).map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all ${i === idx ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-gray-200"}`} style={i === idx ? { background: PRIMARY } : {}} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Image Carousel ───────────────────────────────────────────────────────────

const CAROUSEL_SLIDES = [
  { img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&h=700&fit=crop&auto=format", headline: "Smartwatches de última generación", sub: "Monitorea tu salud y mantente conectado todo el día.", cta: "smartwatch" },
  { img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1400&h=700&fit=crop&auto=format", headline: "Audífonos TWS con cancelación de ruido", sub: "Sonido inmersivo para cada momento de tu día.", cta: "audio" },
  { img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1400&h=700&fit=crop&auto=format", headline: "Carga rápida donde vayas", sub: "Power banks y cargadores GaN compactos y potentes.", cta: "audio" },
  { img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1400&h=700&fit=crop&auto=format", headline: "Parlantes Bluetooth 360°", sub: "Lleva la música a cualquier lugar. IPX7 resistente.", cta: "bluetooth" },
  { img: "https://images.unsplash.com/photo-1599669454699-248893623440?w=1400&h=700&fit=crop&auto=format", headline: "Diademas Gaming Premium", sub: "Sonido 7.1, micrófono ANC y RGB personalizable.", cta: "bluetooth" },
];

function ImageCarousel({ onCategorySelect }: { onCategorySelect: (id: string) => void }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const advance = useCallback((dir: 1 | -1) => setIdx(i => (i + dir + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length), []);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => advance(1), 5000);
    return () => clearInterval(t);
  }, [paused, advance]);
  const slide = CAROUSEL_SLIDES[idx];
  return (
    <section className="relative w-full overflow-hidden" style={{ height: "min(580px, 80vw)" }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div key={idx} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease }}>
          <ImageWithFallback src={slide.img} alt={slide.headline} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(7,17,32,0.85) 0%, rgba(26,47,95,0.6) 50%, rgba(0,0,0,0.1) 100%)" }} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5, ease }}>
            <p className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-3">Movisun Nariño</p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-3">{slide.headline}</h2>
            <p className="text-blue-100/80 text-sm sm:text-base mb-6 max-w-sm">{slide.sub}</p>
            <button onClick={() => onCategorySelect(slide.cta)} className="inline-flex items-center gap-2 bg-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors" style={{ color: PRIMARY }}>
              Ver categoría <ArrowRight size={15} />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {CAROUSEL_SLIDES.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all duration-300 ${i === idx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"}`} />)}
      </div>
      <button onClick={() => advance(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors hidden sm:flex"><ChevronRight size={18} className="rotate-180" /></button>
      <button onClick={() => advance(1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors hidden sm:flex"><ChevronRight size={18} /></button>
    </section>
  );
}

// ─── Category Cards Section ───────────────────────────────────────────────────

function CategoryCardsSection({ onCategorySelect }: { onCategorySelect: (id: string) => void }) {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} className="text-center mb-14">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: PRIMARY }}>Nuestras categorías</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Encuentra lo que necesitas</h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {CATEGORIES.map(cat => (
            <motion.button key={cat.id} variants={fadeUp} onClick={() => onCategorySelect(cat.id)}
              className="relative overflow-hidden rounded-3xl text-left group cursor-pointer border-0 p-0"
              style={{ aspectRatio: "4/5" }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.3, ease }}>
              <ImageWithFallback src={cat.coverImg} alt={cat.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${cat.color}f2 30%, ${cat.color}80 60%, transparent 100%)` }} />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <div className="mb-2 opacity-70">{cat.icon}</div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/65 mb-1">{cat.tagline}</p>
                <h3 className="text-xl font-extrabold leading-tight mb-2">{cat.label}</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-4 hidden sm:block">{cat.description}</p>
                <div className="flex items-center gap-1.5 text-sm font-bold group-hover:gap-3 transition-all">Explorar <ArrowRight size={15} /></div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Brand Video Section ──────────────────────────────────────────────────────

function BrandVideoSection() {
  const [muted, setMuted] = useState(true);
  return (
    <section className="relative overflow-hidden" style={{ height: "min(520px, 90vw)", background: "#07111f" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <iframe src={`https://www.youtube.com/embed/${BRAND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BRAND_VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
          title="Movisun Brand" allow="autoplay; encrypted-media"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "200%", height: "200%", border: "none", pointerEvents: "none" }} />
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,17,32,0.6) 0%, rgba(7,17,32,0.4) 50%, rgba(7,17,32,0.7) 100%)" }} />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6">
              <div className="w-5 h-5 bg-white rounded-md overflow-hidden p-0.5"><ImageWithFallback src={movisunLogo} alt="Movisun" className="w-full h-full object-contain" /></div>
              <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">Movisun Nariño</span>
            </div>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">La tecnología<br />que mereces</motion.h2>
          <motion.p variants={fadeUp} className="text-blue-200/80 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">Calidad premium, precios accesibles. Descubre por qué Nariño confía en Movisun.</motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
            <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-6 py-3.5 rounded-2xl transition-colors text-sm"><WaIcon size={17} /> Contactar ahora</a>
            <button onClick={() => setMuted(m => !m)} className="flex items-center justify-center w-11 h-11 bg-white/15 hover:bg-white/25 text-white rounded-xl backdrop-blur transition-colors">{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Catalog / Products Section ───────────────────────────────────────────────

type SortKey = "nuevos" | "antiguos" | "precio-asc" | "precio-desc" | "rating" | "descuento";
type PriceRange = "all" | "0-30" | "30-80" | "80-130" | "130+";

function ProductsSection({ activeCat, activeSub, onCatChange, onSubChange, onSelect, onAdd }: {
  activeCat: string; activeSub: string | null;
  onCatChange: (id: string) => void; onSubChange: (s: string | null) => void;
  onSelect: (p: Product) => void; onAdd: (p: Product) => void;
}) {
  const [sortBy, setSortBy] = useState<SortKey>("nuevos");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [minRating, setMinRating] = useState(0);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const cat = CATEGORIES.find(c => c.id === activeCat)!;

  let products = PRODUCTS.filter(p =>
    p.category === activeCat &&
    (!activeSub || p.subcategory === activeSub) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.subcategory.toLowerCase().includes(search.toLowerCase())) &&
    (priceRange === "all" || (priceRange === "0-30" && p.price < 30000) || (priceRange === "30-80" && p.price >= 30000 && p.price < 80000) || (priceRange === "80-130" && p.price >= 80000 && p.price < 130000) || (priceRange === "130+" && p.price >= 130000)) &&
    (minRating === 0 || p.rating >= minRating) &&
    (!onlyDiscount || !!p.originalPrice)
  );

  products = [...products].sort((a, b) => {
    if (sortBy === "nuevos") return (a.addedDaysAgo ?? 99) - (b.addedDaysAgo ?? 99);
    if (sortBy === "antiguos") return (b.addedDaysAgo ?? 0) - (a.addedDaysAgo ?? 0);
    if (sortBy === "precio-asc") return a.price - b.price;
    if (sortBy === "precio-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "descuento") return (b.originalPrice ? b.originalPrice - b.price : 0) - (a.originalPrice ? a.originalPrice - a.price : 0);
    return 0;
  });

  const grouped: Record<string, Product[]> = {};
  products.forEach(p => { if (!grouped[p.subcategory]) grouped[p.subcategory] = []; grouped[p.subcategory].push(p); });

  const activeFiltersCount = (priceRange !== "all" ? 1 : 0) + (minRating > 0 ? 1 : 0) + (onlyDiscount ? 1 : 0) + (sortBy !== "nuevos" ? 1 : 0);

  return (
    <section className="min-h-screen py-10 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* Category cover */}
        <div className="relative rounded-2xl overflow-hidden mb-5 h-32 sm:h-44">
          <ImageWithFallback src={cat.coverImg} alt={cat.label} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${cat.color}e0 0%, ${cat.color}90 50%, transparent 100%)` }} />
          <div className="absolute inset-0 flex items-center px-6 sm:px-10">
            <div>
              <p className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-1">{cat.tagline}</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{cat.label}</h3>
              <p className="text-blue-200/80 text-sm mt-1 hidden sm:block max-w-xs">{cat.description}</p>
            </div>
          </div>
        </div>

        {/* Subcategory pills + search + filter toggle */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {cat.subcategories.length > 1 && (
            <>
              <button onClick={() => onSubChange(null)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${!activeSub ? "text-white border-transparent" : "text-muted-foreground border-border hover:bg-muted"}`} style={!activeSub ? { background: PRIMARY } : {}}>Todos</button>
              {cat.subcategories.map(s => (
                <button key={s.label} onClick={() => onSubChange(s.label === activeSub ? null : s.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${activeSub === s.label ? "text-white border-transparent" : "text-muted-foreground border-border hover:bg-muted"}`}
                  style={activeSub === s.label ? { background: PRIMARY } : {}}>
                  {s.icon} {s.label}
                </button>
              ))}
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-1.5 bg-muted">
              <Search size={13} className="text-muted-foreground" />
              <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs outline-none w-24 text-foreground placeholder:text-muted-foreground" />
            </div>
            <button onClick={() => setFiltersOpen(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filtersOpen ? "text-white border-transparent" : "text-muted-foreground border-border hover:bg-muted"}`}
              style={filtersOpen ? { background: PRIMARY } : {}}>
              <SlidersHorizontal size={13} />
              Filtros
              {activeFiltersCount > 0 && <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{activeFiltersCount}</span>}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-muted rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Sort */}
                <div>
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1"><TrendingUp size={11} /> Ordenar por</p>
                  <div className="space-y-1">
                    {([["nuevos", "Más nuevos"], ["antiguos", "Más antiguos"], ["precio-asc", "Precio ↑"], ["precio-desc", "Precio ↓"], ["rating", "Mejor valorados"], ["descuento", "Mayor descuento"]] as [SortKey, string][]).map(([k, l]) => (
                      <button key={k} onClick={() => setSortBy(k)} className={`block w-full text-left text-xs px-2 py-1 rounded-lg transition-colors ${sortBy === k ? "font-bold text-white" : "text-muted-foreground hover:bg-white"}`} style={sortBy === k ? { background: PRIMARY } : {}}>{l}</button>
                    ))}
                  </div>
                </div>
                {/* Price */}
                <div>
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1"><Tag size={11} /> Precio</p>
                  <div className="space-y-1">
                    {([["all", "Todos"], ["0-30", "Menos de $30k"], ["30-80", "$30k – $80k"], ["80-130", "$80k – $130k"], ["130+", "Más de $130k"]] as [PriceRange, string][]).map(([k, l]) => (
                      <button key={k} onClick={() => setPriceRange(k)} className={`block w-full text-left text-xs px-2 py-1 rounded-lg transition-colors ${priceRange === k ? "font-bold text-white" : "text-muted-foreground hover:bg-white"}`} style={priceRange === k ? { background: PRIMARY } : {}}>{l}</button>
                    ))}
                  </div>
                </div>
                {/* Rating */}
                <div>
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1"><Star size={11} /> Valoración</p>
                  <div className="space-y-1">
                    {([[0, "Todas"], [4.5, "4.5+"], [4.0, "4.0+"], [3.5, "3.5+"]] as [number, string][]).map(([k, l]) => (
                      <button key={k} onClick={() => setMinRating(k)} className={`block w-full text-left text-xs px-2 py-1 rounded-lg transition-colors ${minRating === k ? "font-bold text-white" : "text-muted-foreground hover:bg-white"}`} style={minRating === k ? { background: PRIMARY } : {}}>{l}</button>
                    ))}
                  </div>
                </div>
                {/* Other */}
                <div>
                  <p className="text-xs font-bold text-foreground mb-2">Otros</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setOnlyDiscount(d => !d)} className={`w-9 h-5 rounded-full transition-colors relative ${onlyDiscount ? "bg-primary" : "bg-gray-300"}`} style={onlyDiscount ? { background: PRIMARY } : {}}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${onlyDiscount ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-xs text-foreground">Solo en oferta</span>
                  </label>
                  <button onClick={() => { setSortBy("nuevos"); setPriceRange("all"); setMinRating(0); setOnlyDiscount(false); }} className="mt-3 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors">Limpiar filtros</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products */}
        <AnimatePresence mode="wait">
          <motion.div key={activeCat + activeSub + sortBy + priceRange} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease }}>
            {Object.keys(grouped).length === 0 ? (
              <div className="text-center py-20 text-muted-foreground"><Package size={44} strokeWidth={1} className="mx-auto mb-4" /><p className="font-semibold">No hay productos que coincidan con los filtros</p></div>
            ) : (
              <div className="space-y-10">
                {Object.entries(grouped).map(([sub, prods]) => {
                  const subMeta = cat.subcategories.find(s => s.label === sub);
                  return (
                    <div key={sub}>
                      {Object.keys(grouped).length > 1 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: PRIMARY }}>{subMeta?.icon ?? <Package size={13} />}</div>
                          <h4 className="font-extrabold text-foreground text-sm">{sub}</h4>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                      )}
                      <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}>
                        {prods.map(p => <ProductCard key={p.id} product={p} onSelect={() => onSelect(p)} onAdd={() => onAdd(p)} />)}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Events Page ──────────────────────────────────────────────────────────────

function EventosPage({ onProductSelect, onAdd }: { onProductSelect: (p: Product) => void; onAdd: (p: Product) => void }) {
  return (
    <motion.div key="eventos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="pt-16 min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Eventos en Vivo */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold" style={{ background: "#dc2626" }}>
              <Radio size={12} className="animate-pulse" /> EN VIVO
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Eventos en Vivo</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {EVENTOS_VIVO.map(ev => (
              <motion.div key={ev.id} variants={fadeUp} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <ImageWithFallback src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {ev.live && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="relative flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"><Play size={18} fill="white" className="text-white ml-0.5" /></div>
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Radio size={8} className="animate-pulse" /> EN VIVO · {ev.viewers} viendo</span>
                      </div>
                    </div>
                  )}
                  {!ev.live && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur flex items-center gap-1"><Clock size={9} /> {ev.date}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground text-sm mb-1 leading-tight">{ev.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{ev.desc}</p>
                  <a href={waGeneral} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${ev.live ? "bg-red-600 hover:bg-red-700" : "hover:opacity-90"}`}
                    style={!ev.live ? { background: PRIMARY } : {}}>
                    {ev.live ? <><Radio size={11} /> Ver ahora</> : <><WaIcon size={11} /> Notificarme</>}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Ventas Flash */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold bg-amber-500">
              <FlashIcon size={12} /> VENTAS FLASH
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Ofertas relámpago</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {EVENTOS_FLASH.map(flash => {
              const product = PRODUCTS.find(p => p.id === flash.productId)!;
              const flashPrice = Math.round(product.price * (1 - flash.extraDiscount / 100));
              return (
                <motion.div key={flash.productId} variants={fadeUp} className="bg-white rounded-2xl border-2 border-amber-400 shadow-md overflow-hidden relative">
                  <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{flash.extraDiscount}% EXTRA</div>
                  <div className="aspect-square overflow-hidden bg-muted cursor-pointer" onClick={() => onProductSelect(product)}>
                    <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-400" />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{product.subcategory}</p>
                    <h3 className="font-bold text-foreground text-sm leading-tight mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-extrabold" style={{ color: PRIMARY }}>{fmt(flashPrice)}</span>
                      <span className="text-sm line-through text-muted-foreground">{fmt(product.price)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Countdown hours={flash.endsInHours} />
                      <span className="text-xs text-muted-foreground">· {flash.stock} disponibles</span>
                    </div>
                    <button onClick={() => onAdd({ ...product, price: flashPrice })} className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors">
                      Agregar al carrito
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Promociones Page ─────────────────────────────────────────────────────────

function PromocionesPage({ onSelect, onAdd }: { onSelect: (p: Product) => void; onAdd: (p: Product) => void }) {
  const promos = PRODUCTS.filter(p => p.originalPrice);
  return (
    <motion.div key="promociones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="pt-16 min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="relative rounded-3xl overflow-hidden mb-10 py-12 px-8 text-center" style={{ background: `linear-gradient(135deg, #071120 0%, ${PRIMARY} 100%)` }}>
          <div className="relative z-10">
            <Tag size={32} className="text-amber-400 mx-auto mb-3" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Promociones</h1>
            <p className="text-blue-200/80 text-base max-w-sm mx-auto">Los mejores descuentos en tecnología de calidad. ¡Aprovecha antes de que se agoten!</p>
          </div>
        </div>
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {promos.map(p => <ProductCard key={p.id} product={p} onSelect={() => onSelect(p)} onAdd={() => onAdd(p)} />)}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Distribuidores Pages ─────────────────────────────────────────────────────

function DistribuidoresInfo() {
  return (
    <motion.div key="dist-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="pt-16 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-8">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <Users size={40} className="mx-auto mb-4" style={{ color: PRIMARY }} />
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Programa de Distribuidores</h1>
            <p className="text-muted-foreground max-w-md mx-auto">Únete a la red de distribuidores Movisun Nariño y lleva la mejor tecnología a tu región.</p>
          </motion.div>
          {[
            { icon: <CheckCircle size={22} />, title: "Precios de mayorista", desc: "Accede a precios especiales con descuentos exclusivos por volumen de compra desde el primer pedido." },
            { icon: <Package size={22} />, title: "Variedad de productos", desc: "Catálogo completo: smartwatches, audio, cargadores, Bluetooth y más. Siempre disponible." },
            { icon: <TrendingUp size={22} />, title: "Apoyo comercial", desc: "Material de ventas, capacitación de productos y soporte de nuestro equipo para impulsar tu negocio." },
            { icon: <Info size={22} />, title: "Requisitos", desc: "Persona natural o jurídica con RUT activo, pedido mínimo inicial de $500.000 COP y zona geográfica definida." },
          ].map(item => (
            <motion.div key={item.title} variants={fadeUp} className="flex gap-4 p-5 bg-muted rounded-2xl">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: PRIMARY }}>{item.icon}</div>
              <div><h3 className="font-bold text-foreground mb-1">{item.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function DistribuidoresContacto() {
  return (
    <motion.div key="dist-contacto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="pt-16 min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-10">
            <MessageCircle size={40} className="mx-auto mb-4" style={{ color: PRIMARY }} />
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Contacto Distribuidores</h1>
            <p className="text-muted-foreground">Escríbenos directamente y te contactamos en menos de 24 horas.</p>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {ADVISORS.map(a => (
              <div key={a.name} className="p-5 bg-muted rounded-2xl">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{a.label}</p>
                <p className="font-bold text-foreground mb-3">{a.name}</p>
                <a href={`tel:+57${a.phone}`} className="flex items-center gap-2 text-sm font-medium mb-2 hover:underline" style={{ color: PRIMARY }}>
                  <Phone size={14} /> +57 {a.phone}
                </a>
                <a href={`https://wa.me/${a.wa}?text=${encodeURIComponent("Hola! Me interesa ser distribuidor Movisun Nariño.")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors justify-center mt-2">
                  <WaIcon size={14} /> WhatsApp
                </a>
              </div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="p-5 rounded-2xl border border-border text-center">
            <p className="text-sm text-muted-foreground">O escríbenos al correo: <a href="mailto:distribuidores@movisun.com.co" className="font-semibold hover:underline" style={{ color: PRIMARY }}>distribuidores@movisun.com.co</a></p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ scrolled, cartCount, onCartOpen, view, activeCat, onGoHome, onNavigate }: {
  scrolled: boolean; cartCount: number; onCartOpen: () => void;
  view: View; activeCat: string; onGoHome: () => void;
  onNavigate: (catId?: string, sub?: string | null, nextView?: View) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const transparent = !scrolled && !mobileOpen && view === "home";

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const handleNav = (item: typeof NAV_ITEMS[0]) => {
    if ("catId" in item && item.catId) { onNavigate(item.catId, null); }
    else if ("view" in item && item.view) { onNavigate(undefined, undefined, item.view); }
    setMobileOpen(false);
    setExpandedCat(null);
  };

  const handleChild = (child: { label: string; catId?: string; sub?: string; view?: View }) => {
    if (child.catId) { onNavigate(child.catId, child.sub); }
    else if (child.view) { onNavigate(undefined, undefined, child.view); }
    setMobileOpen(false);
    setHoveredItem(null);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${transparent ? "bg-transparent" : "bg-white/96 backdrop-blur-lg shadow-sm border-b border-border"}`}>

      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo — enlarged */}
        <a href="#" onClick={e => { e.preventDefault(); view === "home" ? window.scrollTo({ top: 0, behavior: "smooth" }) : onGoHome(); }} className="flex items-center gap-3 shrink-0 mr-1">
          <div className={`transition-all ${transparent ? "w-14 h-14 rounded-2xl overflow-hidden bg-white p-2" : "w-10 h-10"}`}>
            <ImageWithFallback src={movisunLogo} alt="Movisun" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <p className={`font-extrabold text-sm tracking-wide leading-tight transition-colors ${transparent ? "text-white" : ""}`} style={!transparent ? { color: PRIMARY } : {}}>MOVISUN</p>
            <p className={`text-[10px] font-medium leading-tight ${transparent ? "text-blue-300" : "text-muted-foreground"}`}>Nariño</p>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {NAV_ITEMS.map(item => {
            const hasChildren = "children" in item && item.children;
            const isActive = ("catId" in item && view === "catalog" && (item as any).catId === activeCat) || ("view" in item && view === (item as any).view) || ("children" in item && item.children && (item as any).children.some((c: any) => c.catId === activeCat && view === "catalog"));
            return (
              <div key={item.id} className="relative" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
                <button
                  onClick={() => handleNav(item)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${isActive
                    ? transparent ? "bg-white/20 text-white" : "bg-secondary text-primary"
                    : transparent ? "text-white/75 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  {item.label}
                  {hasChildren && <ChevronDown size={12} className={`transition-transform ${hoveredItem === item.id ? "rotate-180" : ""}`} />}
                </button>
                <AnimatePresence>
                  {hoveredItem === item.id && hasChildren && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.16, ease }}
                      className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-border py-2 min-w-[160px] z-20">
                      {(item as any).children.map((child: any) => (
                        <button key={child.label} onClick={() => handleChild(child)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-primary transition-colors">
                          <ChevronRight size={12} style={{ color: PRIMARY }} /> {child.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Right: search + cart + hamburger */}
        <div className="flex items-center gap-1.5 ml-auto">
          <AnimatePresence>
            {searchOpen && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25, ease }} className="hidden md:flex overflow-hidden">
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2 w-full ${transparent ? "bg-white/15 border border-white/20" : "bg-muted border border-border"}`}>
                  <Search size={13} className={transparent ? "text-blue-200" : "text-muted-foreground"} />
                  <input ref={searchRef} type="text" placeholder="Buscar..." value={searchVal} onChange={e => setSearchVal(e.target.value)}
                    className={`bg-transparent text-sm outline-none flex-1 ${transparent ? "text-white placeholder:text-blue-300" : "text-foreground placeholder:text-muted-foreground"}`} />
                  {searchVal && <button onClick={() => setSearchVal("")}><X size={12} /></button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setSearchOpen(s => !s)} className={`hidden md:flex w-9 h-9 items-center justify-center rounded-xl transition-all ${transparent ? "text-white hover:bg-white/15" : "text-muted-foreground hover:bg-muted"}`}>
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </button>
          <button onClick={onCartOpen} className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all ${transparent ? "text-white hover:bg-white/15" : "hover:bg-muted"}`} style={!transparent ? { color: PRIMARY } : {}} aria-label="Carrito">
            <ShoppingCart size={19} />
            <AnimatePresence>
              {cartCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#25D366] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount}</motion.span>}
            </AnimatePresence>
          </button>
          <button onClick={() => setMobileOpen(o => !o)} className={`lg:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all ${transparent ? "text-white hover:bg-white/15" : "text-foreground hover:bg-muted"}`}>
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-t border-border overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5 border border-border mb-2">
                <Search size={14} className="text-muted-foreground" />
                <input type="text" placeholder="Buscar productos..." className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            {/* Advisor phones mobile */}
            <div className="px-4 pb-2 flex gap-3">
              {ADVISORS.map(a => (
                <a key={a.wa} href={`tel:+57${a.phone}`} className="flex items-center gap-1 text-xs font-medium" style={{ color: PRIMARY }}>
                  <Phone size={10} /> {a.label}
                </a>
              ))}
            </div>
            <div className="px-3 pb-3 space-y-0.5">
              {NAV_ITEMS.map(item => {
                const hasChildren = "children" in item && item.children;
                return (
                  <div key={item.id}>
                    <div className="flex items-center">
                      <button onClick={() => { if (!hasChildren) { handleNav(item); } else { setExpandedCat(expandedCat === item.id ? null : item.id); } }}
                        className="flex-1 flex items-center gap-2 text-left px-3 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-muted text-foreground">
                        {item.label}
                      </button>
                      {hasChildren && (
                        <button onClick={() => setExpandedCat(expandedCat === item.id ? null : item.id)} className="px-3 py-3 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                          <ChevronDown size={15} className={`transition-transform ${expandedCat === item.id ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {expandedCat === item.id && hasChildren && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-4">
                          {(item as any).children.map((child: any) => (
                            <button key={child.label} onClick={() => handleChild(child)} className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                              <ChevronRight size={12} style={{ color: PRIMARY }} /> {child.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              <div className="pt-2">
                <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full px-4 py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm justify-center hover:bg-[#1ebe5d] transition-colors">
                  <WaIcon size={16} /> Contactar por WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("home");
  const [scrolled, setScrolled] = useState(false);
  const [activeCat, setActiveCat] = useState("smartwatch");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [view]);

  const navigate = (catId?: string, sub?: string | null, nextView?: View) => {
    if (catId) { setActiveCat(catId); setActiveSub(sub ?? null); setView("catalog"); }
    else if (nextView) { setView(nextView); }
  };

  const goHome = () => { setView("home"); };

  const addToCart = useCallback((product: Product, qty = 1, color?: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id && i.selectedColor === color);
      if (ex) return prev.map(i => i.id === product.id && i.selectedColor === color ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...product, quantity: qty, selectedColor: color }];
    });
    setToast(product.name.length > 26 ? product.name.slice(0, 26) + "…" : product.name);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const updateQty = (id: number, qty: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

  const waOrder = cartCount > 0 ? buildOrder(cart) : waGeneral;

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] bg-background overflow-x-hidden">
      <Header scrolled={scrolled} cartCount={cartCount} onCartOpen={() => setCartOpen(true)} view={view} activeCat={activeCat} onGoHome={goHome} onNavigate={navigate} />

      <AnimatePresence mode="wait">
        {/* ── Catalog page ── */}
        {view === "catalog" && (
          <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="pt-16">
            <ProductsSection activeCat={activeCat} activeSub={activeSub} onCatChange={id => { setActiveCat(id); setActiveSub(null); }} onSubChange={setActiveSub} onSelect={setSelectedProduct} onAdd={p => addToCart(p)} />
          </motion.div>
        )}

        {/* ── Events ── */}
        {view === "eventos" && <EventosPage key="eventos" onProductSelect={setSelectedProduct} onAdd={p => addToCart(p)} />}

        {/* ── Promociones ── */}
        {view === "promociones" && <PromocionesPage key="promociones" onSelect={setSelectedProduct} onAdd={p => addToCart(p)} />}

        {/* ── Distribuidores ── */}
        {view === "dist-info" && <DistribuidoresInfo key="dist-info" />}
        {view === "dist-contacto" && <DistribuidoresContacto key="dist-contacto" />}

        {/* ── Landing / Home ── */}
        {view === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

            {/* Hero — floating products */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: HERO_BG }}>
              {/* Dot grid background */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "38px 38px" }} />

              {/* Soft ambient blobs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -left-24 w-[600px] h-[600px] rounded-full opacity-[0.12]" style={{ background: "radial-gradient(circle, #4a7fd4, transparent 70%)" }} />
                <div className="absolute -bottom-32 -right-16 w-[500px] h-[500px] rounded-full opacity-[0.10]" style={{ background: "radial-gradient(circle, #2260b0, transparent 70%)" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #93c5fd, transparent 70%)" }} />
              </div>

              {/* ── Left images (desktop only) ── */}

              {/* Top-left: Smartwatch */}
              <motion.div className="hidden xl:block absolute" style={{ top: "12%", left: "9%", zIndex: 2 }}
                initial={{ opacity: 0, x: -55 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.95, delay: 0.4, ease }}>
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}>
                  <div className="relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[270px] h-[270px] rounded-full blur-3xl opacity-[0.22] pointer-events-none bg-white" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] rounded-full blur-xl opacity-[0.18] pointer-events-none bg-white" />
                    <ImageWithFallback
                      src={img2} alt="Smartwatch"
                      className="relative w-[250px] object-contain"
                      style={{ filter: "drop-shadow(0 8px 32px rgba(180,210,255,0.22))" }}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Bottom-left: Diadema headphones */}
              <motion.div className="hidden xl:block absolute" style={{ bottom: "9%", left: "11%", zIndex: 2 }}
                initial={{ opacity: 0, x: -55 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.95, delay: 0.65, ease }}>
                <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 4.9, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}>
                  <div className="relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full blur-3xl opacity-[0.24] pointer-events-none bg-white" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full blur-xl opacity-[0.20] pointer-events-none bg-white" />
                    <ImageWithFallback
                      src={img3} alt="Diadema"
                      className="relative w-[235px] object-contain"
                      style={{ filter: "drop-shadow(0 8px 28px rgba(255,255,255,0.10))" }}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* ── Right images (desktop only) ── */}

              {/* Top-right: Speaker */}
              <motion.div className="hidden xl:block absolute" style={{ top: "10%", right: "9%", zIndex: 2 }}
                initial={{ opacity: 0, x: 55 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.95, delay: 0.52, ease }}>
                <motion.div animate={{ y: [0, -22, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}>
                  <div className="relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[210px] rounded-full blur-3xl opacity-[0.22] pointer-events-none bg-white" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[95px] rounded-full blur-xl opacity-[0.20] pointer-events-none bg-white" />
                    <ImageWithFallback
                      src={img4} alt="Parlante"
                      className="relative w-[255px] object-contain"
                      style={{ filter: "drop-shadow(0 8px 28px rgba(255,255,255,0.10))" }}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Bottom-right: Earbuds */}
              <motion.div className="hidden xl:block absolute" style={{ bottom: "10%", right: "11%", zIndex: 2 }}
                initial={{ opacity: 0, x: 55 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.95, delay: 0.78, ease }}>
                <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}>
                  <div className="relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full blur-3xl opacity-[0.24] pointer-events-none bg-white" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full blur-xl opacity-[0.20] pointer-events-none bg-white" />
                    <ImageWithFallback
                      src={img5} alt="Earbuds"
                      className="relative w-[230px] object-contain"
                      style={{ filter: "drop-shadow(0 8px 28px rgba(255,255,255,0.10))" }}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* ── Center text — always visible ── */}
              <div className="relative z-10 flex flex-col items-center text-center px-8 pt-24 pb-16 lg:pt-14 lg:pb-0 w-full xl:max-w-[380px]">
                <motion.div initial={{ opacity: 0, scale: 0.78 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease }} className="mb-6">
                  <div className="w-24 h-24 bg-white rounded-3xl overflow-hidden p-2.5 shadow-2xl mx-auto mb-5">
                    <ImageWithFallback src={movisunLogo} alt="Movisun" className="w-full h-full object-contain" />
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                    <span className="text-blue-200 text-xs font-semibold tracking-[0.25em] uppercase">Movisun Nariño</span>
                  </div>
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease }}
                  className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.04] tracking-tight mb-4 text-white">
                  Tecnología
                  <span className="block text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #7ab8ff, #c3d9ff)" }}>premium</span>
                  en tus manos
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease }}
                  className="text-blue-100/75 text-base leading-relaxed mb-8 max-w-[320px]">
                  Smartwatches, audio premium, cargadores rápidos y accesorios Bluetooth. Entrega en todo Nariño.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.42, ease }}
                  className="flex flex-wrap justify-center gap-3 mb-28">
                  <button onClick={() => navigate("smartwatch")} className="flex items-center gap-1.5 bg-white font-bold text-xs py-2.5 px-5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg" style={{ color: PRIMARY }}>
                    Explorar catálogo <ArrowRight size={14} />
                  </button>
                  <button onClick={() => setVideoOpen(true)} className="flex items-center gap-2 border border-white/25 bg-white/10 backdrop-blur text-white font-semibold text-xs py-2.5 px-4 rounded-xl hover:bg-white/20 transition-colors">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"><Play size={9} fill="white" /></div>
                    Ver presentación
                  </button>
                </motion.div>

              </div>

              {/* Scroll cue */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
                <p className="text-blue-300/35 text-[10px] tracking-[0.25em] uppercase">Desliza</p>
                <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
                  <div className="w-1 h-2 bg-white/40 rounded-full" />
                </motion.div>
              </motion.div>
            </section>

            {/* Carousel */}
            <ImageCarousel onCategorySelect={id => navigate(id)} />

            {/* Category cards */}
            <CategoryCardsSection onCategorySelect={id => navigate(id)} />

            {/* New products carousel */}
            <NewProductsCarousel onSelect={setSelectedProduct} onAdd={p => addToCart(p)} />

            {/* Brand video */}
            <BrandVideoSection />

            {/* Features */}
            <section className="py-20 px-4" style={{ background: "#f5f7fc" }}>
              <div className="max-w-4xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="text-center mb-12">
                  <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: PRIMARY }}>Por qué elegirnos</p>
                  <h2 className="text-3xl font-extrabold text-foreground">Movisun, tu aliado tecnológico</h2>
                </motion.div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {[
                    { icon: <CheckCircle size={26} />, title: "Calidad garantizada", desc: "Todos nuestros productos tienen garantía y soporte post-venta." },
                    { icon: <WaIcon size={26} />, title: "Pedidos por WhatsApp", desc: "Realiza tu pedido de forma rápida y sencilla directo al WhatsApp." },
                    { icon: <Package size={26} />, title: "Envíos a Nariño", desc: "Hacemos llegar tu pedido a cualquier municipio de Nariño." },
                  ].map(f => (
                    <motion.div key={f.title} variants={fadeUp} className="text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-white" style={{ background: PRIMARY }}>{f.icon}</div>
                      <h3 className="font-extrabold text-foreground mb-2">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4" style={{ background: `linear-gradient(135deg, #071120 0%, ${PRIMARY} 100%)` }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">¿Listo para tu próximo accesorio?</h2>
                <p className="text-blue-200/80 text-base mb-6">Escríbenos y te asesoramos para encontrar el producto ideal.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {ADVISORS.map(a => (
                    <a key={a.wa} href={`https://wa.me/${a.wa}?text=${encodeURIComponent(`Hola! Soy ${a.label} de Movisun Nariño. ¿En qué te puedo ayudar?`)}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3.5 px-7 rounded-2xl transition-colors text-sm">
                      <WaIcon size={17} /> {a.label}: +57 {a.phone}
                    </a>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-4" style={{ background: "#07111f" }}>
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden p-1.5">
                      <ImageWithFallback src={movisunLogo} alt="Movisun" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-white font-extrabold">MOVISUN Nariño</p>
                      <p className="text-blue-400 text-xs">Tu tienda de tecnología</p>
                      <div className="flex gap-3 mt-1">
                        {ADVISORS.map(a => <a key={a.wa} href={`tel:+57${a.phone}`} className="text-blue-300 text-xs hover:text-white transition-colors flex items-center gap-1"><Phone size={9} />{a.phone}</a>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-8">
                    {CATEGORIES.map(c => (
                      <div key={c.id}>
                        <p className="text-white text-xs font-bold mb-2">{c.label}</p>
                        {c.subcategories.map(s => (
                          <button key={s.label} onClick={() => navigate(c.id, s.label)} className="block text-blue-400 hover:text-blue-200 text-xs py-0.5 transition-colors">{s.label}</button>
                        ))}
                      </div>
                    ))}
                    <div>
                      <p className="text-white text-xs font-bold mb-2">Movisun</p>
                      {[["Promociones", "promociones"], ["Eventos", "eventos"], ["Distribuidores", "dist-info"]].map(([l, v]) => (
                        <button key={v} onClick={() => navigate(undefined, undefined, v as View)} className="block text-blue-400 hover:text-blue-200 text-xs py-0.5 transition-colors">{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-6 text-center text-blue-500 text-xs">© 2025 Movisun Nariño · Todos los derechos reservados</div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp */}
      <a href={waOrder} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-4 py-3 rounded-2xl shadow-2xl transition-all hover:scale-105">
        <WaIcon size={19} />
        <span className="text-sm font-bold hidden sm:block">{cartCount > 0 ? "Enviar pedido" : "WhatsApp"}</span>
        <AnimatePresence>
          {cartCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="bg-white text-[#25D366] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</motion.span>}
        </AnimatePresence>
      </a>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-foreground text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap">
            <CheckCircle size={13} className="text-[#25D366]" /> Agregado: {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>{videoOpen && <VideoModal key="vid" onClose={() => setVideoOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{selectedProduct && <ProductModal key="prod" product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />}</AnimatePresence>
      <AnimatePresence>{cartOpen && <CartDrawer key="cart" cart={cart} onClose={() => setCartOpen(false)} onUpdate={updateQty} onRemove={removeItem} />}</AnimatePresence>
    </div>
  );
}
