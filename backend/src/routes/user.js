import express from "express";
import User from "../models/User.js";
import Event from "../models/Event.js";
import bcrypt from "bcryptjs";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// Get user by ID
router.get("/:id", protectRoute, async (req, res) => {
    try {
        console.log('Fetching user with ID:', req.params.id);
        const user = await User.findById(req.params.id).select("-password");
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Fetch events created by the user
        const createdEvents = await Event.find({ user: user._id })
            .select('_id title eventDate location')
            .populate('user', 'username profileImage')
            .sort({ eventDate: -1 });

        // Fetch events where user is a participant
        const participatedEvents = await Event.find({ participants: user._id })
            .select('_id title eventDate location')
            .populate('user', 'username profileImage')
            .sort({ eventDate: -1 });

        console.log('Found user:', {
            id: user._id,
            username: user.username,
            coins: user.coins,
            materials: {
                plastic: user.plasticMaterial,
                glass: user.glassMaterial,
                metal: user.metalMaterial,
                paper: user.paperMaterial,
                organic: user.organicMaterial
            }
        });

        res.status(200).json({ 
            success: true, 
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                coins: user.coins,
                plastic: user.plasticMaterial,
                glass: user.glassMaterial,
                metal: user.metalMaterial,
                paper: user.paperMaterial,
                organic: user.organicMaterial
            },
            createdEvents,
            participatedEvents
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Update material count
router.post("/update-material", protectRoute, async (req, res) => {
    try {
        const { userId, materialField } = req.body;
        console.log('Updating material:', { userId, materialField });

        if (!userId || !materialField) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Validate material field
        const validFields = ['glassMaterial', 'plasticMaterial', 'metalMaterial', 'paperMaterial', 'organicMaterial'];
        if (!validFields.includes(materialField)) {
            return res.status(400).json({ success: false, message: "Invalid material field" });
        }

        // Define coin rewards for each material type
        const coinRewards = {
            'plasticMaterial': 2,
            'paperMaterial': 1,
            'glassMaterial': 4,
            'organicMaterial': 3,
            'metalMaterial': 5
        };

        // Get the coin reward for this material
        const coinReward = coinRewards[materialField];

        // Update the user's material count and coins using $inc operator
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $inc: { 
                    [materialField]: 1,
                    coins: coinReward // Add the specific coin reward for this material
                } 
            },
            { new: true }
        );

        if (!updatedUser) {
            console.log('User not found for update');
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log('Updated user:', {
            id: updatedUser._id,
            username: updatedUser.username,
            coins: updatedUser.coins,
            materials: {
                plastic: updatedUser.plasticMaterial,
                glass: updatedUser.glassMaterial,
                metal: updatedUser.metalMaterial,
                paper: updatedUser.paperMaterial,
                organic: updatedUser.organicMaterial
            }
        });

        res.status(200).json({ 
            success: true, 
            message: "Material count updated successfully",
            updatedCount: updatedUser[materialField],
            coins: updatedUser.coins,
            coinReward: coinReward // Send back the coin reward for display
        });
    } catch (error) {
        console.error("Error updating material:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router; 