'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
  return (
    <nav className={`flex items-center text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index === 0 ? (
              // Home item (first item)
              <Link
                href={item.href || '#'}
                className={`inline-flex items-center text-gray-500 hover:text-gray-700 ${
                  item.active ? 'font-medium text-blue-600' : ''
                }`}
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                {item.label}
              </Link>
            ) : (
              // Other items
              <>
                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                {item.href && !item.active ? (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={`${
                    item.active ? 'font-medium text-blue-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
