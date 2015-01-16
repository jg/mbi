/// <reference path="./references.ts" />

interface ScoreMatrixRow {
    [letter: number]: number
}

interface ScoreMatrix {
    [letter: number]: ScoreMatrixRow
}

interface QueryWord {
    queryOffset: number
    wordText: string
}

interface Alignment {
    queryOffset: number
    dbOffset: number
    length: number
}

interface SearchParams {
    query: string
    db: string
    scoreMatrix: ScoreMatrix
    allowedDropOff: number
}

interface ExtendAlignmentFn extends Function {
    (a: Alignment, params: SearchParams): Alignment
}

interface CanExtendAlignmentFn extends Function {
    (a: Alignment, params: SearchParams): Boolean
}

// Return k letter substrings of query
function queryWords(query: string, k: number): Array<QueryWord> {
    return _.map(_.range(0, query.length-k+1), (i: number) => {
        return {
            queryOffset: i,
            wordText: query.slice(i, i+k),
        }
    });
}

// http://www.icp.ucl.ac.be/~opperd/private/pam250.html
// Hash lookup table with pam250 values. pam250['A']['R'] = 3
function pam250(): ScoreMatrix {
    var lines =
        ['13 6 9 9 5 8 9 12 6 8 6 7 7 4 11 11 11 2 4 9',
         '3 17 4 3 2 5 3 2 6 3 2 9 4 1 4 4 3 7 2 2',
         '4 4 6 7 2 5 6 4 6 3 2 5 3 2 4 5 4 2 3 3',
         '5 4 8 11 1 7 10 5 6 3 2 5 3 1 4 5 5 1 2 3',
         '2 1 1 1 52 1 1 2 2 2 1 1 1 1 2 3 2 1 4 2',
         '3 5 5 6 1 10 7 3 7 2 3 5 3 1 4 3 3 1 2 3',
         '5 4 7 11 1 9 12 5 6 3 2 5 3 1 4 5 5 1 2 3',
         '12 5 10 10 4 7 9 27 5 5 4 6 5 3 8 11 9 2 3 7',
         '2 5 5 4 2 7 4 2 15 2 2 3 2 2 3 3 2 2 3 2',
         '3 2 2 2 2 2 2 2 2 10 6 2 6 5 2 3 4 1 3 9',
         '6 4 4 3 2 6 4 3 5 15 34 4 20 13 5 4 6 6 7 13',
         '6 18 10 8 2 10 8 5 8 5 4 24 9 2 6 8 8 4 3 5',
         '1 1 1 1 0 1 1 1 1 2 3 2 6 2 1 1 1 1 1 2',
         '2 1 2 1 1 1 1 1 3 5 6 1 4 32 1 2 2 4 20 3',
         '7 5 5 4 3 5 4 5 5 3 3 4 3 2 20 6 5 1 2 4',
         '9 6 8 7 7 6 7 9 6 5 4 7 5 3 9 10 9 4 4 6',
         '8 5 6 6 4 5 5 6 4 6 4 6 5 3 6 8 11 2 3 6',
         '0 2 0 0 0 0 0 0 1 0 1 0 0 1 0 1 0 55 1 0',
         '1 1 2 1 3 1 1 1 3 2 2 1 2 15 1 2 2 3 31 2',
         '7 4 4 4 4 4 4 4 5 4 15 10 4 10 5 5 5 72 4 17']
    var headerString = 
        "A    R    N    D    C    Q    E    G    H    I    L    K    M    F    P    S    T    W    Y    V"
    var headers = _.str.clean(headerString).split(" ")

    var dataArray = _.map(lines, (line) => line.split(" "))

    var pam250: ScoreMatrix = {}
    _.each(headers, (header) => pam250[header] = {})

        _.each(headers, (headerRow) => {
            _.each(headers, (headerCol) => {
                var rowIndex = _.indexOf(headers, headerRow)
                var colIndex = _.indexOf(headers, headerCol)
                pam250[headerRow][headerCol] = parseInt(dataArray[rowIndex][colIndex])
            })
        })

    return pam250;
}

function alphabet(): Array<string> {
    var headerString = "A    R    N    D    C    Q    E    G    H    I    L    K    M    F    P    S    T    W    Y    V"
    var headers = _.str.clean(headerString).split(" ")
    return headers
}

function allKLetterWords(k: number): Array<string> {
    var chars: Array<string> = alphabet()
    return _.flatten(
        _.map(chars, (l1) => {
            return _.map(chars, (l2) => {
                return _.map(chars, (l3) => {
                    return l1 + l2 + l3
                })
            })
        }))
}


// Compute word pair score given the scoringMatrix.
// Words should be of same length.
function wordPairScore(scoringMatrix: ScoreMatrix,
                       word1: string,
                       word2: string): number {
    var letterScores: Array<number> =
        _.map(_.zip(word1, word2), (pair: Array<string>) => {
            return scoringMatrix[pair[0]][pair[1]]
        })
    return _.reduce(letterScores, (acc: number, n: number) => { return acc + n }, 0)
}

function highScoringNeighbors(scoringMatrix: ScoreMatrix,
                              word: string, T: number) {
    var l = word.length
    return _.filter(allKLetterWords(l), (w) => {
        return (wordPairScore(scoringMatrix, word, w) > T)
    })
}


function findHitsInDatabase(db: string,
                            words: Array<QueryWord>): Array<Alignment> {
   return _.map(words, (word: QueryWord) => {
       return {
           queryOffset: word.queryOffset,
           dbOffset: db.indexOf(word.wordText),
           length: word.wordText.length
       }
    })
}

function scoreAlignment(a: Alignment, search: SearchParams): number {
    var queryPart = search.query.slice(a.queryOffset, a.queryOffset + a.length)
    var dbPart = search.db.slice(a.dbOffset, a.dbOffset + a.length)
    return wordPairScore(search.scoreMatrix, queryPart, dbPart)
}

function canLeftExtend(a: Alignment, search: SearchParams): Boolean {
    return a.queryOffset > 0 && a.dbOffset > 0;
}

function canRightExtend(a: Alignment, search: SearchParams): Boolean {
    return ((a.queryOffset + a.length) < search.query.length &&
            (a.dbOffset + a.length) < search.db.length)
}

function extendAlignmentLeft(a: Alignment, search: SearchParams): Alignment {
    if (canLeftExtend(a, search)) {
        return {
            queryOffset: a.queryOffset - 1,
            dbOffset: a.dbOffset - 1,
            length: a.length + 1
        }
    } else
        return a
}

function extendAlignmentRight(a: Alignment, search: SearchParams): Alignment {
    if (canRightExtend(a, search)) {
        return {
            queryOffset: a.queryOffset,
            dbOffset: a.dbOffset,
            length: a.length + 1
        }
    } else
        return a
}

function findMaxAlignmentLeft(a: Alignment,
                              search: SearchParams): Alignment
{
    return findMaxAlignment(a, extendAlignmentRight, canRightExtend, search)
}

function findMaxAlignmentRight(a: Alignment,
                               search: SearchParams): Alignment
{
    return findMaxAlignment(a, extendAlignmentLeft, canLeftExtend, search)
}

function findMaxAlignment(a: Alignment,
                          extendAlignment: ExtendAlignmentFn,
                          canExtend: CanExtendAlignmentFn,
                          search: SearchParams): Alignment
{
    var currentAlignment = a

    // hold the peak score and alignment so we can go back
    var peakScore = currentScore
    var peakAlignment = a


    var currentScore = scoreAlignment(a, search)
    var dropOff = currentScore - peakScore

    while (dropOff < search.allowedDropOff && canExtend(a, search)) {
        currentAlignment = extendAlignment(a, search)

        currentScore =
            scoreAlignment(currentAlignment, search)

        if (currentScore > peakScore) {
            // found a new peak
            peakScore = currentScore
            peakAlignment = currentAlignment
        } else {
            // found a new cliff
            dropOff = peakScore - currentScore
        }
    }

    if (dropOff < search.allowedDropOff) {
        return peakAlignment
    } else {
        return currentAlignment
    }
}