const { supabase } = require('../supabase');

async function getPaymentCategory(req, res) {
    const { data, error } = await supabase
        .from("payment_category")
        .select("*")
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        data: data
    });
}

async function addPaymentCategory(req, res) {
    const { payment_category_id, name } = req.body;
    if (!payment_category_id) {
        return res.status(404).json({
            status: "failed",
            message: "payment category id wajib diisi!"
        });
    }
    if (!name) {
        return res.status(404).json({
            status: "failed",
            message: "name wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("payment_category")
        .insert([{ payment_category_id, name }]);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: "payment category baru berhasil ditambah!"
    });
}

async function editPaymentCategory(req, res) {
    const { payment_category_id } = req.params;
    const { name } = req.body;
    if (!payment_category_id) {
        return res.status(404).json({
            status: "failed",
            message: "payment category id wajib diisi!"
        });
    }
    if (!name) {
        return res.status(404).json({
            status: "failed",
            message: "name wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("payment_category")
        .select("*")
        .eq("payment_category_id", payment_category_id)
    if (data.length === 0) {
        return res.json({
            status: "success",
            message: `payment category dengan id:${payment_category_id} tidak ditemukan, gagal mengupdate!`
        });
    }
    else {
        const { data, error } = await supabase
            .from("payment_category")
            .update({ name })
            .eq("payment_category_id", payment_category_id)
        if (error) {
            return res.status(404).json({
                status: "failed",
                message: error.message
            });
        }
        return res.json({
            status: "success",
            message: `payment category dengan id:${payment_category_id} berhasil ditambah!`
        });
    }

}

async function deletePaymentCategory(req, res) {
    const { payment_category_id } = req.params;
    if (!payment_category_id) {
        return res.status(404).json({
            status: "failed",
            message: "payment category id wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("payment_category")
        .delete()
        .eq("payment_category_id", payment_category_id)
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: `payment category dengan id:${payment_category_id} berhasil dihapus!`
    });
}

module.exports = { getPaymentCategory, addPaymentCategory, editPaymentCategory, deletePaymentCategory }