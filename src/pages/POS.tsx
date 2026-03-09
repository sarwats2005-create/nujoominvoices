import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { usePOS } from '@/hooks/usePOS';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, Receipt, CreditCard,
  Banknote, Wallet, User, Percent, DollarSign, X, CheckCircle, Tag, ScanBarcode,
  Printer, FolderOpen, Download
} from 'lucide-react';
import BarcodeScanner from '@/components/pos/BarcodeScanner';
import type { CartItem, Customer, Product, ProductVariant } from '@/types/pos';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

const POS: React.FC = () => {
  const { products, categories, loading } = useProducts();
  const { customers, addCustomer } = useCustomers();
  const { completeSale, processing } = usePOS();
  const { toast } = useToast();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [notes, setNotes] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [receiptDirHandle, setReceiptDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [savingReceipt, setSavingReceipt] = useState(false);

  // Restore saved directory handle from IndexedDB on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const db = await openReceiptDB();
        const tx = db.transaction('handles', 'readonly');
        const store = tx.objectStore('handles');
        const req = store.get('receiptDir');
        req.onsuccess = () => {
          if (req.result?.handle) setReceiptDirHandle(req.result.handle);
        };
      } catch {}
    };
    restore();
  }, []);

  const handleBarcodeScan = (code: string) => {
    const product = products.find(p =>
      p.barcode === code ||
      p.sku === code ||
      p.variants?.some(v => v.barcode === code || v.sku === code)
    );
    if (product) {
      const variant = product.variants?.find(v => v.barcode === code || v.sku === code) || product.variants?.[0];
      addToCart(product, variant);
      toast({ title: `Added: ${product.name}` });
    } else {
      setSearch(code);
      toast({ title: 'Product not found', description: `No product with barcode "${code}"`, variant: 'destructive' });
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category_id === categoryFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.sku?.toLowerCase().includes(s) ||
        p.barcode?.toLowerCase().includes(s)
      );
    }
    return result;
  }, [products, search, categoryFilter]);

  const addToCart = (product: Product, variant?: ProductVariant) => {
    const v = variant || product.variants?.[0];
    const price = v?.price_override ?? product.price;
    const taxRate = product.tax_rate || 0;

    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.variant?.id === v?.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.variant?.id === v?.id
            ? { ...i, quantity: i.quantity + 1, tax: (i.quantity + 1) * price * (taxRate / 100) }
            : i
        );
      }
      return [...prev, {
        product, variant: v, quantity: 1,
        unit_price: price, discount: 0,
        tax: price * (taxRate / 100),
      }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const newQty = Math.max(1, item.quantity + delta);
      const taxRate = item.product.tax_rate || 0;
      return { ...item, quantity: newQty, tax: newQty * item.unit_price * (taxRate / 100) };
    }));
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((s, i) => s + i.unit_price * i.quantity - i.discount, 0);
  const taxTotal = cart.reduce((s, i) => s + i.tax, 0);
  const discountApplied = discountType === 'percentage' ? subtotal * (discountAmount / 100) : discountAmount;
  const grandTotal = subtotal - discountApplied + taxTotal;

  const handleCheckout = async () => {
    const sale = await completeSale(cart, paymentMethod, discountAmount, discountType, selectedCustomer, notes);
    if (sale) {
      setReceiptData({ ...sale, items: cart, customer: selectedCustomer });
      setCart([]);
      setDiscountAmount(0);
      setNotes('');
      setSelectedCustomer(null);
      setCheckoutOpen(false);
      toast({ title: 'Sale completed!', description: `Total: $${grandTotal.toFixed(2)}` });
    } else {
      toast({ title: 'Sale failed', variant: 'destructive' });
    }
  };

  const exportReceipt = (data: any) => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 200] });
    let y = 10;
    doc.setFontSize(12);
    doc.text('RECEIPT', 40, y, { align: 'center' }); y += 6;
    doc.setFontSize(8);
    doc.text(format(new Date(), 'dd/MM/yyyy HH:mm'), 40, y, { align: 'center' }); y += 4;
    doc.text(`#${data.sale_number || ''}`, 40, y, { align: 'center' }); y += 6;
    if (data.customer) {
      doc.text(`Customer: ${data.customer.name}`, 5, y); y += 4;
    }
    doc.line(5, y, 75, y); y += 4;

    (data.items || []).forEach((item: CartItem) => {
      doc.text(`${item.product.name}${item.variant?.name !== 'Default' ? ` (${item.variant?.name})` : ''}`, 5, y);
      doc.text(`$${(item.unit_price * item.quantity).toFixed(2)}`, 75, y, { align: 'right' });
      y += 3;
      doc.setFontSize(7);
      doc.text(`  ${item.quantity} x $${item.unit_price.toFixed(2)}`, 5, y);
      doc.setFontSize(8);
      y += 4;
    });

    doc.line(5, y, 75, y); y += 4;
    doc.text(`Subtotal:`, 5, y); doc.text(`$${subtotal.toFixed(2)}`, 75, y, { align: 'right' }); y += 4;
    if (discountApplied > 0) {
      doc.text(`Discount:`, 5, y); doc.text(`-$${discountApplied.toFixed(2)}`, 75, y, { align: 'right' }); y += 4;
    }
    if (taxTotal > 0) {
      doc.text(`Tax:`, 5, y); doc.text(`$${taxTotal.toFixed(2)}`, 75, y, { align: 'right' }); y += 4;
    }
    doc.setFontSize(10);
    doc.text(`TOTAL:`, 5, y); doc.text(`$${grandTotal.toFixed(2)}`, 75, y, { align: 'right' }); y += 6;
    doc.setFontSize(8);
    doc.text(`Payment: ${data.payment_method || paymentMethod}`, 5, y); y += 6;
    doc.text('Thank you!', 40, y, { align: 'center' });

    doc.save(`receipt-${data.sale_number || 'sale'}.pdf`);
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) return;
    const c = await addCustomer({ name: newCustomerName.trim(), phone: newCustomerPhone.trim() || null });
    if (c) { setSelectedCustomer(c); setCustomerDialogOpen(false); setNewCustomerName(''); setNewCustomerPhone(''); }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 animate-fade-in">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Search + Category filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, SKU, barcode..." className="pl-10" />
          </div>
          <Button variant="outline" onClick={() => setScannerOpen(true)} className="gap-2 shrink-0">
            <ScanBarcode className="h-4 w-4" /> Scan
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer text-xs px-3 py-1"
            onClick={() => setCategoryFilter('all')}
          >
            All
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat.id}
              variant={categoryFilter === cat.id ? 'default' : 'outline'}
              className="cursor-pointer text-xs px-3 py-1"
              style={categoryFilter === cat.id ? { backgroundColor: cat.color } : {}}
              onClick={() => setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>

        {/* Product Grid */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Tag className="h-8 w-8 mb-2" />
              <p>No products found. Add products in Inventory first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const mainVariant = product.variants?.[0];
                const stock = mainVariant?.stock_quantity ?? 0;
                const isLowStock = stock <= (mainVariant?.min_stock_level ?? 5);

                return (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center text-3xl font-bold text-muted-foreground/30 group-hover:bg-primary/5 transition-colors">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          product.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate text-foreground">{product.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-primary font-bold text-sm">${product.price.toFixed(2)}</span>
                          <Badge variant={isLowStock ? 'destructive' : 'secondary'} className="text-[10px]">
                            {stock} left
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right: Cart */}
      <Card className="w-full lg:w-[380px] flex flex-col shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart
              {cart.length > 0 && <Badge className="text-xs">{cart.length}</Badge>}
            </div>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => setCart([])}>
                Clear
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <Separator />

        {/* Customer selector */}
        <div className="px-4 py-2 flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select
            value={selectedCustomer?.id || 'walk-in'}
            onValueChange={v => {
              if (v === 'walk-in') setSelectedCustomer(null);
              else if (v === 'new') setCustomerDialogOpen(true);
              else setSelectedCustomer(customers.find(c => c.id === v) || null);
            }}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="walk-in">Walk-in Customer</SelectItem>
              {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              <SelectItem value="new">+ Add Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Cart Items */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-3">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Cart is empty</p>
            ) : cart.map((item, i) => (
              <div key={i} className="flex items-start gap-2 bg-muted/30 rounded-lg p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                  {item.variant && item.variant.name !== 'Default' && (
                    <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">${item.unit_price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(i, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(i, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">${(item.unit_price * item.quantity).toFixed(2)}</p>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeFromCart(i)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* Totals + Checkout */}
        <div className="p-4 space-y-3">
          {/* Discount row */}
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number" min={0} value={discountAmount || ''} onChange={e => setDiscountAmount(Number(e.target.value))}
              placeholder="Discount" className="h-8 text-xs flex-1"
            />
            <Select value={discountType} onValueChange={v => setDiscountType(v as any)}>
              <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="fixed">$</SelectItem>
                <SelectItem value="percentage">%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            {discountApplied > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Discount</span><span>-${discountApplied.toFixed(2)}</span>
              </div>
            )}
            {taxTotal > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span><span>${taxTotal.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span><span className="text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full gap-2" size="lg"
            disabled={cart.length === 0 || processing}
            onClick={() => setCheckoutOpen(true)}
          >
            <CreditCard className="h-4 w-4" /> Checkout
          </Button>
        </div>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">${grandTotal.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{cart.length} items</p>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'cash', label: 'Cash', icon: Banknote },
                  { value: 'card', label: 'Card', icon: CreditCard },
                  { value: 'credit', label: 'Credit', icon: Wallet },
                  { value: 'split', label: 'Split', icon: DollarSign },
                ].map(m => (
                  <Button
                    key={m.value}
                    variant={paymentMethod === m.value ? 'default' : 'outline'}
                    className="gap-2 h-12"
                    onClick={() => setPaymentMethod(m.value)}
                  >
                    <m.icon className="h-4 w-4" /> {m.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Sale notes..." />
            </div>

            <Button className="w-full gap-2" size="lg" onClick={handleCheckout} disabled={processing}>
              <CheckCircle className="h-4 w-4" />
              {processing ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptData} onOpenChange={() => setReceiptData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" /> Sale Complete!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <p className="text-3xl font-bold text-primary">${receiptData?.total?.toFixed(2) || grandTotal.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">#{receiptData?.sale_number}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => exportReceipt(receiptData)} className="gap-2">
                <Receipt className="h-4 w-4" /> Download Receipt
              </Button>
              <Button onClick={() => setReceiptData(null)}>New Sale</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Customer Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="Customer name" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="Phone number" />
            </div>
            <Button className="w-full" onClick={handleAddCustomer} disabled={!newCustomerName.trim()}>Add Customer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner */}
      <BarcodeScanner open={scannerOpen} onOpenChange={setScannerOpen} onScan={handleBarcodeScan} />
    </div>
  );
};

export default POS;
