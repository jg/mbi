require.config({
    baseUrl: 'js/',

    paths: {
    },

    shim: {
        'jquery': 'vendor/jquery.min',
        'underscore': 'vendor/underscore-min',
        'underscore.string': 'vendor/underscore.string.min'
    }
});

requirejs(['main']);
