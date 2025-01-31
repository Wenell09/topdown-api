function welcome(req, res) {
    return res.json({
        status: "success",
        message: "Welcome to topdown API",
        informasi: {
            lihat_produk: "api/product/{category_id}",
            tambah_produk: "api/addProduct",
            edit_produk: "api/editProduct/{product_id}",
            delete_produk: "api/deleteProduct/{product_id}",
            lihat_item: "api/item/{product_id}",
            tambah_item: "api/item",
            edit_item: "api/editItem/{item_id}",
            delete_item: "api/deleteItem/{item_id}",
            lihat_category: "api/category",
            lihat_payment_category: "api/paymentCategory",
            tambah_payment_category: "api/addPaymentCategory",
            edit_payment_category: "api/editPaymentCategory/{payment_category_id}",
            hapus_payment_category: "api/deletePaymentCategory/{payment_category_id}",
            login_akun: "api/account?email={email}&password={password}",
            lihat_akun: "api/account/{account_id}",
            tambah_akun: "api/account",
            edit_akun: "api/editAccount/{account_id}",
            delete_akun: "api/deleteAccount/{account_id}",
        }
    });
}

module.exports = { welcome };