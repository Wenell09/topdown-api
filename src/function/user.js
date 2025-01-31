const { supabase } = require('../supabase');
const { v4: uuidv4 } = require('uuid');

async function addAccount(req, res) {
    const user_id = uuidv4();
    const { username, email, role, password, saldo, image } = req.body;
    const message = [];
    if (!username) message.push("username");
    if (!email) message.push("email");
    if (!role) message.push("role");
    if (!password) message.push("password");
    if (!image) message.push("image");
    if (message.length > 0) {
        return res.status(404).json({
            status: "failed",
            message: `Pastikan semua field telah terisi!`
        });
    }
    const { data: user, error: userError } = await supabase
        .from("user")
        .select("*")
        .eq("email", email)
    if (user.length > 0) {
        return res.status(404).json({
            status: "failed",
            message: "Email sudah terdaftar!"
        })
    }
    const { data, error } = await supabase
        .from("user")
        .insert([{ user_id, username, email, role, password, saldo, image, created_at: new Date().toLocaleString() }]);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: "gagal membuat akun!"
        });
    }
    return res.json({
        status: "success",
        message: "akun berhasil dibuat!",
        user_id: user_id,
    });
}

async function getAccount(req, res) {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "failed",
            message: "user id kosong,wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("user_id", user_id);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: `akun dengan id:${user_id} tidak ditemukan`
        })
    }
    return res.json({
        status: "success",
        data: data
    });
}

async function editAccount(req, res) {
    const { user_id } = req.params;
    const { username, email, password } = req.body;
    if (!user_id) {
        return res.status(404).json({
            status: "failed",
            message: "user id kosong,wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("user_id", user_id);
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: `Akun dengan id:${user_id} tidak ditemukan, gagal mengupdate!`
        });
    }
    else {
        const { data, error } = await supabase
            .from("user")
            .update({ username, email, password })
            .eq("user_id", user_id);
        if (error) {
            return res.status(404).json({
                status: "failed",
                message: error.message
            })
        }
        return res.json({
            status: "success",
            message: `Akun dengan id:${user_id} berhasil diubah!`
        });
    }
}

async function deleteAccount(req, res) {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "failed",
            message: "user id kosong,wajib diisi!"
        });
    }
    const { data, error } = await supabase
        .from("user")
        .delete()
        .eq("user_id", user_id)
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: `Akun dengan id:${user_id} berhasil dihapus!`
    });
}

async function loginAccount(req, res) {
    const { email, password } = req.body;
    const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("email", email)
        .eq("password", password);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        })
    }
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: "gagal login,periksa kembali email dan password dengan benar"
        });
    }
    return res.json({
        status: "success",
        message: `${data[0].username} berhasil login!`,
        user_id: data[0].user_id
    })
}

module.exports = { addAccount, getAccount, editAccount, deleteAccount, loginAccount }