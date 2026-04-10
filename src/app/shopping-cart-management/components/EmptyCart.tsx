'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon name="ShoppingCartIcon" size={48} className="text-muted-foreground" />
      </div>
      <h2 className="font-heading font-semibold text-2xl text-foreground mb-3 text-center">
        Your Cart is Empty
      </h2>
      <p className="caption text-muted-foreground text-center max-w-md mb-8">
        Looks like you haven&apos;t added any items to your cart yet. Start shopping to find amazing
        products!
      </p>
      <Link
        href="/home-product-showcase"
        className="touch-target inline-flex items-center gap-2 bg-accent text-accent-foreground font-heading font-semibold text-base px-8 py-3 rounded-md transition-smooth hover:opacity-90 active:scale-97 elevation-1"
      >
        <Icon name="ShoppingBagIcon" size={20} />
        Start Shopping
      </Link>
      <div className="mt-12 w-full max-w-2xl">
        <h3 className="font-heading font-semibold text-lg text-foreground mb-4 text-center">
          Featured Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: '1',
              name: 'iPhone 15 Pro Max',
              price: 1199,
              image:
                'https://img.rocket.new/generatedImages/rocket_gen_img_169bd7559-1767283843614.png',
              alt: 'Silver iPhone 15 Pro Max with triple camera system on white background',
            },
            {
              id: '2',
              name: 'Premium Phone Case',
              price: 29.99,
              image: 'https://images.unsplash.com/photo-1698314439902-70a5966b8cc4',
              alt: 'Black leather phone case with card holder on wooden surface',
            },
            {
              id: '3',
              name: 'Wireless Charger',
              price: 49.99,
              image:
                'https://img.rocket.new/generatedImages/rocket_gen_img_1c97740fb-1766833020917.png',
              alt: 'White circular wireless charging pad with LED indicator on desk',
            },
          ]?.map((product) => (
            <Link
              key={product?.id}
              href="/product-category-listing"
              className="bg-card rounded-lg overflow-hidden elevation-1 transition-smooth hover:elevation-2 active:scale-97"
            >
              <div className="aspect-square bg-muted overflow-hidden">
                <img
                  src={product?.image}
                  alt={product?.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h4 className="font-heading font-medium text-sm text-foreground mb-1 line-clamp-1">
                  {product?.name}
                </h4>
                <p className="font-data text-sm text-accent">${product?.price?.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;
