// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // ✅ correct path


const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(
  'mongodb+srv://vhkrish03_db_user:hari_food@cluster0.jp4uxeb.mongodb.net/food?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('✅ Connected'))
 .catch(err => console.error(err));

// ------------------- USER AUTH -------------------

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(200).json({ message: "Signup success", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim(), password: password.trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Login success", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});



// 🟦 FETCH PROFILE
app.get("/profile/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// 🟪 UPDATE PROFILE
app.put("/update/:email", async (req, res) => {
  const { name, phone, address } = req.body;
  await User.updateOne(
    { email: req.params.email },
    { $set: { name, phone, address } }
  );
  res.json({ message: "Profile updated successfully" });
});

// ------------------- GENERIC COLLECTION ROUTES -------------------
// Only use these for food/items, not signup/login

// ✅ Generic GET route - fetch all documents from any collection
app.get('/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName; // e.g., 'fastfood' or 'signup'
    const Collection = mongoose.connection.collection(collectionName);
    
    // Fetch all items
    const items = await Collection.find({}).toArray();

    res.json(items);
  } catch (err) {
    console.error("❌ Error in GET route:", err);
    res.status(500).send('Server error while fetching data');
  }
});


// ✅ Generic POST route - insert one document into any collection
app.post('/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName; // e.g., 'signup'
    const data = req.body; // JSON data sent by Flutter
    const Collection = mongoose.connection.collection(collectionName);

    // Insert the document
    const result = await Collection.insertOne(data);

    res.json({
      message: 'Document inserted successfully',
      insertedId: result.insertedId
    });
  } catch (err) {
    console.error("❌ Error in POST route:", err);
    res.status(500).send('Server error while inserting data');
  }
});




// ✅start server
app.listen(3001, '0.0.0.0', () => console.log('🚀 Server running'));
