/// <reference path="./references.ts" />

require(
    [
        'blast',
        'jquery'
    ],
    (Blast, $) => {
        'use strict';
 
        $(document).ready(function () {
            var app = new Blast();
            app.appendTo('body');
        });
    }
);