'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase/client';
import HeroCarousel from './HeroCarousel';
import CategoryCard from './CategoryCard';
import ProductCard from './ProductCard';
import NewsletterSection from './NewsletterSection';
import SocialMediaSection from './SocialMediaSection';
import SupportSection from './SupportSection';
import CountrySelector from './CountrySelector';
import { Currency } from '@/utils/currencyConverter';

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  badge?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  inStock: boolean;
  imageAlt?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  launchDate?: string;
}

interface Category {
  title: string;
  description: string;
  image: string;
  alt: string;
  href: string;
  productCount: number;
}

export default function HomeInteractive() {
  const { addItem } = useCart();
  const [selectedCountry, setSelectedCountry] = useState<Currency>({
    code: 'RWF',
    name: 'Rwanda',
    symbol: 'FRW',
    flag: '🇷🇼',
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [comingSoonProducts, setComingSoonProducts] = useState<Product[]>([]);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  useEffect(() => {
    setIsHydrated(true);
    const savedProducts = localStorage.getItem('customProducts');
    if (savedProducts) {
      setCustomProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Fetch products from Supabase database
  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .in('stock_status', ['in_stock', 'low_stock'])
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) throw error;

        if (data && data.length > 0) {
          setDbProducts(
            data.map((product: any) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              image:
                product.image_url ||
                'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
              alt: product.image_alt || `${product.name} product image`,
              inStock: product.stock_status !== 'out_of_stock',
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching db products:', error);
      }
    };

    fetchDbProducts();
  }, []);

  useEffect(() => {
    const fetchComingSoonProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('coming_soon', true)
          .order('launch_date', { ascending: true })
          .limit(6);

        if (error) throw error;

        if (data) {
          setComingSoonProducts(
            data.map((product: any) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              image:
                product.image_url ||
                'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
              alt: product.image_alt || `${product.name} image`,
              imageAlt: product.image_alt || `${product.name} image`,
              category: product.category || 'Electronics',
              rating: product.average_rating || 0,
              reviewCount: product.review_count || 0,
              description: product.description,
              launchDate: product.launch_date,
              inStock: false,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching coming soon products:', error);
      }
    };

    fetchComingSoonProducts();
  }, []);

  const featuredProducts: FeaturedProduct[] = [
    {
      id: '1',
      name: 'JBL Clip 5 Portable Speaker',
      price: 89000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_116019093-1765274487348.png',
      alt: 'JBL Clip 5 ultra-portable Bluetooth speaker with carabiner clip',
      badge: 'New Arrival',
    },
    {
      id: '2',
      name: 'JBL Charge 6 Waterproof Speaker',
      price: 245000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_12a661698-1768154689180.png',
      alt: 'JBL Charge 6 portable waterproof Bluetooth speaker with power bank',
      badge: 'Best Seller',
    },
    {
      id: '3',
      name: 'S612W Smartbarry Watch',
      price: 125000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_10fbfa88d-1768383436666.png',
      alt: 'S612W Smartbarry smartwatch with fitness tracking and notifications',
      badge: 'Great Value',
    },
  ];

  const categories = [
    {
      id: '1',
      name: 'Smartphones',
      slug: 'smartphones',
      image: 'https://images.unsplash.com/photo-1537976789938-88ed22bb4bd7',
      alt: 'Modern smartphones with sleek design and advanced features displayed on wooden surface',
      productCount: 45,
    },
    {
      id: '2',
      name: 'Laptops',
      slug: 'laptops',
      image: 'https://images.unsplash.com/photo-1623679072629-3aaa0192a391',
      alt: 'High-performance laptop with backlit keyboard open on modern desk with coffee cup',
      productCount: 32,
    },
    {
      id: '3',
      name: 'Accessories',
      slug: 'accessories',
      image: 'https://images.unsplash.com/photo-1656409541061-ed5ada98aada',
      alt: 'Collection of electronic accessories including headphones, chargers, and cases on white background',
      productCount: 128,
    },
    {
      id: '4',
      name: 'Tablets',
      slug: 'tablets',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_13debce79-1766924403192.png',
      alt: 'Sleek tablet device with stylus pen showing creative design app on screen',
      productCount: 28,
    },
    {
      id: '5',
      name: 'Customer Experience',
      slug: 'customer-experience-enhancement-hub',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1051bde75-1764664294344.png',
      alt: 'Professional customer service representative with headset helping customers with digital tools',
      productCount: 0,
      isFeatured: true,
    },
  ];

  const products: Product[] = [
    {
      id: '4',
      name: 'JBL Flip 7 Portable Speaker',
      price: 198000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1a3e2552a-1766568154162.png',
      alt: 'JBL Flip 7 portable Bluetooth speaker with 360-degree sound',
      inStock: true,
    },
    {
      id: '5',
      name: 'JBL Onyx 9 Premium Speaker',
      price: 485000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_104f5c8a1-1766093795336.png',
      alt: 'JBL Onyx 9 premium wireless speaker with elegant circular design',
      inStock: true,
    },
    {
      id: '6',
      name: 'JBL Clip 4 Ultra-Portable Speaker',
      price: 72000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_17f0d2df1-1768383435971.png',
      alt: 'JBL Clip 4 compact Bluetooth speaker with integrated carabiner',
      inStock: true,
    },
    {
      id: '7',
      name: 'JBL Charge 5 Waterproof Speaker',
      price: 225000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_116019093-1765274487348.png',
      alt: 'JBL Charge 5 portable waterproof speaker with built-in power bank',
      inStock: true,
    },
    {
      id: '8',
      name: 'JBL Onyx 8 Wireless Speaker',
      price: 445000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ea3d3eff-1768383435436.png',
      alt: 'JBL Onyx 8 premium wireless speaker with studio-quality sound',
      inStock: true,
    },
    {
      id: '9',
      name: 'JBL Flip 6 Bluetooth Speaker',
      price: 174000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_12a661698-1768154689180.png',
      alt: 'JBL Flip 6 portable Bluetooth speaker with IP67 waterproof rating',
      inStock: true,
    },
    {
      id: '10',
      name: 'Depin 20000mAh Power Bank + 12W Fast Charging',
      price: 58000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_185f1d1ca-1766811196300.png',
      alt: 'Depin 20000mAh portable power bank with 12W fast charging technology',
      inStock: true,
    },
    {
      id: '11',
      name: 'Depin 30000mAh Power Bank + 12W Fast Charging',
      price: 78000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1791c52da-1768383436034.png',
      alt: 'Depin 30000mAh high-capacity power bank with 12W fast charging',
      inStock: true,
    },
    {
      id: '12',
      name: 'TWS Q17 Earbuds',
      price: 45000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_17fe09f80-1768383437033.png',
      alt: 'TWS Q17 true wireless stereo earbuds with charging case',
      inStock: true,
    },
    {
      id: '13',
      name: 'Pocket Video Light for Phones',
      price: 35000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1301f61e9-1768383438161.png',
      alt: 'Compact pocket LED video light for smartphone photography and videography',
      inStock: true,
    },
    {
      id: '14',
      name: 'MacBook Pro 96W USB-C Charger',
      price: 116000,
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1003bbeff-1768383437558.png',
      alt: 'Apple 96W USB-C power adapter for MacBook Pro with cable',
      inStock: true,
    },
    {
      id: '15',
      name: 'Premium Leather Phone Case',
      price: 43500,
      image: 'https://images.unsplash.com/photo-1662569074546-d99afa414862',
      alt: 'Premium leather phone case with card holder slots and magnetic closure',
      inStock: true,
    },
  ];

  const allProducts = [...products, ...customProducts, ...dbProducts];

  const handleAddToCart = (productId: string) => {
    const product = [...featuredProducts, ...allProducts].find((p) => p.id === productId);
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    }
  };

  const handleCountryChange = (country: Currency) => {
    setSelectedCountry(country);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-[600px] bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
        <div className="flex justify-end mb-4">
          <CountrySelector onCountryChange={handleCountryChange} />
        </div>

        <section aria-label="Featured products carousel">
          <HeroCarousel products={featuredProducts} currencyCode={selectedCountry.code} />
        </section>

        {/* Categories Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-lg text-gray-600">
                Explore our wide range of electronics and enhanced customer experience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories?.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  image={category.image}
                  alt={category.alt}
                  productCount={category.productCount}
                  isFeatured={category.isFeatured}
                />
              ))}
            </div>
          </div>
        </div>

        <section aria-label="Featured products">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked selection of our most popular items, available now with fast shipping.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                currencyCode={selectedCountry.code}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        {/* Coming Soon Section */}
        {comingSoonProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                <p className="text-gray-600">Be the first to get these exciting new products</p>
              </div>
              <button
                onClick={() => setShowComingSoon(!showComingSoon)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {showComingSoon ? 'Hide' : 'View All'}
              </button>
            </div>

            {showComingSoon && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {comingSoonProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow relative"
                  >
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Coming Soon
                      </span>
                    </div>

                    <div className="relative h-64 bg-gray-200">
                      <img
                        src={product.image}
                        alt={product.imageAlt}
                        className="w-full h-full object-cover opacity-75"
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      {product.launchDate && (
                        <div className="flex items-center gap-2 text-sm text-indigo-600 mb-4">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            Launch:{' '}
                            {new Date(product.launchDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      <button
                        className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        disabled
                      >
                        Notify Me
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section aria-label="Newsletter subscription">
          <NewsletterSection />
        </section>

        <section aria-label="Customer support">
          <SupportSection />
        </section>

        <section aria-label="Social media links">
          <SocialMediaSection />
        </section>
      </div>
    </div>
  );
}
