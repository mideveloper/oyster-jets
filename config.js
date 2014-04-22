function config() {
    return {
        env: process.env.NODE_ENV || "development",
        port: 91,
        
        apnCertPath: "/var/jets/apn/sr_stg_prod_cert.pem",
        apnKeyPath: "/var/jets/apn/sr_stg_prod_key.pem",

    };

}

module.exports = config;
