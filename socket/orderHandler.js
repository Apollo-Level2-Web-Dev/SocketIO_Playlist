// All Socket.IO event handlers

import { getCollection } from '../config/database.js';
import {
    generateOrderId,
    validateOrderData,
    calculateTotals,
    isValidStatusTransition,
    createOrderDocument
} from '../utils/helper.js';

export const orderHandler = (io, socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // ======================
    // CUSTOMER EVENTS
    // ======================

    // Place Order
    socket.on('placeOrder', async (data, callback) => {
        try {
            console.log(`📝 Place order from: ${socket.id}`);

            const validation = validateOrderData(data);
            if (!validation.valid) {
                return callback({ success: false, message: validation.message });
            }

            const totals = calculateTotals(data.items);
            const orderId = generateOrderId();
            const order = createOrderDocument(data, orderId, totals);

            const ordersCollection = getCollection('orders');
            await ordersCollection.insertOne(order);

            socket.join(`order_${orderId}`);
            socket.join('customers');

            io.to('admins').emit('newOrder', { order });

            callback({ success: true, order });
            console.log(`✅ Order created: ${orderId}`);

        } catch (error) {
            console.error('❌ Place order error:', error);
            callback({ success: false, message: 'Failed to place order' });
        }
    });

    // Track Order
    socket.on('trackOrder', async (data, callback) => {
        try {
            const ordersCollection = getCollection('orders');
            const order = await ordersCollection.findOne({ orderId: data.orderId });

            if (!order) {
                return callback({ success: false, message: 'Order not found' });
            }

            socket.join(`order_${data.orderId}`);
            callback({ success: true, order });

        } catch (error) {
            console.error('❌ Track order error:', error);
            callback({ success: false, message: 'Failed to load order' });
        }
    });

    // Cancel Order
    socket.on('cancelOrder', async (data, callback) => {
        try {
            const ordersCollection = getCollection('orders');
            const order = await ordersCollection.findOne({ orderId: data.orderId });

            if (!order) {
                return callback({ success: false, message: 'Order not found' });
            }

            if (!['pending', 'confirmed'].includes(order.status)) {
                return callback({ success: false, message: 'Cannot cancel this order' });
            }

            await ordersCollection.updateOne(
                { orderId: data.orderId },
                {
                    $set: { status: 'cancelled', updatedAt: new Date() },
                    $push: {
                        statusHistory: {
                            status: 'cancelled',
                            timestamp: new Date(),
                            by: socket.id,
                            note: data.reason || 'Cancelled by customer'
                        }
                    }
                }
            );

            io.to(`order_${data.orderId}`).emit('orderCancelled', { orderId: data.orderId });
            io.to('admins').emit('orderCancelled', { orderId: data.orderId, customerName: order.customerName });

            callback({ success: true });

        } catch (error) {
            console.error('❌ Cancel order error:', error);
            callback({ success: false, message: 'Failed to cancel order' });
        }
    });

    // Get My Orders
    socket.on('getMyOrders', async (data, callback) => {
        try {
            const ordersCollection = getCollection('orders');
            const orders = await ordersCollection
                .find({ customerPhone: data.customerPhone })
                .sort({ createdAt: -1 })
                .limit(50)
                .toArray();

            callback({ success: true, orders });

        } catch (error) {
            console.error('❌ Get orders error:', error);
            callback({ success: false, message: 'Failed to load orders' });
        }
    });

    // ======================
    // ADMIN EVENTS
    // ======================

    // Admin Login
    socket.on('adminLogin', (data, callback) => {
        try {
            if (data.password === process.env.ADMIN_PASSWORD) {
                socket.isAdmin = true;
                socket.join('admins');
                console.log(`✅ Admin logged in: ${socket.id}`);
                callback({ success: true });
            } else {
                callback({ success: false, message: 'Invalid password' });
            }
        } catch (error) {
            callback({ success: false, message: 'Login failed' });
        }
    });

    // Get All Orders
    socket.on('getAllOrders', async (data, callback) => {
        try {
            if (!socket.isAdmin) {
                return callback({ success: false, message: 'Unauthorized' });
            }

            const ordersCollection = getCollection('orders');
            const filter = data?.status ? { status: data.status } : {};
            const orders = await ordersCollection
                .find(filter)
                .sort({ createdAt: -1 })
                .limit(data?.limit || 50)
                .toArray();

            callback({ success: true, orders });

        } catch (error) {
            console.error('❌ Get all orders error:', error);
            callback({ success: false, message: 'Failed to load orders' });
        }
    });

    // Update Order Status
    socket.on('updateOrderStatus', async (data, callback) => {
        try {
            if (!socket.isAdmin) {
                return callback({ success: false, message: 'Unauthorized' });
            }

            const ordersCollection = getCollection('orders');
            const order = await ordersCollection.findOne({ orderId: data.orderId });

            if (!order) {
                return callback({ success: false, message: 'Order not found' });
            }

            if (!isValidStatusTransition(order.status, data.newStatus)) {
                return callback({ success: false, message: 'Invalid status transition' });
            }

            const result = await ordersCollection.findOneAndUpdate(
                { orderId: data.orderId },
                {
                    $set: { status: data.newStatus, updatedAt: new Date() },
                    $push: {
                        statusHistory: {
                            status: data.newStatus,
                            timestamp: new Date(),
                            by: socket.id,
                            note: 'Status updated by admin'
                        }
                    }
                },
                { returnDocument: 'after' }
            );

            io.to(`order_${data.orderId}`).emit('statusUpdated', { orderId: data.orderId, status: data.newStatus, order: result });
            socket.to('admins').emit('orderStatusChanged', { orderId: data.orderId, newStatus: data.newStatus });

            callback({ success: true, order: result });

        } catch (error) {
            console.error('❌ Update status error:', error);
            callback({ success: false, message: 'Failed to update status' });
        }
    });

    // Accept Order
    socket.on('acceptOrder', async (data, callback) => {
        try {
            if (!socket.isAdmin) {
                return callback({ success: false, message: 'Unauthorized' });
            }

            const ordersCollection = getCollection('orders');
            const order = await ordersCollection.findOne({ orderId: data.orderId });

            if (!order || order.status !== 'pending') {
                return callback({ success: false, message: 'Cannot accept this order' });
            }

            const estimatedTime = data.estimatedTime || 30;

            const result = await ordersCollection.findOneAndUpdate(
                { orderId: data.orderId },
                {
                    $set: { status: 'confirmed', estimatedTime, updatedAt: new Date() },
                    $push: {
                        statusHistory: {
                            status: 'confirmed',
                            timestamp: new Date(),
                            by: socket.id,
                            note: `Accepted with ${estimatedTime} min estimated time`
                        }
                    }
                },
                { returnDocument: 'after' }
            );

            io.to(`order_${data.orderId}`).emit('orderAccepted', { orderId: data.orderId, estimatedTime });
            socket.to('admins').emit('orderAcceptedByAdmin', { orderId: data.orderId });

            callback({ success: true, order: result });

        } catch (error) {
            console.error('❌ Accept order error:', error);
            callback({ success: false, message: 'Failed to accept order' });
        }
    });

    // Reject Order
    socket.on('rejectOrder', async (data, callback) => {
        try {
            if (!socket.isAdmin) {
                return callback({ success: false, message: 'Unauthorized' });
            }

            const ordersCollection = getCollection('orders');
            const order = await ordersCollection.findOne({ orderId: data.orderId });

            if (!order || order.status !== 'pending') {
                return callback({ success: false, message: 'Cannot reject this order' });
            }

            await ordersCollection.updateOne(
                { orderId: data.orderId },
                {
                    $set: { status: 'cancelled', updatedAt: new Date() },
                    $push: {
                        statusHistory: {
                            status: 'cancelled',
                            timestamp: new Date(),
                            by: socket.id,
                            note: `Rejected: ${data.reason}`
                        }
                    }
                }
            );

            io.to(`order_${data.orderId}`).emit('orderRejected', { orderId: data.orderId, reason: data.reason });

            callback({ success: true });

        } catch (error) {
            console.error('❌ Reject order error:', error);
            callback({ success: false, message: 'Failed to reject order' });
        }
    });

    // Set Estimated Time
    socket.on('setEstimatedTime', async (data, callback) => {
        try {
            if (!socket.isAdmin) {
                return callback({ success: false, message: 'Unauthorized' });
            }

            const ordersCollection = getCollection('orders');
            const result = await ordersCollection.findOneAndUpdate(
                { orderId: data.orderId },
                { $set: { estimatedTime: data.estimatedTime, updatedAt: new Date() } },
                { returnDocument: 'after' }
            );

            if (result) {
                io.to(`order_${data.orderId}`).emit('estimatedTimeUpdated', { orderId: data.orderId, estimatedTime: data.estimatedTime });
                callback({ success: true, order: result });
            } else {
                callback({ success: false, message: 'Order not found' });
            }

        } catch (error) {
            console.error('❌ Set time error:', error);
            callback({ success: false, message: 'Failed to update time' });
        }
    });

    // Get Live Stats
    socket.on('getLiveStats', async (callback) => {
        try {
            if (!socket.isAdmin) {
                return callback({ success: false, message: 'Unauthorized' });
            }

            const ordersCollection = getCollection('orders');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const stats = {
                totalToday: await ordersCollection.countDocuments({ createdAt: { $gte: today } }),
                pending: await ordersCollection.countDocuments({ status: 'pending' }),
                confirmed: await ordersCollection.countDocuments({ status: 'confirmed' }),
                preparing: await ordersCollection.countDocuments({ status: 'preparing' }),
                ready: await ordersCollection.countDocuments({ status: 'ready' }),
                outForDelivery: await ordersCollection.countDocuments({ status: 'out_for_delivery' }),
                delivered: await ordersCollection.countDocuments({ status: 'delivered' }),
                cancelled: await ordersCollection.countDocuments({ status: 'cancelled' })
            };

            callback({ success: true, stats });

        } catch (error) {
            console.error('❌ Get stats error:', error);
            callback({ success: false, message: 'Failed to load stats' });
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`👋 User disconnected: ${socket.id}`);
        if (socket.isAdmin) {
            socket.to('admins').emit('adminDisconnected', { adminId: socket.id });
        }
    });
};