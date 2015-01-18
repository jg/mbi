interface SearchParams {
    query: string
    db: string
    scoreMatrix: ScoreMatrix
    allowedDropOff: number
    wordLength: number
    wordScoreThreshold: number
    SValue: number
}

interface Neighbor {
    word: string
    score: number
}

interface ExtendAlignmentFn extends Function {
    (a: Alignment, params: SearchParams): Alignment
}

interface CanExtendAlignmentFn extends Function {
    (a: Alignment, params: SearchParams): Boolean
}


function getSearchParams(): SearchParams {
    var query = $('#query').val()
    var db = $('#db').val()
    var wordLength = parseInt($('#wordLength').val())
    var wordScoreThreshold = parseInt($('#wordScoreThreshold').val())
    var allowedDropOff = parseInt($('#allowedDropOff').val())
    var SValue = parseInt($('#SValue').val())
    var scoreMatrixId = $('#scoreMatrix').val()

    if (scoreMatrixId == 'pam250') {
        var scoreMatrix = pam250()
    } else {
        var scoreMatrix = blosum62()
    }

    return {
        query: query,
        db: db,
        scoreMatrix: scoreMatrix,
        allowedDropOff: allowedDropOff,
        wordLength: wordLength,
        wordScoreThreshold: wordScoreThreshold,
        SValue: SValue
    }
}

function showQueryWords(words: Array<string>): string {
    var out = ''
    out += showHeader('Query words') + '<br/>'
    out += words.join('<br/>')
    return out
}

function showWordNeighborsWithScores(word: string,
                                     neighbors: Array<Neighbor>): string {
    var out = ''
    out += showHeader(word + ' high scoring neighbors:') + '<br/>'
    out += '<ul>'
    _.map(neighbors, (neighbor) => {
        out += '<li>' + neighbor.word + ' (' + neighbor.score + ')'
    })
    out += '</ul>'
    return out
}

function showHeader(title: string): string {
    return '<h3>' + title + '</h3>'
}

function showStep(step: string): void {
    $('#demo').html(step)
}