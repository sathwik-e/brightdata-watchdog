'use client';

import { useState } from 'react';

// ---------------------------------------------------------------------------
// DOM snapshots shown in the Live Inspector panel
// ---------------------------------------------------------------------------

const ORIGINAL_DOM = `<div class="pricing-info">
  <span class="price-label">Current Price:</span>
  <span class="product-price" id="price-main">
    $1450.00
  </span>
</div>`;

const MUTATED_DOM = `<section class="dynamic-pricing-v2" data-module="pricing-core">
  <div class="scrambled-x9j3k">
    <span>Live Market Value</span>
    <div data-val="1450.00">
      <b class="price-text-obfuscated">$1,450.00</b>
      <span>USD</span>
    </div>
  </div>
</section>`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DemoTarget() {
  const [isMutated, setIsMutated] = useState(false);

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#333333', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Control Panel */}
      <div style={{ backgroundColor: '#111', color: '#fff', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
          WATCHDOG HONEYPOT TARGET
        </div>
        <button
          onClick={async () => {
            const nextMutated = !isMutated;
            setIsMutated(nextMutated);
            
            // Ping our backend so the Watchdog Dashboard knows it broke!
            await fetch('/api/status', {
              method: 'POST',
              body: JSON.stringify({ status: nextMutated ? 'broken' : 'healthy' }),
              headers: { 'Content-Type': 'application/json' }
            });
          }}
          style={{
            backgroundColor: isMutated ? '#ff6b6b' : '#10B981',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
          }}
        >
          {isMutated ? 'Restore Original Layout' : 'Simulate Retailer Layout Change'}
        </button>
      </div>

      {/* Mock Store */}
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <header style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 style={{ margin: 0, color: '#f96302', fontSize: '24px', fontWeight: 900 }}>HardwareDepot</h1>
        </header>

        <div style={{ display: 'flex', gap: '40px' }}>
          {/* Product image placeholder */}
          <div style={{ width: '400px', height: '400px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#aaa' }}>Product Image</span>
          </div>

          {/* Product details */}
          <div style={{ flex: 1 }}>
            <h2 className="product-title" style={{ fontSize: '28px', marginTop: 0, marginBottom: '8px' }}>
              Honda EU2200i Portable Generator
            </h2>
            <div className="product-sku" style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
              Item #001
            </div>

            {/* Honeypot: price element */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
              {!isMutated ? (
                <div className="pricing-info">
                  <span className="price-label" style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Current Price:</span>
                  <span className="product-price" id="price-main" style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>
                    $1450.00
                  </span>
                </div>
              ) : (
                <section className="dynamic-pricing-v2" data-module="pricing-core">
                  <div className="scrambled-x9j3k" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Live Market Value</span>
                    <div data-val="1450.00" style={{ marginTop: '4px' }}>
                      <b className="price-text-obfuscated" style={{ fontSize: '36px', color: '#d93025' }}>$1,450.00</b>
                      <span style={{ fontSize: '12px', marginLeft: '8px' }}>USD</span>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Stock status */}
            <div className="stock-status" style={{ color: '#10B981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
              In Stock (Ready to Ship)
            </div>

            {/* Live DOM Inspector */}
            <div style={{ marginTop: '32px', backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '16px', border: '1px solid #333' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Live DOM Inspector
              </div>
              <pre style={{ margin: 0, color: '#a6accd', fontFamily: '"Fira Code", monospace', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                {isMutated ? MUTATED_DOM : ORIGINAL_DOM}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
