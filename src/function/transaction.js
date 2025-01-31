const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../supabase');

async function addTransaction(req, res) {
    const transaction_id = uuidv4();
    const { admin_id, user_id, item_id, payment_category_id, transaction_target, status } = req.body;
    const message = [];
    if (!admin_id) message.push("admin_id");
    if (!user_id) message.push("user_id");
    if (!item_id) message.push("item_id");
    if (!payment_category_id) message.push("payment_category_id");
    if (!transaction_target) message.push("transaction_target");
    if (!status) message.push("status");
    if (message.length > 0) {
        return res.status(404).json({
            status: "failed",
            message: `Pastikan semua field telah terisi! Field yang kosong: ${message.join(", ")}.`,
        });
    }
    // Ambil harga item dari tabel "item"
    const { data: itemData, error: itemError } = await supabase
        .from("item")
        .select("price")
        .eq("item_id", item_id)
        .single();
    if (itemError) {
        return res.status(404).json({
            status: "failed",
            message: itemError.message,
        });
    }
    // Ambil saldo user
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("saldo")
        .eq("user_id", user_id)
        .single();
    if (userError) {
        return res.status(404).json({
            status: "failed",
            message: userError.message,
        });
    }
    // Update saldo admin di tabel "user"
    const { data: adminData, error: adminError } = await supabase
        .from("user")
        .select("saldo")
        .eq("user_id", admin_id)
        .single();
    if (adminError) {
        return res.status(404).json({
            status: "failed",
            message: adminError.message,
        });
    }
    const updateSaldoAdmin = adminData.saldo + itemData.price;
    const { error: updateSaldoError } = await supabase
        .from("user")
        .update({ saldo: updateSaldoAdmin })
        .eq("user_id", admin_id);
    if (updateSaldoError) {
        return res.status(404).json({
            status: "failed",
            message: updateSaldoError.message,
        });
    }
    // Pengecekan jika payment_category_id = PC01
    if (payment_category_id === "PC01") {
        if (userData.saldo < itemData.price) {
            return res.status(404).json({
                status: "failed",
                message: "Saldo user tidak mencukupi untuk melakukan transaksi.",
            });
        }
        // Kurangi saldo user
        const updateSaldoUser = userData.saldo - itemData.price;
        const { error: updateUserSaldoError } = await supabase
            .from("user")
            .update({ saldo: updateSaldoUser })
            .eq("user_id", user_id);
        if (updateUserSaldoError) {
            return res.status(404).json({
                status: "failed",
                message: updateUserSaldoError.message,
            });
        }
        // Buat transaksi baru di tabel "transaction" untuk pembayaran PC01
        const { error: transactionError } = await supabase
            .from("transaction")
            .insert([
                {
                    transaction_id,
                    user_id,
                    item_id,
                    transaction_target,
                    pay_money: userData.saldo,
                    money_change: updateSaldoUser,
                    payment_category_id,
                    status,
                    created_at: new Date().toLocaleString(),
                },
            ]);
        if (transactionError) {
            return res.status(404).json({
                status: "failed",
                message: transactionError.message,
            });
        }
    }
    else {
        // Buat transaksi baru di tabel "transaction" untuk kategori pembayaran selain PC01
        const { error: transactionError } = await supabase
            .from("transaction")
            .insert([
                {
                    transaction_id,
                    user_id,
                    item_id,
                    transaction_target,
                    pay_money: itemData.price,
                    money_change: 0,
                    payment_category_id,
                    status,
                    created_at: new Date().toLocaleString(),
                },
            ]);
        if (transactionError) {
            return res.status(404).json({
                status: "failed",
                message: transactionError.message,
            });
        }
    }
    return res.json({
        status: "success",
        message: "Transaksi baru berhasil dibuat.",
        transaction_id: transaction_id,
    });
}


async function getTransaction(req, res) {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "failed",
            message: "user id wajib diisi!"
        })
    }
    const { data, error } = await supabase
        .from("transaction")
        .select(`
        transaction_id,
        user:user_id(user_id,username,email),
        item:item_id(
            item_id,
            name,
            price,
            product:product_id (
                name,
                image,
                category:category_id(name)
            )
        ),
        transaction_target,
        pay_money,
        money_change,
        payment_category:payment_category_id(name),
        status,
        created_at
        `)
        .eq("user_id", user_id);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    const formatedData = data.map(result => ({
        transaction_id: result.transaction_id,
        user_id: result.user.user_id,
        username: result.user.username,
        email: result.user.email,
        item_id: result.item.item_id,
        item_name: result.item.name,
        item_price: result.item.price,
        product_name: result.item.product.name,
        product_image: result.item.product.image,
        product_category: result.item.product.category.name,
        transaction_target: result.transaction_target,
        pay_money: result.pay_money,
        money_change: result.money_change,
        payment: result.payment_category.name,
        status: result.status,
        created_at: result.created_at
    }));

    return res.json({
        status: "success",
        data: formatedData
    });
}

async function topUpTopay(req, res) {
    const transaction_id = uuidv4();
    const { admin_id, user_id, item_id, payment_category_id, transaction_target, status } = req.body;
    const message = [];
    if (!admin_id) message.push("admin_id");
    if (!user_id) message.push("user_id");
    if (!item_id) message.push("item_id");
    if (!payment_category_id) message.push("payment_category_id");
    if (!transaction_target) message.push("transaction_target");
    if (!status) message.push("status");
    if (message.length > 0) {
        return res.status(404).json({
            status: "failed",
            message: `Pastikan semua field telah terisi! Field yang kosong: ${message.join(", ")}.`,
        });
    }
    // Ambil harga item dari tabel "item"
    const { data: itemData, error: itemError } = await supabase
        .from("item")
        .select("price")
        .eq("item_id", item_id)
        .single();
    if (itemError) {
        return res.status(404).json({
            status: "failed",
            message: itemError.message,
        });
    }
    // Buat transaksi baru di tabel "transaction" untuk kategori pembayaran selain PC01
    const { error: transactionError } = await supabase
        .from("transaction")
        .insert([
            {
                transaction_id,
                user_id,
                item_id,
                transaction_target,
                pay_money: itemData.price,
                money_change: 0,
                payment_category_id,
                status,
                created_at: new Date().toLocaleString(),
            },
        ]);
    if (transactionError) {
        return res.status(404).json({
            status: "failed",
            message: transactionError.message,
        });
    }
    return res.json({
        status: "success",
        message: "Transaksi baru berhasil dibuat.",
        transaction_id: transaction_id,
    });
}

async function confirmTopUpTopay(req, res) {
    const { user_id, transaction_id } = req.params;
    const { admin_id, item_id } = req.body;
    if (!admin_id) {
        return res.status(404).json({
            status: "failed",
            message: "admin id kosong,wajib diisi!"
        })
    }
    if (!user_id) {
        return res.status(404).json({
            status: "failed",
            message: "user id kosong,wajib diisi!"
        })
    }
    if (!item_id) {
        return res.status(404).json({
            status: "failed",
            message: "item id kosong,wajib diisi!"
        })
    }
    // Ambil harga item dari tabel "item"
    const { data: itemData, error: itemError } = await supabase
        .from("item")
        .select("price")
        .eq("item_id", item_id)
        .single();
    if (itemError) {
        return res.status(404).json({
            status: "failed",
            message: itemError.message,
        });
    }
    // update saldo user
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("saldo")
        .eq("user_id", user_id)
        .single();
    if (userError) {
        return res.status(404).json({
            status: "failed",
            message: userError.message,
        });
    }
    const updateSaldoUser = (userData.saldo + itemData.price) - (5000);
    const { error: updateSaldoUserError } = await supabase
        .from("user")
        .update({ saldo: updateSaldoUser })
        .eq("user_id", user_id);
    if (updateSaldoUserError) {
        return res.status(404).json({
            status: "failed",
            message: error.message,
        });
    }
    // Update saldo admin di tabel "user"
    const { data: adminData, error: adminError } = await supabase
        .from("user")
        .select("saldo")
        .eq("user_id", admin_id)
        .single();
    if (adminError) {
        return res.status(404).json({
            status: "failed",
            message: adminError.message,
        });
    }
    const updateSaldoAdmin = (adminData.saldo - itemData.price) + (5000);
    const { error: updateSaldoError } = await supabase
        .from("user")
        .update({ saldo: updateSaldoAdmin })
        .eq("user_id", admin_id);
    if (updateSaldoError) {
        return res.status(404).json({
            status: "failed",
            message: updateSaldoError.message,
        });
    }
    // update status transaksi
    const { data, error } = await supabase
        .from("transaction")
        .select("transaction_id")
        .eq("transaction_id", transaction_id)
        .eq("user_id", user_id);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        })
    }
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: "transaksi tidak ditemukan!"
        });
    }
    const { data: transactionData, error: transactionError } = await supabase
        .from("transaction")
        .update({ status: "selesai" })
        .eq("transaction_id", transaction_id)
        .eq("user_id", user_id);
    if (transactionError) {
        return res.status(404).json({
            status: "failed",
            message: transactionError.message
        })
    }

    return res.json({
        status: "success",
        message: `Top Up Topay untuk transaksi:${transaction_id} berhasil!`,
    });
}

async function confirmTransaction(req, res) {
    const { user_id, transaction_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "failed",
            message: "user id kosong,wajib diisi!"
        })
    }
    if (!transaction_id) {
        return res.status(404).json({
            status: "failed",
            message: "transaction id kosong,wajib diisi!"
        })
    }
    const { data, error } = await supabase
        .from("transaction")
        .select("*")
        .eq("transaction_id", transaction_id)
        .eq("user_id", user_id)
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        })
    }
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: "transaction tidak ditemukan!"
        })
    }
    const { data: updateData, error: updateError } = await supabase
        .from("transaction")
        .update({ status: "selesai" })
        .eq("transaction_id", transaction_id)
        .eq("user_id", user_id);
    if (updateError) {
        return res.status(404).json({
            status: "failed",
            message: updateError.message
        })
    }
    return res.json({
        status: "success",
        message: `Transaksi untuk:${transaction_id} sudah selesai!`,
    });
}

async function getAllTransaction(req, res) {
    const { data, error } = await supabase
        .from("transaction")
        .select(`
        transaction_id,
        user:user_id(user_id,username,email),
        item:item_id(
            item_id,
            name,
            price,
            product:product_id (
                name,
                image,
                category:category_id(name)
            )
        ),
        transaction_target,
        pay_money,
        money_change,
        payment_category:payment_category_id(name),
        status,
        created_at
        `)
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    const formatedData = data.map(result => ({
        transaction_id: result.transaction_id,
        user_id: result.user.user_id,
        username: result.user.username,
        email: result.user.email,
        item_id: result.item.item_id,
        item_name: result.item.name,
        item_price: result.item.price,
        product_name: result.item.product.name,
        product_image: result.item.product.image,
        product_category: result.item.product.category.name,
        transaction_target: result.transaction_target,
        pay_money: result.pay_money,
        money_change: result.money_change,
        payment: result.payment_category.name,
        status: result.status,
        created_at: result.created_at
    }));

    return res.json({
        status: "success",
        data: formatedData
    });
}



module.exports = { addTransaction, getTransaction, topUpTopay, confirmTopUpTopay, confirmTransaction, getAllTransaction };
