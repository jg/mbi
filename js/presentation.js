function getSearchParams() {
    var query = $('#query').val();
    var db = $('#db').val();
    var wordLength = parseInt($('#wordLength').val());
    var wordScoreThreshold = parseInt($('#wordScoreThreshold').val());
    var allowedDropOff = parseInt($('#allowedDropOff').val());
    var SValue = parseInt($('#SValue').val());
    var scoreMatrixId = $('#scoreMatrix').val();
    if (scoreMatrixId == 'pam250') {
        var scoreMatrix = pam250();
    }
    else {
        var scoreMatrix = blosum62();
    }
    return {
        query: query,
        db: db,
        scoreMatrix: scoreMatrix,
        allowedDropOff: allowedDropOff,
        wordLength: wordLength,
        wordScoreThreshold: wordScoreThreshold,
        SValue: SValue
    };
}
function showQueryWords(words) {
    var out = '';
    out += showHeader('Query words') + '<br/>';
    out += words.join('<br/>');
    return out;
}
function showAlignment(a, search, contextLength) {
    var out = '';
    out += '<pre>';
    var dbPart = search.db.slice(a.dbOffset, a.dbOffset + a.len);
    out += search.db.slice(a.dbOffset, a.dbOffset + a.len);
    out += "\n";
    out += connections(dbPart.length);
    out += "\n";
    out += search.query.slice(a.queryOffset, a.queryOffset + a.len);
    out += "\n";
    out += '</pre>';
    return out;
}
function showAlignmentWithContext(a, search, contextLength) {
    var out = '';
    out += '<pre>';
    var dbSlice = sliceWithContext(search.db, a.dbOffset, a.len, contextLength);
    out += '&hellip;';
    out += dbSlice.before;
    out += highlight(dbSlice.slice);
    out += dbSlice.after;
    out += '&hellip;';
    out += "\n";
    out += spaces(dbSlice.before.length + 1);
    out += connections(dbSlice.slice.length);
    out += spaces(dbSlice.after.length);
    out += "\n";
    out += spaces(dbSlice.before.length + 1);
    out += search.query.slice(a.queryOffset, a.queryOffset + a.len);
    out += spaces(dbSlice.after.length);
    out += "\n";
    out += 'Alignment Score: ' + scoreAlignment(a, search);
    out += '</pre>';
    return out;
}
function highlight(text) {
    return '<span style="color:red">' + text + '</span>';
}
function sliceWithContext(text, offset, sliceLength, context) {
    var slice = text.slice(offset, offset + sliceLength);
    var before = '';
    var after = '';
    if (offset > 0) {
        if (offset - sliceLength < 0)
            before = text.slice(0, offset - 1);
        else
            before = text.slice(offset - context, offset);
    }
    else {
        before = "";
    }
    if (offset + sliceLength + context < text.length)
        after = text.slice(offset + sliceLength, offset + sliceLength + context);
    else
        after = text.slice(offset + sliceLength, text.length - 1);
    return {
        before: before,
        slice: slice,
        after: after
    };
}
function spaces(n) {
    var connection = '';
    for (var i = 1; i <= n; i++) {
        connection += '&nbsp;';
    }
    return connection;
}
function connections(n) {
    var connection = '';
    for (var i = 1; i <= n; i++) {
        connection += '|';
    }
    return connection;
}
function showNewline() {
    return '<br />';
}
function showHeader(title) {
    return '<h3>' + title + '</h3>';
}
function showStep(step) {
    $('#demo').append(step);
}
function createStep(stepTitle, stepBody) {
    return "<div class=\"step\">" + showHeader(stepTitle) + stepBody + "</div>";
}
function showQueryWordsStep(qws) {
    return _.map(qws, function (qw) { return qw.wordText; }).join(', &nbsp;');
}
function showWordNeighborsWithScoresStep(wordNeighbors) {
    return _.map(_.keys(wordNeighbors), function (wordText) {
        return showWordNeighborsWithScores(wordText, wordNeighbors[wordText]);
    }).join('<br /');
}
function showWordNeighborsWithScores(word, neighbors) {
    var out = '';
    if (neighbors.length > 0) {
        out += bolded(word);
        out += showNewline();
        out += '<ul><li>';
        _.each(neighbors, function (sw) {
            out += sw.wordText + '(' + bolded(sw.score) + ')';
            out += ', &nbsp;';
        });
        out += '</li></ul>';
    }
    return out;
}
function showHits(hits, search, contextLength) {
    var out = '';
    _.each(hits, function (hit) {
        out += showAlignmentWithContext(hit, search, contextLength);
        out += showNewline();
    });
    return out;
}
function showHitsStep(hits, search, contextLength) {
    return showHits(hits, search, contextLength);
}
function listItem(content) {
    return '<li>' + content + '</li>';
}
function bolded(text) {
    return '<b>' + text + '</b>';
}
function showExtendedHits(hits, search, contextLength) {
    var out = '';
    _.each(hits, function (hit) {
        out += showExtendedHit(hit, search, contextLength);
        out += showNewline();
    });
    return out;
}
function showExtendedHit(hit, search, contextLength) {
    var extended = findMaximalAlignment(hit, search);
    return showAlignmentWithContext(extended, search, contextLength);
}
var presentation;
function runClickHandler() {
    presentation = new Presentation();
    $('#demo').html('<div class="step"><h3>Start</h3></div>');
}
function stepClickHandler() {
    presentation.makeStep();
    $('#demo').animate({ scrollTop: $('#demo')[0].scrollHeight });
}
var Presentation = (function () {
    function Presentation() {
        var _this = this;
        this.makeStep = function () {
            if (_this.currentStep == 0)
                _this.search = getSearchParams();
            var step = _this.steps[_this.currentStep];
            var output = step();
            $('#demo').append(output);
            _this.currentStep += 1;
        };
        this.queryWordsStep = function () {
            _this.qWords = queryWords(_this.search.query, _this.search.wordLength);
            return createStep("Query Words", showQueryWordsStep(_this.qWords));
        };
        this.highScoringNeighborsStep = function () {
            var m = _this.search.scoreMatrix;
            var T = _this.search.wordScoreThreshold;
            _this.highScoringQueryWords = {};
            _.each(_this.qWords, function (w) {
                var neighbors = highScoringNeighbors(m, w, T);
                if (neighbors.length > 0)
                    _this.highScoringQueryWords[w.wordText] = neighbors;
            });
            return createStep("Scored Word Neighbors", showWordNeighborsWithScoresStep(_this.highScoringQueryWords));
        };
        this.hitsStep = function () {
            _this.highScoringWords = _.flatten(_.values(_this.highScoringQueryWords));
            _this.hits = findHitsInDatabase(_this.search.db, _this.highScoringWords);
            return createStep("Database Hits", showHitsStep(_this.hits, _this.search, _this.contextLength));
        };
        this.extendedHitsStep = function () {
            return createStep("Extended Database Hits", showExtendedHits(_this.hits, _this.search, 5));
        };
        this.steps = [
            this.queryWordsStep,
            this.highScoringNeighborsStep,
            this.hitsStep,
            this.extendedHitsStep
        ];
        this.currentStep = 0;
        this.contextLength = 5;
    }
    return Presentation;
})();
$(document).ready(function () {
    $('#step').click(function () {
        stepClickHandler();
        return false;
    });
    $('#run').click(function () {
        runClickHandler();
        return false;
    });
});
//# sourceMappingURL=presentation.js.map