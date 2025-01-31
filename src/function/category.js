const { supabase } = require('../supabase');

async function getCategory(req, res) {
    const { data, error } = await supabase
        .from("category")
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

module.exports = { getCategory }