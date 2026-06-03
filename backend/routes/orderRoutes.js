import express from "express";
import RetailOrder from "../models/RetailOrder.js";
import ReadyMadeProduct from "../models/ReadyMadeProduct.js";
import { isAuth } from "../middleware/auth.js";

const orderRoutes = express.Router();

orderRoutes.post("/retail", isAuth, async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No order items provided",
            });
        }

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required",
            });
        }

        let itemsPrice = 0;
        const finalOrderItems = [];

        for (const item of orderItems) {

            const product = await ReadyMadeProduct.findOne({
                _id: item.productId,
                isActive: true,
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`,
                });
            }

            const quantity = item.quantity || 1;

            if (product.countInStock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is out of stock`,
                });
            }

            finalOrderItems.push({
                productId: product._id,
                name: product.name,
                nameAr: product.nameAr,
                slug: product.slug,
                image: product.images?.[0] || "",
                size: product.size,
                price: product.price,
                quantity,
            });

            itemsPrice += product.price * quantity;
        }

        const shippingPrice = 0;

        const vatRate = 0.05;

        const vatAmount = Number(
            (itemsPrice * vatRate).toFixed(2)
        );

        const totalPrice =
            itemsPrice +
            shippingPrice +
            vatAmount;

        const order = await RetailOrder.create({
            userId: req.user._id,
            orderItems: finalOrderItems,
            shippingAddress,
            paymentMethod: "cod",
            itemsPrice,
            shippingPrice,
            vatRate,
            vatAmount,
            totalPrice,
            status: "pending",
        });

        // Update stock
        for (const item of orderItems) {

            const product = await ReadyMadeProduct.findById(
                item.productId
            );

            const quantity = item.quantity || 1;

            product.countInStock -= quantity;

            if (product.countInStock <= 0) {
                product.countInStock = 0;
                product.isActive = false;
            }

            await product.save();
        }

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            orderId: order._id,
            order,
        });

    } catch (error) {

        console.error(
            "POST /api/orders/retail error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
});

export default orderRoutes;