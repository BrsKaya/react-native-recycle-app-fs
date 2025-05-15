import express from "express";
import Event from "../models/Event.js";
import protectRoute from "../middleware/auth.middleware.js"

const router = express.Router();

// Create event
router.post("/", protectRoute, async(req,res) => {
    try {
        const {title, caption, eventDate, location} = req.body;

        if(!title | !caption | !eventDate | !location) return res.status(400).json( {message: "Please provide all fields"});

        //save to the database
        const newEvent = new Event({
            title,
            caption,
            eventDate,
            location,
            user: req.user._id,
        })

        await newEvent.save()

        res.status(201).json(newEvent)

    } catch (error) {
        console.log("Error creating event", error) 
        res.status(500).json({ message: error.message})
    }
});

// Get all events with pagination
router.get("/", protectRoute, async(req,res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page-1) * limit;

        const events = await Event.find()
        .sort({ createdAt: -1}) //desc
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage");

        const totalEvents = await Event.countDocuments();

        res.send({
            events,
            currentPage: page,
            totalEvents,
            totalPages: Math.ceil(totalEvents / limit),
        });
        
    } catch (error) {
        console.log("Error in get all books route", error);
        res.status(500).json({message: "Internal server error"});
    }
});

// Get user events - This needs to be before /:id route
router.get("/user", protectRoute, async(req,res) => {
    try {
        const events = await Event.find({user: req.user._id})
            .sort({createdAt: -1})
            .populate("user", "username profileImage");
        res.json(events);
    } catch (error) {
        console.log("Get user events error", error.message);
        res.status(500).json({message: "Server error"});
    }
});

// Get single event by ID
router.get("/:id", protectRoute, async(req, res) => {
    try {
        console.log("Attempting to fetch event with ID:", req.params.id);
        
        if (!req.params.id) {
            console.log("No ID provided");
            return res.status(400).json({ message: "Event ID is required" });
        }

        const event = await Event.findById(req.params.id)
            .populate("user", "username profileImage")
            .populate({
                path: "participants",
                select: "username profileImage",
                options: { sort: { username: 1 } }
            });
            
        if (!event) {
            console.log("Event not found for ID:", req.params.id);
            return res.status(404).json({ message: "Event not found" });
        }

        console.log("Successfully found event:", event._id);
        console.log("Participants count:", event.participants?.length || 0);
        res.json(event);
    } catch (error) {
        console.log("Error getting event:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid event ID format" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete event
router.delete("/:id", protectRoute, async(req,res) => {
    try {
        const event = await Event.findById(req.params.id);
        if(!event) return res.status(404).json({message: "Event not found"})

        //check if user is the creator of event
        if(event.user.toString() !== req.user._id.toString()) return res.status(401).json({message: "Unauthorized"});

        await event.deleteOne();

        res.json({message : "Event deleted succesfully"});
    } catch (error) {
        console.log("Error deleting event", error);
        res.status(500).json({message: "Internal server error"});
    }
});

// Join event
router.post("/:id/join", protectRoute, async(req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if user is already a participant
        if (event.participants.includes(req.user._id)) {
            return res.status(400).json({ message: "You have already joined this event" });
        }

        // Add user to participants
        event.participants.push(req.user._id);
        await event.save();

        // Populate user details for response
        const populatedEvent = await Event.findById(event._id)
            .populate("user", "username profileImage")
            .populate({
                path: "participants",
                select: "username profileImage",
                options: { sort: { username: 1 } }
            });
        
        res.json(populatedEvent);
    } catch (error) {
        console.log("Error joining event:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Leave event
router.post("/:id/leave", protectRoute, async(req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if user is a participant
        if (!event.participants.includes(req.user._id)) {
            return res.status(400).json({ message: "You are not a participant of this event" });
        }

        // Remove user from participants
        event.participants = event.participants.filter(
            participant => participant.toString() !== req.user._id.toString()
        );
        await event.save();

        // Populate user details for response
        const populatedEvent = await Event.findById(event._id)
            .populate("user", "username profileImage")
            .populate({
                path: "participants",
                select: "username profileImage",
                options: { sort: { username: 1 } }
            });
        
        res.json(populatedEvent);
    } catch (error) {
        console.log("Error leaving event:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update event
router.put("/:id", protectRoute, async(req,res) => {
    try {
        const {title, caption, eventDate, location} = req.body;
        const event = await Event.findById(req.params.id);
        
        if(!event) return res.status(404).json({message: "Event not found"});

        //check if user is the creator of event
        if(event.user.toString() !== req.user._id.toString()) return res.status(401).json({message: "Unauthorized"});

        // Update event fields
        if(title) event.title = title;
        if(caption) event.caption = caption;
        if(eventDate) event.eventDate = eventDate;
        if(location) event.location = location;

        await event.save();

        // Populate user details for response
        const updatedEvent = await Event.findById(event._id)
            .populate("user", "username profileImage")
            .populate({
                path: "participants",
                select: "username profileImage",
                options: { sort: { username: 1 } }
            });

        res.json(updatedEvent);
    } catch (error) {
        console.log("Error updating event", error);
        res.status(500).json({message: "Internal server error"});
    }
});

export default router;