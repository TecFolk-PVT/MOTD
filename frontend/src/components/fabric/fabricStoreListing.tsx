"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, Variants } from "framer-motion";
import Lenis from "lenis";
import * as images from '../../../public/images/ImageIndex';

// Types
interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    color: string;
    material: string;
    inStock: boolean;
    image: string;
    description: string;
    origin: string;
}

// Mock Products Data
const products: Product[] = [
    { id: 1, name: "Royal Gold Damask", price: 1200, category: "silk", color: "gold", material: "Silk Brocade", inStock: true, image: images.fab1.src, description: "Exquisite gold damask silk brocade handcrafted by master artisans", origin: "Dubai, UAE" },
    { id: 2, name: "Midnight Floral", price: 950, category: "velvet", color: "black", material: "Premium Velvet", inStock: true, image: images.fab2.src, description: "Deep midnight floral velvet with subtle shimmer", origin: "Abu Dhabi, UAE" },
    { id: 3, name: "Diamond Geometric", price: 680, category: "cotton", color: "ivory", material: "Washable Cotton", inStock: true, image: images.fab3.src, description: "Contemporary geometric pattern on breathable cotton", origin: "Sharjah, UAE" },
    { id: 4, name: "Golden Peony", price: 1450, category: "embroidered", color: "gold", material: "Embroidered Tulle", inStock: true, image: images.fab4.src, description: "Hand-embroidered peony motifs on fine tulle", origin: "Dubai, UAE" },
    { id: 5, name: "Pearl Lattice", price: 1100, category: "silk", color: "ivory", material: "Silk Jacquard", inStock: true, image: images.fab5.src, description: "Pearlescent lattice pattern on premium silk jacquard", origin: "Ras Al Khaimah, UAE" },
    { id: 6, name: "Charcoal Shadow", price: 980, category: "velvet", color: "black", material: "Luxury Velvet", inStock: true, image: images.fab6.src, description: "Subtle charcoal shadow effect on luxury velvet", origin: "Ajman, UAE" },
    { id: 7, name: "Pristine Twill", price: 550, category: "cotton", color: "ivory", material: "Egyptian Cotton", inStock: true, image: images.fab1.src, description: "Premium Egyptian cotton twill, breathable and refined", origin: "Umm Al Quwain, UAE" },
    { id: 8, name: "Vintage Rose", price: 1320, category: "embroidered", color: "gold", material: "Embroidered Silk", inStock: true, image: images.fab2.src, description: "Romantic vintage rose embroidery on pure silk", origin: "Fujairah, UAE" },
    { id: 9, name: "Opal Damask", price: 1250, category: "silk", color: "ivory", material: "Premium Silk", inStock: true, image: images.fab3.src, description: "Iridescent opal damask pattern on premium silk", origin: "Dubai, UAE" },
    { id: 10, name: "Obsidian Floral", price: 1020, category: "velvet", color: "black", material: "Embossed Velvet", inStock: true, image: images.fab4.src, description: "Dark obsidian floral embossed pattern on velvet", origin: "Abu Dhabi, UAE" },
    { id: 11, name: "Alabaster Maze", price: 620, category: "cotton", color: "ivory", material: "Fine Cotton", inStock: true, image: images.fab4.src, description: "Intricate maze pattern on fine alabaster cotton", origin: "Sharjah, UAE" },
    { id: 12, name: "Gilded Flora", price: 1580, category: "embroidered", color: "gold", material: "Hand-Stitched Silk", inStock: true, image: images.fab6.src, description: "Luxurious hand-stitched gilded floral motifs", origin: "Dubai, UAE" },
];

const colorOptions = [
    { name: "Pearl Ivory", value: "ivory", bg: "#F5F0E8" },
    { name: "Desert Sand", value: "sand", bg: "#E8E4DC" },
    { name: "Midnight Oil", value: "black", bg: "#1A1A18" },
    { name: "Royal Gold", value: "gold", bg: "#C9A96E" },
];

const categoryOptions = [
    { id: "silk", label: "PURE SILK", count: 4 },
    { id: "cotton", label: "COTTON", count: 3 },
    { id: "velvet", label: "VELVET", count: 3 },
    { id: "embroidered", label: "HAUTE EMBROIDERY", count: 3 },
];

const priceRanges = [
    { id: "under-500", label: "UNDER AED 500", min: 0, max: 500 },
    { id: "500-1000", label: "AED 500 – 1,000", min: 500, max: 1000 },
    { id: "above-1000", label: "ABOVE AED 1,000", min: 1000, max: Infinity },
];

interface FilterState {
    categories: string[];
    colors: string[];
    priceRange: string | null;
    inStockOnly: boolean;
}

// ─── Animation Variants with correct TypeScript types ────────────────────
const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        },
    },
};

const cardVariants = (i: number): Variants => ({
    hidden: {
        opacity: 0,
        y: 50,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            delay: i * 0.03,
            ease: [0.25, 0.1, 0.1, 1],
        },
    },
});

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.1, 1] },
    },
};

const sidebarVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

const modalVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: {
        scale: 0.9,
        opacity: 0,
        transition: { duration: 0.2 },
    },
};

// ─── Search-off SVG ───────────────────────────────────────────────────────────
const SearchOffIcon = () => (
    <motion.svg
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-12 h-12 text-[#8A8A80] mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M3 3l18 18M10 5a5 5 0 014.9 6.02M6.34 6.34A5 5 0 0010 15a5 5 0 003.66-1.59" />
    </motion.svg>
);

// ─── Checkbox component with animation ──────────────────────────────────────
const CustomCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <motion.button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onChange}
        whileTap={{ scale: 0.95 }}
        className={`
      w-4 h-4 shrink-0 border transition-all duration-150 flex items-center justify-center
      ${checked ? "bg-black border-black" : "bg-transparent border-[#C8C4BC] hover:border-black"}
    `}
    >
        {checked && (
            <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2.5 h-2.5 text-white"
                viewBox="0 0 10 8"
                fill="none"
            >
                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
        )}
    </motion.button>
);

// ─── Radio component with animation ─────────────────────────────────────────
const CustomRadio = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <motion.button
        type="button"
        role="radio"
        aria-checked={checked}
        onClick={onChange}
        whileTap={{ scale: 0.95 }}
        className={`
      w-4 h-4 shrink-0 rounded-full border transition-all duration-150 flex items-center justify-center
      ${checked ? "border-black" : "border-[#C8C4BC] hover:border-black"}
    `}
    >
        {checked && (
            <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-black block"
            />
        )}
    </motion.button>
);

// ─── Section label ────────────────────────────────────────────────────────────
const FilterLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[10px] tracking-[0.22em] font-medium text-black uppercase mb-3 pb-2.5 border-b border-[#E4E0D8] w-full">
        {children}
    </p>
);

export default function FabricStorePage() {
    const [mounted, setMounted] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        categories: [],
        colors: [],
        priceRange: null,
        inStockOnly: false,
    });

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    // Initialize Lenis
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        setMounted(true);
    }, []);

    const productsPerPage = 12;

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredProducts = products.filter(p => {
        if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
        if (filters.colors.length > 0 && !filters.colors.includes(p.color)) return false;
        if (filters.priceRange) {
            const range = priceRanges.find(r => r.id === filters.priceRange);
            if (range && (p.price < range.min || p.price > range.max)) return false;
        }
        if (filters.inStockOnly && !p.inStock) return false;
        return true;
    });

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
    const hasActiveFilters = filters.categories.length > 0 || filters.colors.length > 0 || filters.priceRange !== null || filters.inStockOnly;

    const toggleCategory = (id: string) => {
        setFilters(prev => ({ ...prev, categories: prev.categories.includes(id) ? prev.categories.filter(c => c !== id) : [...prev.categories, id] }));
        setCurrentPage(1);
    };
    const toggleColor = (val: string) => {
        setFilters(prev => ({ ...prev, colors: prev.colors.includes(val) ? prev.colors.filter(c => c !== val) : [...prev.colors, val] }));
        setCurrentPage(1);
    };
    const setPriceRange = (id: string) => {
        setFilters(prev => ({ ...prev, priceRange: prev.priceRange === id ? null : id }));
        setCurrentPage(1);
    };
    const toggleInStock = () => {
        setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }));
        setCurrentPage(1);
    };
    const clearAllFilters = () => {
        setFilters({ categories: [], colors: [], priceRange: null, inStockOnly: false });
        setCurrentPage(1);
    };
    const handlePageChange = (value: number) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!mounted) return null;

    // ── Sidebar content ───────────────────────────────────────────────────────
    const SidebarContent = () => (
        <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8"
        >
            {/* Category */}
            <motion.div variants={fadeInUp}>
                <FilterLabel>Category</FilterLabel>
                <div className="flex flex-col gap-3">
                    {categoryOptions.map(cat => (
                        <motion.label
                            key={cat.id}
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <CustomCheckbox checked={filters.categories.includes(cat.id)} onChange={() => toggleCategory(cat.id)} />
                            <span className="flex-1 text-[11px] tracking-[0.14em] uppercase text-black group-hover:opacity-60 transition-opacity">
                                {cat.label}
                            </span>
                            <span className="text-[10px] text-[#8A8A80] font-mono">({cat.count})</span>
                        </motion.label>
                    ))}
                </div>
            </motion.div>

            {/* Color */}
            <motion.div variants={fadeInUp}>
                <FilterLabel>Color Palette</FilterLabel>
                <div className="flex flex-wrap gap-3">
                    {colorOptions.map(c => (
                        <motion.button
                            key={c.value}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            title={c.name}
                            onClick={() => toggleColor(c.value)}
                            className="group relative w-8 h-8 rounded-full transition-transform duration-200"
                            style={{
                                backgroundColor: c.bg,
                                boxShadow: filters.colors.includes(c.value)
                                    ? "0 0 0 2px #000, 0 0 0 4px rgba(0,0,0,0.12)"
                                    : "0 0 0 1px #D4D0C8",
                            }}
                        >
                            {filters.colors.includes(c.value) && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <svg className="w-3 h-3" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4l3 3 5-6" stroke={c.value === "ivory" || c.value === "sand" ? "#000" : "#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.span>
                            )}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Price Range */}
            <motion.div variants={fadeInUp}>
                <FilterLabel>Price Range</FilterLabel>
                <div className="flex flex-col gap-3">
                    {priceRanges.map(r => (
                        <motion.label
                            key={r.id}
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <CustomRadio checked={filters.priceRange === r.id} onChange={() => setPriceRange(r.id)} />
                            <span className="text-[11px] tracking-[0.14em] uppercase font-mono text-black group-hover:opacity-60 transition-opacity">
                                {r.label}
                            </span>
                        </motion.label>
                    ))}
                </div>
            </motion.div>

            {/* Availability */}
            <motion.div variants={fadeInUp}>
                <FilterLabel>Availability</FilterLabel>
                <motion.label whileHover={{ x: 4 }} className="flex items-center gap-3 cursor-pointer group">
                    <CustomCheckbox checked={filters.inStockOnly} onChange={toggleInStock} />
                    <span className="text-[11px] tracking-[0.14em] uppercase text-black group-hover:opacity-60 transition-opacity">
                        In Stock Only
                    </span>
                </motion.label>
            </motion.div>

            {/* Clear */}
            {hasActiveFilters && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full py-3 px-4 border border-black text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-200 hover:bg-black hover:text-white"
                >
                    Clear All Filters
                </motion.button>
            )}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#FDFAF5]">

            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-0.5 bg-black z-50 origin-left"
                style={{ scaleX }}
            />

            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="px-4 sm:px-8 md:px-12 lg:px-16 py-14 md:py-20 lg:py-24 border-b border-[#E4E0D8]"
            >
                <motion.p
                    variants={fadeInUp}
                    className="text-[10px] tracking-[0.28em] uppercase text-[#7A7A72] mb-3"
                >
                    Curated Collection
                </motion.p>
                <motion.h1
                    variants={fadeInUp}
                    className="font-serif text-[42px] sm:text-[60px] md:text-[76px] lg:text-[88px] leading-[0.92] tracking-[-0.02em] text-black mb-5 uppercase"
                >
                    Mukhawar<br />
                    <span className="italic font-light">Fabrics</span>
                </motion.h1>
                <motion.p
                    variants={fadeInUp}
                    className="text-[#6A6A62] max-w-xl text-[14px] md:text-[16px] leading-relaxed"
                >
                    Exquisite traditional craftsmanship met with contemporary minimalism.
                    Explore our curated selection of high-end fabrics tailored in the GCC.
                </motion.p>
            </motion.div>

            {/* ── Mobile filter toggle ──────────────────────────────────────────── */}
            <div className="lg:hidden flex items-center justify-between px-4 sm:px-8 py-4 border-b border-[#E4E0D8] bg-[#FDFAF5] sticky top-0 z-30">
                <span className="text-[11px] tracking-[0.18em] uppercase text-[#6A6A62] font-mono">
                    {filteredProducts.length} Products
                </span>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setMobileFiltersOpen(o => !o)}
                    className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase border border-black px-4 py-2 hover:bg-black hover:text-white transition-all duration-200"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
                    </svg>
                    {mobileFiltersOpen ? "Hide" : "Filters"}
                    {hasActiveFilters && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1.5 h-1.5 rounded-full bg-black inline-block"
                        />
                    )}
                </motion.button>
            </div>

            {/* ── Mobile Filters Drawer ─────────────────────────────────────────── */}
            <AnimatePresence>
                {mobileFiltersOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden border-b border-[#E4E0D8] bg-[#FDFAF5] px-4 sm:px-8 py-8 overflow-hidden"
                    >
                        <SidebarContent />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main layout ───────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row px-4 sm:px-8 md:px-12 lg:px-16 py-10 md:py-14 gap-12 lg:gap-16">

                {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
                <aside className="hidden lg:block w-65 xl:w-70 shrink-0 self-start sticky top-8">
                    <SidebarContent />
                </aside>

                {/* ── Product Grid ────────────────────────────────────────────────── */}
                <div className="flex-1 min-w-0">

                    {/* Results bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between mb-8 pb-4 border-b border-[#E4E0D8]"
                    >
                        <p className="text-[11px] tracking-[0.18em] uppercase text-[#7A7A72] font-mono">
                            Showing {paginatedProducts.length} of {filteredProducts.length} products
                        </p>
                    </motion.div>

                    {filteredProducts.length === 0 ? (
                        /* ── Empty state ─────────────────────────────────────────────── */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center text-center py-28"
                        >
                            <SearchOffIcon />
                            <h3 className="text-[18px] md:text-[22px] uppercase tracking-widest text-black mb-3">
                                No Fabrics Found
                            </h3>
                            <p className="text-[#7A7A72] text-[13px] max-w-xs leading-relaxed mb-8">
                                Try adjusting your filters or search terms to find what you're looking for.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={clearAllFilters}
                                className="px-8 py-3 bg-black text-white text-[10px] tracking-[0.22em] uppercase hover:bg-[#2A2A28] transition-colors duration-200"
                            >
                                Clear All Filters
                            </motion.button>
                        </motion.div>
                    ) : (
                        <>
                            {/* ── Grid ──────────────────────────────────────────────────── */}
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-10"
                            >
                                {paginatedProducts.map((product, index) => (
                                    <motion.article
                                        key={product.id}
                                        variants={cardVariants(index)}
                                        className="group flex flex-col"
                                        onMouseEnter={() => setHoveredProduct(product.id)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-square overflow-hidden bg-[#F0EBE3]">
                                            <motion.img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                whileHover={{ scale: 1.06 }}
                                                transition={{ duration: 0.7, ease: "easeOut" }}
                                            />

                                            {/* Overlay */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: hoveredProduct === product.id ? 1 : 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center"
                                            >
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setQuickViewProduct(product)}
                                                    type="button"
                                                    className="bg-white text-black text-[10px] tracking-[0.22em] uppercase px-7 py-3 hover:bg-black hover:text-white transition-all duration-200"
                                                >
                                                    Quick View
                                                </motion.button>
                                            </motion.div>

                                            {/* Badge */}
                                            {product.inStock && (
                                                <motion.span
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    className="absolute top-3 right-3 bg-black text-white text-[8px] tracking-[0.18em] uppercase px-2.5 py-1"
                                                >
                                                    In Stock
                                                </motion.span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="pt-4 flex flex-col flex-1">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="text-[12px] tracking-[0.12em] uppercase text-black leading-snug">
                                                    {product.name}
                                                </h3>
                                                <span className="text-[12px] font-mono text-black whitespace-nowrap shrink-0">
                                                    AED {product.price.toLocaleString()}
                                                </span>
                                            </div>

                                            <p className="text-[10px] tracking-[0.16em] uppercase text-[#8A8A80] font-mono mb-2">
                                                {product.material}
                                            </p>

                                            <p className="hidden md:block text-[12px] text-[#6A6A62] leading-relaxed mb-3 flex-1">
                                                {product.description}
                                            </p>

                                            <div className="border-t border-[#E4E0D8] pt-3 mt-auto flex items-center justify-between">
                                                <span className="text-[10px] font-mono text-[#8A8A80]">
                                                    {product.origin}
                                                </span>
                                                <motion.button
                                                    whileHover={{ x: 4 }}
                                                    type="button"
                                                    className="text-[10px] tracking-[0.16em] uppercase text-black hover:opacity-50 transition-opacity duration-200 flex items-center gap-1"
                                                >
                                                    View Details
                                                    <span className="text-[12px] leading-none">→</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </motion.div>

                            {/* ── Pagination ────────────────────────────────────────────── */}
                            {totalPages > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-center justify-center gap-1 mt-16 pt-8 border-t border-[#E4E0D8]"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="w-9 h-9 flex items-center justify-center border border-[#E4E0D8] text-[11px] text-black disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:bg-black hover:text-white transition-all duration-150"
                                    >
                                        ←
                                    </motion.button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <motion.button
                                            key={page}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={() => handlePageChange(page)}
                                            className={`
                                                w-9 h-9 flex items-center justify-center border text-[11px] tracking-wider font-mono
                                                transition-all duration-150
                                                ${page === currentPage
                                                    ? "bg-black text-white border-black"
                                                    : "border-[#E4E0D8] text-black hover:border-black hover:bg-black hover:text-white"}
                                            `}
                                        >
                                            {page}
                                        </motion.button>
                                    ))}

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="w-9 h-9 flex items-center justify-center border border-[#E4E0D8] text-[11px] text-black disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:bg-black hover:text-white transition-all duration-150"
                                    >
                                        →
                                    </motion.button>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Quick View Modal ───────────────────────────────────────────────── */}
            <AnimatePresence>
                {quickViewProduct && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setQuickViewProduct(null)}
                            className="fixed inset-0 bg-black z-50"
                        />
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-[#FDFAF5] border border-[#E4E0D8] z-50 p-8"
                        >
                            <button
                                onClick={() => setQuickViewProduct(null)}
                                className="absolute top-4 right-4 text-2xl hover:opacity-50 transition-opacity"
                            >
                                ✕
                            </button>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="aspect-square bg-[#F0EBE3] overflow-hidden">
                                    <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="font-serif text-2xl mb-2">{quickViewProduct.name}</h2>
                                    <p className="text-[11px] tracking-[0.16em] uppercase text-[#8A8A80] font-mono mb-4">
                                        {quickViewProduct.material}
                                    </p>
                                    <p className="text-2xl font-mono mb-4">AED {quickViewProduct.price.toLocaleString()}</p>
                                    <p className="text-[13px] text-[#6A6A62] leading-relaxed mb-4">{quickViewProduct.description}</p>
                                    <div className="space-y-2 mb-6">
                                        <p><span className="text-[10px] tracking-[0.16em] uppercase font-mono">Origin:</span> {quickViewProduct.origin}</p>
                                        <p><span className="text-[10px] tracking-[0.16em] uppercase font-mono">Availability:</span> {quickViewProduct.inStock ? "In Stock" : "Out of Stock"}</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3 bg-black text-white text-[11px] tracking-[0.22em] uppercase"
                                    >
                                        Request Sample
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}