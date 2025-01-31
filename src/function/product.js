const { supabase } = require('../supabase');

async function getProduct(req, res) {
    const { category_id } = req.params;
    if (!category_id) {
        return res.status(404).json({
            status: "failed",
            message: "category id wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("product")
        .select("*,category(name)")
        .eq("category_id", category_id);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message,
        });
    }
    const resultData = data.map(result => ({
        product_id: result.product_id,
        name: result.name,
        category_id: result.category_id,
        category: result.category.name,
        image: result.image,
        created_at: result.created_at,
    }));
    return res.json({
        status: "success",
        data: resultData,
    });
}

async function addProduct(req, res) {
    const { product_id, name, category_id, image } = req.body;
    // Array untuk menyimpan field yang kosong
    const missingFields = [];
    if (!product_id) missingFields.push("product_id");
    if (!name) missingFields.push("name");
    if (!category_id) missingFields.push("category_id");
    if (!image) missingFields.push("image");

    // Jika ada field yang kosong
    if (missingFields.length > 0) {
        return res.status(400).json({
            status: "failed",
            message: `Pastikan semua field telah terisi! Field yang kosong: ${missingFields.join(", ")}.`,
        });
    }
    const { data, error } = await supabase
        .from("product")
        .insert([{
            product_id, name, category_id, image, created_at: new Date().toLocaleString(),
        }]);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message,
        });
    }
    return res.json({
        status: "success",
        message: "produk baru berhasil ditambah!",
    });
}

async function deleteProduct(req, res) {
    const { product_id } = req.params;
    if (!product_id) {
        return res.status(404).json({
            status: "failed",
            message: "product id wajib diisi!",
        });
    }
    const { data, error } = await supabase
        .from("product")
        .delete()
        .eq("product_id", product_id);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message,
        });
    }
    return res.json({
        status: "success",
        message: `product dengan id:${product_id} berhasil dihapus`,
    });
}

async function editProduct(req, res) {
    const { product_id } = req.params;
    const { name, category_id, image } = req.body;
    if (!product_id) {
        return res.status(404).json({
            status: "failed",
            message: "product id wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("product")
        .select("*")
        .eq("product_id", product_id);
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: `produk dengan id:${product_id} tidak ditemukan, gagal mengupdate!`
        });
    }
    else {
        const { data, error } = await supabase
            .from("product")
            .update({ name, category_id, image, created_at: new Date().toISOString() })
            .eq("product_id", product_id);
        if (error) {
            return res.status(404).json({
                status: "failed",
                message: error.message,
            });
        }
        return res.json({
            status: "success",
            message: `product dengan id:${product_id} berhasil diupdate`,
        });
    }
}

async function searchProduct(req, res) {
    const { name } = req.query;
    const { data, error } = await supabase
        .from("product")
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

module.exports = { getProduct, addProduct, deleteProduct, editProduct, searchProduct }