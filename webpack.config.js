const Encore = require('@symfony/webpack-encore');

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