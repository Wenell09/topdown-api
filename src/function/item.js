const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../supabase');

async function addItem(req, res) {
    const item_id = uuidv4();
    const { product_id, name, price, image } = req.body;
    const message = [];
    if (!product_id) message.push("product_id");
    if (!name) message.push("name");
    if (!price) message.push("price");
    if (!image) message.push("image");
    if (message.length > 0) {
        return res.status(404).json({
            status: "failed",
            message: `Pastikan semua field telah terisi! Field yang kosong: ${message.join(", ")}.`
        });
    }
    const { data, error } = await supabase
        .from("item")
        .insert([{ item_id, name, product_id, price, image }]);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message,
        });
    }
    return res.json({
        status: "success",
        message: "item baru berhasil ditambah!",
    });
}

async function getItem(req, res) {
    const { product_id } = req.params;
    if (!product_id) {
        return res.status(404).json({
            status: "success",
            message: "product id wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("item")
        .select(`
        item_id,
        name,
        price,
        image,
        product:product_id (
            name,
            image,
            category:category_id (name)
        )
    `)
        .eq("product_id", product_id);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message,
        });
    }
    const resultData = data.map(result => ({
        item_id: result.item_id,
        name: result.name,
        price: result.price,
        image: result.image,
        product_name: result.product.name,
        product_image: result.product.image,
        category: result.product.category.name,
    }));
    return res.json({
        status: "success",
        data: resultData,
    });
}

async function editItem(req, res) {
    const { item_id } = req.params;
    const { name, product_id, price, image } = req.body;
    if (!item_id) {
        return res.status(404).json({
            status: "success",
            message: "item id wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("item")
        .select("*")
        .eq("item_id", item_id);
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: `item dengan id:${item_id} tidak ditemukan, gagal mengupdate!`
        });
    }
    else {
        const { data, error } = await supabase
            .from("item")
            .update({ name, product_id, price, image })
            .eq("item_id", item_id);
        if (error) {
            return res.status(404).json({
                status: "failed",
                message: error.message,
            });
        }
        return res.json({
            status: "success",
            message: `item dengan id:${item_id} berhasil diubah!`,
        });
    }
}

async function deleteItem(req, res) {
    const { item_id } = req.params;
    if (!item_id) {
        return res.status(404).json({
            status: "success",
            message: "item id wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("item")
        .delete()
        .eq("item_id", item_id);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message,
        });
    }
    return res.json({
        status: "success",
        message: `item dengan id:${item_id} berhasil dihapus!`,
    });
}

async function searchItem(req, res) {
    const { name } = req.query;
    const { data, error } = await supabase
        .from("item")
        .select("*")
        .ilike("name", `${name}%`);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message,
        });
    }
    return res.json({
        status: "success",
        data: data,
    });
}

module.exports = { getItem, addItem, editItem, deleteItem, searchItem }