var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function order(id, coupon, items) {
  return { id: id, coupon: coupon, items: items };
}

test('invoice matches checkout totals and HSN GST for capped SAVE10', function () {
  var current = order(1004, 'SAVE10', [
    { id: 5, sku: 'OIL-002', name: 'Groundnut Oil', hsn: '1508', price: 1120, qty: 2 }
  ]);
  var invoiceFigures = invoice.computeInvoiceFigures(current);
  var pricingFigures = pricing.computeTotals(current.items, current.coupon);

  assert.deepEqual(
    {
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      cgst: invoiceFigures.cgst,
      sgst: invoiceFigures.sgst,
      total: invoiceFigures.total
    },
    {
      subtotal: pricingFigures.subtotal,
      discount: pricingFigures.discount,
      tax: pricingFigures.tax,
      cgst: pricingFigures.cgst,
      sgst: pricingFigures.sgst,
      total: pricingFigures.total
    }
  );
  assert.deepEqual(invoiceFigures.rows[0], {
    name: 'Groundnut Oil', sku: 'OIL-002', hsn: '1508', qty: 2,
    price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5
  });
});

test('CURRENT BEHAVIOUR: #1001 invoices mixed 5% and 12% lines without a coupon', function () {
  var current = order(1001, '', [
    { id: 2, sku: 'GRN-002', name: 'Toor Dal', hsn: '0713', gstRate: 5, price: 165, qty: 2 },
    { id: 6, sku: 'DRY-001', name: 'Ghee', hsn: '0405', gstRate: 12, price: 450, qty: 1 }
  ]);
  var invoiceFigures = invoice.computeInvoiceFigures(current);
  var pricingFigures = pricing.computeTotals(current.items, current.coupon);

  assert.deepEqual(invoiceFigures, {
    subtotal: 780,
    discount: 0,
    tax: 70.5,
    cgst: 35.25,
    sgst: 35.25,
    total: 850.5,
    rows: [
      { name: 'Toor Dal', sku: 'GRN-002', hsn: '0713', qty: 2, price: 165, gstPercent: 5, line: 330, lineTax: 16.5 },
      { name: 'Ghee', sku: 'DRY-001', hsn: '0405', qty: 1, price: 450, gstPercent: 12, line: 450, lineTax: 54 }
    ]
  });
  assert.equal(pricingFigures.total, invoiceFigures.total);
  assert.equal(pricingFigures.tax, invoiceFigures.tax);
});

test('CURRENT BEHAVIOUR: #1002 invoice matches checkout after SAVE10', function () {
  var current = order(1002, 'SAVE10', [
    { id: 1, sku: 'GRN-001', name: 'Rice', hsn: '1006', gstRate: 5, price: 640, qty: 1 },
    { id: 4, sku: 'OIL-001', name: 'Sunflower Oil', hsn: '1512', gstRate: 5, price: 190, qty: 2 }
  ]);
  var invoiceFigures = invoice.computeInvoiceFigures(current);
  var pricingFigures = pricing.computeTotals(current.items, current.coupon);

  assert.deepEqual(invoiceFigures, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Sunflower Oil', sku: 'OIL-001', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  });
  assert.deepEqual(
    { discount: pricingFigures.discount, tax: pricingFigures.tax, total: pricingFigures.total },
    { discount: 102, tax: 45.9, total: 963.9 }
  );
});

test('CURRENT BEHAVIOUR: #1004 invoice applies the SAVE10 150 rupee cap', function () {
  var current = order(1004, 'SAVE10', [
    { id: 5, sku: 'OIL-002', name: 'Groundnut Oil', hsn: '1508', gstRate: 5, price: 1120, qty: 2 }
  ]);
  var invoiceFigures = invoice.computeInvoiceFigures(current);
  var pricingFigures = pricing.computeTotals(current.items, current.coupon);

  assert.deepEqual(invoiceFigures, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Groundnut Oil', sku: 'OIL-002', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.deepEqual(
    { discount: pricingFigures.discount, tax: pricingFigures.tax, total: pricingFigures.total },
    { discount: 150, tax: 104.5, total: 2194.5 }
  );
});

test('CURRENT BEHAVIOUR: #1008 all-18% items without a coupon match pricing totals', function () {
  var current = order(1008, '', [
    { id: 8, sku: 'BEV-001', name: 'Masala Chai', hsn: '0902', gstRate: 18, price: 140, qty: 1 },
    { id: 12, sku: 'BEV-003', name: 'Kokum Sherbet', hsn: '2106', gstRate: 18, price: 180, qty: 2 }
  ]);
  var invoiceFigures = invoice.computeInvoiceFigures(current);
  var pricingFigures = pricing.computeTotals(current.items, current.coupon);

  assert.deepEqual(invoiceFigures, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { name: 'Masala Chai', sku: 'BEV-001', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Kokum Sherbet', sku: 'BEV-003', hsn: '2106', qty: 2, price: 180, gstPercent: 18, line: 360, lineTax: 64.8 }
    ]
  });
  assert.equal(pricingFigures.total, invoiceFigures.total);
  assert.equal(pricingFigures.tax, invoiceFigures.tax);
});
