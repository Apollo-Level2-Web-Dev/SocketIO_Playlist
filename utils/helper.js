// Helper functions for order management

/**
 * Generate unique order ID
 * Format: ORD-20250104-001
 */
export function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `ORD-${year}${month}${day}-${random}`;
}

/**
 * Validate order data
 */
export function validateOrderData(data) {
    if (!data.customerName?.trim()) {
        return { valid: false, message: 'Customer name is required' };
    }

    if (!data.customerPhone?.trim()) {
        return { valid: false, message: 'Phone number is required' };
    }

    if (!data.customerAddress?.trim()) {
        return { valid: false, message: 'Delivery address is required' };
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
        return { valid: false, message: 'Order must have at least one item' };
    }

    // Validate each item
    for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        if (!item.name || !item.quantity || !item.price) {
            return { valid: false, message: `Item ${i + 1} is incomplete` };
        }
        if (item.quantity <= 0 || item.price <= 0) {
            return { valid: false, message: `Item ${i + 1} has invalid values` };
        }
    }

    return { valid: true };
}

/**
 * Calculate order totals
 */
export function calculateTotals(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10; // 10% tax
    const deliveryFee = 5.00;
    const total = subtotal + tax + deliveryFee;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        deliveryFee,
        totalAmount: Math.round(total * 100) / 100
    };
}

/**
 * Check if status transition is valid
 */
export function isValidStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['preparing', 'cancelled'],
        'preparing': ['ready', 'cancelled'],
        'ready': ['out_for_delivery', 'cancelled'],
        'out_for_delivery': ['delivered'],
        'delivered': [],
        'cancelled': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
}

/**
 * Create order document
 */
export function createOrderDocument(orderData, orderId, totals) {
    return {
        orderId,
        customerName: orderData.customerName.trim(),
        customerPhone: orderData.customerPhone.trim(),
        customerAddress: orderData.customerAddress.trim(),
        items: orderData.items,
        subtotal: totals.subtotal,
        tax: totals.tax,
        deliveryFee: totals.deliveryFee,
        totalAmount: totals.totalAmount,
        specialNotes: orderData.specialNotes || '',
        paymentMethod: orderData.paymentMethod || 'cash',
        paymentStatus: 'pending',
        status: 'pending',
        statusHistory: [{
            status: 'pending',
            timestamp: new Date(),
            by: 'customer',
            note: 'Order placed'
        }],
        estimatedTime: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };
}
