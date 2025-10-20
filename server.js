// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB Atlas
const atlasUri = 'mongodb+srv://vhkrish03_db_user:hari_food@cluster0.jp4uxeb.mongodb.net/food?retryWrites=true&w=majority';

mongoose.connect(atlasUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Generic GET route for any collection
app.get('/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const Collection = mongoose.connection.collection(collectionName);
    const items = await Collection.find({}).toArray();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ✅ Generic POST route to insert one document into any collection
app.post('/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const data = req.body;
    const Collection = mongoose.connection.collection(collectionName);
    const result = await Collection.insertOne(data);
    res.json({ message: 'Document inserted successfully', insertedId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ================= USER AUTH SECTION =================

// Schema for Users
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  address: String
});

const User = require('./models/User');

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }
  const newUser = new User({ name, email, password });
  await newUser.save();
  res.json({ message: "Signup success" });
});



// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.trim(), password: password.trim() });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    message: "Login success",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
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




// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://0.0.0.0:${PORT}`));

