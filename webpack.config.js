const Encore = require('@symfony/webpack-encore');

Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'production');

Encore
    .setOutputPath('dist')
    .setPublicPath('/')
    .addEntry('webpush-client.min', './src/webpush-client.js')
    .addEntry('webpush-sw.min', './src/webpush-sw.js')
    .enableSourceMaps(false)
    .enableVersioning(false)
;


// export the final configuration
module.exports = Encore.getWebpackConfig();
