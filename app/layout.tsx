import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MockDataBanner from '@/components/common/MockDataBanner';
import { DataProvider } from '@/context/DataContext';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Quảng Ngãi Tourism Map - Cổng Thông Tin & Bản Đồ Số Du Lịch Tỉnh Quảng Ngãi',
  description:
    'Khám phá danh lam thắng cảnh, vương quốc tỏi Lý Sơn, núi Thiên Ấn, bãi biển Mỹ Khê và văn hóa Sa Huỳnh tỉnh Quảng Ngãi với bản đồ số tương tác thông minh.',
  keywords: [
    'du lịch Quảng Ngãi',
    'bản đồ du lịch Quảng Ngãi',
    'bản đồ số',
    'địa điểm du lịch Quảng Ngãi',
    'Lý Sơn',
    'Thiên Ấn',
  ],
};

const EXTENSION_CLEANUP_SCRIPT = `
(function() {
  try {
    var extensionAttrs = [
      'bis_skin_checked',
      'bis_register',
      'data-cc-prev-cursor',
      'cz-shortcut-listen',
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'fdprocessedid'
    ];

    var cleanElement = function(el) {
      if (!el || !el.removeAttribute) return;
      for (var i = 0; i < extensionAttrs.length; i++) {
        var attr = extensionAttrs[i];
        if (el.hasAttribute && el.hasAttribute(attr)) {
          el.removeAttribute(attr);
        }
      }
      if (el.attributes) {
        for (var j = el.attributes.length - 1; j >= 0; j--) {
          var a = el.attributes[j];
          if (a && a.name && (
            a.name.indexOf('__processed_') === 0 ||
            a.name.indexOf('bis_') === 0 ||
            a.name.indexOf('data-cc-') === 0
          )) {
            el.removeAttribute(a.name);
          }
        }
      }
    };

    var cleanTree = function(root) {
      if (!root) return;
      cleanElement(root);
      if (root.querySelectorAll) {
        var elements = root.querySelectorAll('*');
        for (var k = 0; k < elements.length; k++) {
          cleanElement(elements[k]);
        }
      }
    };

    cleanTree(document.documentElement);

    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function(mutations) {
        for (var m = 0; m < mutations.length; m++) {
          var mutation = mutations[m];
          if (mutation.type === 'attributes') {
            cleanElement(mutation.target);
          } else if (mutation.type === 'childList') {
            for (var c = 0; c < mutation.addedNodes.length; c++) {
              var node = mutation.addedNodes[c];
              if (node.nodeType === 1) {
                cleanTree(node);
              }
            }
          }
        }
      });

      observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: extensionAttrs
      });

      window.addEventListener('DOMContentLoaded', function() {
        cleanTree(document.documentElement);
        setTimeout(function() {
          observer.disconnect();
        }, 3000);
      });
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: EXTENSION_CLEANUP_SCRIPT,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50 text-slate-800 selection:bg-teal-100 selection:text-teal-900 font-sans"
      >
        <SmoothScrollProvider>
          <DataProvider>
            <MockDataBanner />
            <Navbar />
            <main className="flex-1 flex flex-col min-w-0">{children}</main>
            <Footer />
          </DataProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
