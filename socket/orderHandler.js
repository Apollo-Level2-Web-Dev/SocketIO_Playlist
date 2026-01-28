import { getCollection } from "../config/database.js";
import { calculateTotals, createOrderDocument, generateOrderId } from "../utils/helper.js";

export const orderHandler = (io, socket) =>{
    console.log("a user connected", socket.id);

    // emit -> trigger -> on -> listen 

    // place order 
    socket.on("placeOrder", async (data, callback)=>{
        try{
            console.log(`Placed order from ${socket.id}`)
            const validation = validateOrder(data);
            if(!validation.valid){
              return callback({success: false, message: validation.message});
            }
            const totals = calculateTotals(data.items);
            const orderId = generateOrderId();
            const order = createOrderDocument(data, orderId, totals);

            const ordersCollection = getCollection('orders');
            await ordersCollection.insertOne(order);

            socket.join(`order-${orderId}`);
            socket.join('customers');

            io.to('admins').emit('newOrder',{order})

            callback({success: true, order})
            console.log(`order created: ${orderId}`)


        }catch(error){
            console.log(error)
            callback({success: false, message: 'Failed to place order...'})
        }
    })

    // track order
    socket.on("trackOrder", async(data, callback)=>{
        try{
            const ordersCollection = getCollection('orders');
        const order = await ordersCollection.findOne({orderId: data.orderId});
        if(!order){
            return callback({success: false, message: 'Order not found'});
        }

        socket.join(`order-${data.orderId}`);
        callback({success: true, order});
        }catch(error){
            console.error('Order tracking error', error)
            callback({success: false, message: error.message});
        }
    })

    // cancel order
    socket.on('cancelOrder', async(data, callback)=>{
        try{
            const ordersCollection = getCollection('orders');
            const order = await ordersCollection.findOne({orderId: data.orderId});
            if(!order){
            return callback({success: false, message: 'Order not found'});
            }
            if(!['pending', 'confirmed'].includes(order.status)){
                return callback({success: false, message: 'Can not cancel the order'});
            }
            await ordersCollection.updateOne(
                {orderId: data.orderId},
                {
                    $set: {status: 'cancelled', updatedAt: new Date()},
                    $push:{
                        statusHistory:{
                            status: 'cancelled',
                            timestamp: new Date(),
                            by: socket.id,
                            note: data.reason || 'Cancelled by customer'
                        }
                    }
                }
            )

            io.to(`order-${data.orderId}`).emit('orderCancelled', {orderId: data.orderId});
            io.to('admins').emit('orderCancelled', {orderId: data.orderId, customerName: order.customerName});
            
            callback({success: true});
            
        }catch(error){
            console.error('Cancel order error', error)
            callback({success: false, message: error.message});
        }
    })

    // get my orders
    socket.on('getMyOrders', async(data, callback)=>{
        try{
            const ordersCollection = getCollection('orders');
            const orders = await ordersCollection.find({
                customerPhone: data.customerPhone
            }).sort({createdAt: -1}).limit(20).toArray();

            callback({success: true, orders});
        }catch(error){
            console.error('Get orders error', error)
            callback({success: false, message: error.message});
        }
    })
}