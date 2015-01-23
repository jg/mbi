function queryWords(query, k) {
    return _.map(_.range(0, query.length - k + 1), function (i) {
        return {
            queryOffset: i,
            wordText: query.slice(i, i + k),
        };
    });
}
function pam250() {
    var lines = [
        '2',
        '-2	6',
        '0	0	2',
        '0	-1	2	4',
        '-2	-4	-4	-5	4',
        '0	1	1	2	-5	4',
        '0	-1	1	3	-5	2	4',
        '1	-3	0	1	-3	-1	0	5',
        '-1	2	2	1	-3	3	1	-2	6',
        '-1	-2	-2	-2	-2	-2	-2	-3	-2	5',
        '-2	-3	-3	-4	-6	-2	-3	-4	-2	2	6',
        '-1	3	1	0	-5	1	0	-2	0	-2	-3	5',
        '-1	0	-2	-3	-5	-1	-2	-3	-2	2	4	0	6',
        '-4	-4	-4	-6	-4	-5	-5	-5	-2	1	2	-5	0	9',
        '1	0	-1	-1	-3	0	-1	-1	0	-2	-3	-1	-2	-5	6',
        '1	0	1	0	0	-1	0	1	-1	-1	-3	0	-2	-3	1	3',
        '1	-1	0	0	-2	-1	0	0	-1	0	-2	0	-1	-2	0	1	3',
        '-6	2	-4	-7	-8	-5	-7	-7	-3	-5	-2	-3	-4	0	-6	-2	-5	17',
        '-3	-4	-2	-4	0	-4	-4	-5	0	-1	-1	-4	-2	7	-5	-3	-3	0	10',
        '0	-2	-2	-2	-2	-2	-2	-1	-2	4	2	-2	2	-1	-1	-1	0	-6	-2	4',
    ];
    var headerString = "A    R    N    D    C    Q    E    G    H    I    L    K    M    F    P    S    T    W    Y    V";
    var headers = _.str.clean(headerString).split(" ");
    var dataArray = _.map(lines, function (line) { return _.str.clean(line).split(" "); });
    var pam250 = {};
    _.each(headers, function (header) { return pam250[header] = {}; });
    _.each(dataArray, function (row, rowIndex) {
        _.each(row, function (value, colIndex) {
            var rowHeader = headers[rowIndex];
            var colHeader = headers[colIndex];
            pam250[rowHeader][colHeader] = parseInt(value);
            pam250[colHeader][rowHeader] = parseInt(value);
        });
    });
    return pam250;
}
function alphabet() {
    var headerString = "A    R    N    D    C    Q    E    G    H    I    L    K    M    F    P    S    T    W    Y    V";
    var headers = _.str.clean(headerString).split(" ");
    return headers;
}
function blosum62() {
    var lines = [
        ' 4',
        '-1  5',
        '-2  0  6',
        '-2 -2  1  6',
        ' 0 -3 -3  3  9',
        '-1  1  0  0 -3  5',
        '-1  0  0  2 -4  2  5',
        ' 0 -2  0 -1 -3 -2 -2  6',
        '-2  0  1 -1 -3  0  0 -2  8',
        '-1 -3 -3 -3 -1 -3 -3 -4 -3  4',
        '-1 -2 -3 -4 -1 -2 -3 -4 -3  2  4',
        '-1  2  0 -1 -3  1  1 -2 -1 -3 -2  5',
        '-1 -1 -2 -3 -1  0 -2 -3 -2  1  2 -1  5',
        '-2 -3 -3 -3 -2 -3 -3 -3 -1  0  0 -3  0  6',
        '-1 -2 -2 -1 -3 -1 -1 -2 -2 -3 -3 -1 -2 -4  7',
        ' 1 -1  1  0 -1  0  0  0 -1 -2 -2  0 -1 -2 -1  4',
        ' 0 -1  0 -1 -1 -1 -1 -2 -2 -1 -1 -1 -1 -2 -1  1  5',
        '-3 -3 -4 -4 -2 -2 -3 -2 -2 -3 -2 -3 -1  1 -4 -3 -2  11',
        '-2 -2 -2 -3 -2 -1 -2 -3  2 -1 -1 -2 -1  3 -3 -2 -2  2  7',
        ' 0 -3 -3 -3 -1 -2 -2 -3 -3  3  1 -2  1 -1 -2 -2  0 -3 -1 4',
    ];
    var headerString = "A    R    N    D    C    Q    E    G    H    I    L    K    M    F    P    S    T    W    Y    V";
    var headers = _.str.clean(headerString).split(" ");
    var dataArray = _.map(lines, function (line) { return _.str.clean(line).split(" "); });
    var blosum62 = {};
    _.each(headers, function (header) { return blosum62[header] = {}; });
    _.each(dataArray, function (row, rowIndex) {
        _.each(row, function (value, colIndex) {
            var rowHeader = headers[rowIndex];
            var colHeader = headers[colIndex];
            blosum62[rowHeader][colHeader] = parseInt(value);
            blosum62[colHeader][rowHeader] = parseInt(value);
        });
    });
    return blosum62;
}
function allKLetterWords(k) {
    var chars = alphabet();
    return _.flatten(_.map(chars, function (l1) {
        return _.map(chars, function (l2) {
            return _.map(chars, function (l3) {
                return l1 + l2 + l3;
            });
        });
    }));
}
function wordPairScore(scoringMatrix, word1, word2) {
    var letterScores = _.map(_.zip(word1, word2), function (pair) {
        return scoringMatrix[pair[0]][pair[1]];
    });
    return _.reduce(letterScores, function (acc, n) {
        return acc + n;
    }, 0);
}
function highScoringNeighbors(scoringMatrix, word, T) {
    var l = word.wordText.length;
    var words = allKLetterWords(l);
    var scoredWords = _.map(words, function (w) {
        return {
            wordText: w,
            queryOffset: word.queryOffset,
            score: wordPairScore(scoringMatrix, word.wordText, w)
        };
    });
    return _.filter(scoredWords, function (w) {
        return w.score > T;
    });
}
function findHitsInDatabase(db, words) {
    var hits = [];
    _.each(words, function (word) {
        var dbOffset = db.indexOf(word.wordText);
        if (dbOffset > -1) {
            hits.push({
                queryOffset: word.queryOffset,
                dbOffset: db.indexOf(word.wordText),
                len: word.wordText.length
            });
        }
    });
    return hits;
}
function scoreAlignment(a, search) {
    var queryPart = search.query.slice(a.queryOffset, a.queryOffset + a.len);
    var dbPart = search.db.slice(a.dbOffset, a.dbOffset + a.len);
    return wordPairScore(search.scoreMatrix, queryPart, dbPart);
}
function canLeftExtend(a, search) {
    return a.queryOffset > 0 && a.dbOffset > 0;
}
function canRightExtend(a, search) {
    return ((a.queryOffset + a.len) < search.query.length && (a.dbOffset + a.len) < search.db.length);
}
function extendAlignmentLeft(a, search) {
    if (canLeftExtend(a, search)) {
        return {
            queryOffset: a.queryOffset - 1,
            dbOffset: a.dbOffset - 1,
            len: a.len + 1
        };
    }
    else
        return a;
}
function extendAlignmentRight(a, search) {
    if (canRightExtend(a, search)) {
        return {
            queryOffset: a.queryOffset,
            dbOffset: a.dbOffset,
            len: (a.len + 1)
        };
    }
    else
        return a;
}
function findMaxAlignment(a, extendAlignment, canExtend, search) {
    var currentAlignment = a;
    var peakAlignment = a;
    var currentScore = scoreAlignment(a, search);
    var peakScore = currentScore;
    var dropOff = currentScore - peakScore;
    while (dropOff < search.allowedDropOff && canExtend(currentAlignment, search)) {
        currentAlignment = extendAlignment(currentAlignment, search);
        currentScore = scoreAlignment(currentAlignment, search);
        if (currentScore > peakScore) {
            peakScore = currentScore;
            peakAlignment = currentAlignment;
        }
        else {
            dropOff = peakScore - currentScore;
        }
    }
    if (dropOff < search.allowedDropOff) {
        return peakAlignment;
    }
    else {
        return currentAlignment;
    }
}
function findMaximalAlignment(a, search) {
    var a1 = findMaxAlignment(a, extendAlignmentLeft, canLeftExtend, search);
    return findMaxAlignment(a, extendAlignmentRight, canRightExtend, search);
}
//# sourceMappingURL=blast.js.map