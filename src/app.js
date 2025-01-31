const express = require("express");
const cors = require("cors");
const { welcome } = require("./function/welcome");
const { getProduct, addProduct, deleteProduct, editProduct, searchProduct } = require("./function/product");
const { addItem, getItem, editItem, deleteItem, searchItem } = require("./function/item");
const { getCategory } = require("./function/category");
const { getPaymentCategory, addPaymentCategory, editPaymentCategory, deletePaymentCategory } = require("./function/paymentCategory");
const { addAccount, getAccount, editAccount, deleteAccount, loginAccount } = require("./function/user");
const { addTransaction, getTransaction, topUpTopay, confirmTopUpTopay, confirmTransaction, getAllTransaction } = require("./function/transaction");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server berjalan pada http://localhost:${PORT}`);
});

app.get("/", welcome);
// produk
app.get("/product/:category_id", getProduct);
app.get("/searchProduct", searchProduct);
app.post("/addProduct", addProduct);
app.patch("/editProduct/:product_id", editProduct);
app.delete("/deleteProduct/:product_id", deleteProduct);
// item
app.get("/item/:product_id", getItem);
app.get("/searchItem", searchItem);
app.post("/addItem", addItem);
app.patch("/editItem/:item_id", editItem);
app.delete("/deleteItem/:item_id", deleteItem);
// category
app.get("/category", getCategory);
// payment category
app.get("/paymentCategory", getPaymentCategory);
app.post("/addPaymentCategory", addPaymentCategory);
app.patch("/editPaymentCategory/:payment_category_id", editPaymentCategory);
app.delete("/deletePaymentCategory/:payment_category_id", deletePaymentCategory);
// user
app.post("/loginAccount", loginAccount);
app.get("/account/:user_id", getAccount);
app.post("/addAccount", addAccount);
app.patch("/editAccount/:user_id", editAccount);
app.delete("/deleteAccount/:user_id", deleteAccount);
// transaction
app.get("/transaction", getAllTransaction);
app.get("/transaction/:user_id", getTransaction);
app.post("/addTransaction", addTransaction);
app.post("/topUpTopay", topUpTopay);
app.patch("/confirmTopUpTopay/:user_id/:transaction_id", confirmTopUpTopay);
app.patch("/confirmTransaction/:user_id/:transaction_id", confirmTransaction);