module.exports = {
    icinga_server: {
        server: process.env.ICINGA_SERVER || "",
        user: process.env.ICINGA_USER || "",
        pass: process.env.ICINGA_PASS || ""
    },
    port: process.env.PORT || 3000
}