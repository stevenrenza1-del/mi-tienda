require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 🔐 LOGIN REAL
const ADMIN_USER = "rosero";
const ADMIN_PASS = "252507";

// 📦 MODELO
const Producto = mongoose.model("Producto", {
  name: String,
  price: Number,
  image: String
});

// 🔗 CONEXIÓN
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongo conectado 🔥"))
.catch(err => console.log(err));

// 🔐 LOGIN
app.post("/login", (req, res) => {
  const { user, pass } = req.body;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return res.json({ ok: true });
  }

  res.status(401).json({ ok: false });
});

// 📥 OBTENER
app.get("/products", async (req, res) => {
  const data = await Producto.find();
  res.json(data);
});

// ➕ AGREGAR (PROTEGIDO)
app.post("/products", async (req, res) => {
  const { user, pass } = req.body;

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const nuevo = new Producto(req.body);
  await nuevo.save();
  res.json(nuevo);
});

// ✏️ EDITAR (PROTEGIDO)
app.put("/products/:id", async (req, res) => {
  const { user, pass } = req.body;

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const producto = await Producto.findById(req.params.id);

  producto.name = req.body.name;
  producto.price = req.body.price;

  if (req.body.image) {
    producto.image = req.body.image;
  }

  await producto.save();
  res.json(producto);
});

// ❌ ELIMINAR (PROTEGIDO)
app.delete("/products/:id", async (req, res) => {
  const { user, pass } = req.body;

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return res.status(401).json({ error: "No autorizado" });
  }

  await Producto.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.listen(3000, () => console.log("Servidor en puerto 3000"));