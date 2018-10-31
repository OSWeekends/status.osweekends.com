module.exports = {
    icinga_server: {
        server: process.env.icinga_server || "",
        user: process.env.icinga_user || "",
        pass: process.env.icinga_pass || "",
        port: process.env.icinga_pass || ""
    },
    port: process.env.PORT || 3000
}