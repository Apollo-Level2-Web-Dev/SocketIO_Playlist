import { ReturnDocument } from "mongodb";
import { getCollection } from "../config/database.js";
import { calculateTotals, createOrderDocument, generateOrderId, isValidStatusTransition } from "../utils/helper.js";

export const orderHandler = (io, socket) => {
    console.log("a user connected", socket.id);

    // emit -> trigger -> on -> listen 

    // place order 
    socket.on("placeOrder", async (data, callback) => {
        try {
            console.log(`Placed order from ${socket.id}`)
            const validation = validateOrder(data);
            if (!validation.valid) {
                return callback({ success: false, message: validation.message });
            }
            const totals = calculateTotals(data.items);
            const orderId = generateOrderId();
            const order = createOrderDocument(data, orderId, totals);

            const ordersCollection = getCollection('orders');
            await ordersCollection.insertOne(order);

            socket.join(`order-${orderId}`);
            socket.join('customers');

            io.to('admins').emit('newOrder', { order })

            callback({ success: true, order })
            console.log(`order created: ${orderId}`)


        } catch (error) {
            console.log(error)
            callback({ success: false, message: 'Failed to place order...' })
        }
    })

    // track order
    socket.on("trackOrder", async (data, callback) => {
        try {
            const ordersCollection = getCollection('orders');
            const order = await ordersCollection.findOne({ orderId: data.orderId });
            if (!order) {
                return callback({ success: false, message: 'Order not found' });
            }

            socket.join(`order-${data.orderId}`);
            callback({ success: true, order });
        } catch (error) {
            console.error('Order tracking error', error)
            callback({ success: false, message: error.message });
        }
    })

    // cancel order
    socket.on('cancelOrder', async (data, callback) => {
        try {
            const ordersCollection = getCollection('orders');
            const order = await ordersCollection.findOne({ orderId: data.orderId });
            if (!order) {
                return callback({ success: false, message: 'Order not found' });
            }
            if (!['pending', 'confirmed'].includes(order.status)) {
                return callback({ success: false, message: 'Can not cancel the order' });
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
            )

            io.to(`order-${data.orderId}`).emit('orderCancelled', { orderId: data.orderId });
            io.to('admins').emit('orderCancelled', { orderId: data.orderId, customerName: order.customerName });

            callback({ success: true });

        } catch (error) {
            console.error('Cancel order error', error)
            callback({ success: false, message: error.message });
        }
    })

    // get my orders
    socket.on('getMyOrders', async (data, callback) => {
        try {
            const ordersCollection = getCollection('orders');
            const orders = await ordersCollection.find({
                customerPhone: data.customerPhone
            }).sort({ createdAt: -1 }).limit(20).toArray();

            callback({ success: true, orders });
        } catch (error) {
            console.error('Get orders error', error)
            callback({ success: false, message: error.message });
        }
    })

    // admin event

    //admin login
    socket.on('adminLogin', async (data, callback) => {
        try {
            if (data.password === process.env.ADMIN_PASSWORD) {
                socket.isAdmin = true;
                socket.join("admins");
                console.log(`admin logged in: ${socket.id}`)
                callback({ success: true });
            } else {
                callback({ success: false, message: 'invalid password' });
            }
        } catch (error) {
            callback({ success: false, message: "login failed" })
        }
    })

    // get all orders
    socket.on('getAllOrders', async (data, callback) => {
        try {
            if (!socket.isAdmin) {
                return callback({ success: false, message: "Unauthorized" })
            }

            const orderCollection = getCollection('orders');
            const filter = data?.status ? { status: data.status } : {};
            const orders = await orderCollection.find(filter).sort({ createdAt: -1 }).limit(20).toArray();

            callback({ succes: true, orders });

        } catch (error) {
            callback({ success: false, message: "failed to load orders" });
        }
    })

    // order status update
    socket.on("updateOrderStatus", async (data, callback) => {
        try {
            const orderCollection = getCollection('orders');
            const order = await orderCollection.findOne({ orderId: data.orderId })
            if (!order) {
                return callback({ success: false, message: 'Order not found' });
            }
            if (!isValidStatusTransition(order.status, data.newStatus)) {
                return callback({ success: false, message: "Invalid status transition" })
            }

            const result = await orderCollection.findOneAndUpdate(
                { orderId: data.orderId },
                {
                    $set: { status: data.newStatus, updatedAt: new Date() },
                    $push: {
                        statusHistory: {
                            status: data.newStatus,
                            timestamp: new Date(),
                            by: socket.id,
                            note: "Status updated by admin"
                        }
                    }
                },
                { returnDocument: 'after' }
            )

            io.to(`order-${data.orderId}`).emit('statusUpdated', { orderId: data.orderId, status: data.newStatus, order: result })

            socket.to("admin").emit("orderStatusChanged", { orderId: data.orderId, newStatus: data.newStatus });

            callback({ success: true, order: result });

        } catch (error) {
            callback({ success: false, message: "failed to update order status" });
        }
    })

    // accept order
    socket.on('acceptOrder', async (data, callback) => {
        try {
            if (!socket.isAdmin) {
                return callback({ success: false, message: "Unauthorized" })
            }
            const orderCollection = getCollection('orders');
            const order = await orderCollection.findOne({ orderId: data.orderId });

            if (!order || order.status !== "pending") {
                return callback({ success: false, message: "Can not accept this order" })
            }

            const estimatedTime = data.estimatedTime || 30;

            const result = await orderCollection.findOneAndUpdate(
                { orderId: data.orderId },
                {
                    $set: { status: 'confirmed', estimatedTime, updatedAt: new Date() },
                    $push: {
                        statudHistory: {
                            status: 'confirmed',
                            timestamp: new Date(),
                            by: socket.id,
                            note: `Accepted with ${estimatedTime} min estimated time`
                        }
                    },

                },
                {
                    returnDocument: 'after'
                }
            )

            io.to(`order-${data.orderId}`).emit('orderAccepted', { orderId: data.orderId, estimatedTime });
            socket.on('admins').emit('orderAcceptedByAdmin', { orderId: data.orderId });

            callback({ success: true, order: result });

        } catch (error) {
            callback({ success: false, message: error.message });
        }
    })

    // reject order
    socket.on('rejectOrder', async (data, callback) => {
        try {
            if (!socket.isAdmin) {
                return callback({ success: false, message: "Unauthorized" })
            }
            const orderCollection = getCollection('orders');
            const order = await orderCollection.findOne({ orderId: data.orderId });

            if (!order || order.status !== "pending") {
                return callback({ success: false, message: "Can not reject this order" })
            }
            const result = await orderCollection.findOneAndUpdate(
                { orderId: data.orderId },
                {
                    $set: { status: 'cancelled', estimatedTime, updatedAt: new Date() },
                    $push: {
                        statudHistory: {
                            status: 'cancelled',
                            timestamp: new Date(),
                            by: socket.id,
                            note: `Rejected`
                        }
                    },

                },
                {
                    returnDocument: 'after'
                }
            )

            io.to(`order-${data.orderId}`).emit('orderRejected', { orderId: data.orderId, reason: data.reason });
            socket.on('admins').emit('orderRejectedByAdmin', { reason: data.reason });

            callback({ success: true });

        } catch (error) {
            callback({ success: false, message: 'Failed to reject order' })
        }
    })

    // live stats
    socket.on('getLiveStats', async (data, callback) => {
        try {
            if (!socket.isAdmin) {
                return callback({ success: false, message: "Unauthorized" })
            }
            const orderCollection = getCollection('orders');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const stats = {
                totalToday: await orderCollection.countDocuments({ createdAt: { $gte: today } }),
                pending: await orderCollection.countDocuments({ status: 'pending' }),
                confirmed: await orderCollection.countDocuments({ status: 'confirmed' }),
                preparing: await orderCollection.countDocuments({ status: 'preparing' }),
                ready: await orderCollection.countDocuments({ status: 'ready' }),
                outForDelivery: await orderCollection.countDocuments({ status: 'out_for_delivery' }),
                delivered: await orderCollection.countDocuments({ status: 'delivered' }),
                cancelled: await orderCollection.countDocuments({ status: 'cancelled' })
            }

            callback({ success: true, stats });

        } catch (error) {
            callback({ success: false, message: error.message })
        }
    })
}