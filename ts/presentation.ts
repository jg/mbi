interface SearchParams {
    query: string
    db: string
    scoreMatrix: ScoreMatrix
    allowedDropOff: number
    wordLength: number
    wordScoreThreshold: number
    SValue: number
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

function showAlignment(a: Alignment, search: SearchParams,
                       contextLength: number): void
{
    var out = ''
    var dbPart: string = search.db.slice(a.dbOffset, a.length)

    // matching db part with context
    out += search.db.slice(a.dbOffset, a.length)

    out += showNewline()

    out += connections(dbPart.length)
    out += showNewline()
    out += search.query.slice(a.queryOffset, a.length)
    out += showNewline()
}

function connections(n: number): string {
    var connection = '|'

    for (var i = 1; i <= n; i++) {
        connection += '|'
    }
    return connection
}

function showNewline() {
    return '<br />'
}

function showHeader(title: string): string {
    return '<h3>' + title + '</h3>'
}

function showStep(step: string): void {
    $('#demo').html(step)
}

function createStep(stepTitle: string, stepBody: string): string {
    return showHeader(stepTitle) + "<div class=\"step\">" + stepBody + "</div>"
}

function showQueryWordsStep(qws: Array<QueryWord>) : string {
    return _.map(qws, (qw) => qw.wordText).join('<br />')
}

function showWordNeighborsWithScoresStep(m: ScoreMatrix,
                                         words: Array<QueryWord>,
                                         T: number)
{
    return _.map(words, (w) => showWordNeighborsWithScores(m, w, T)).join()
}

function showWordNeighborsWithScores(scoringMatrix: ScoreMatrix,
                                     word: QueryWord,
                                     T: number) {
    var scoredWords: Array<ScoredWord> =
        highScoringNeighbors(scoringMatrix,
                             word.wordText,
                             T)
    var out = ''
    if (scoredWords.length > 0) {
        out += bolded(word.wordText)
        out += showNewline()
        out += '<ul>'
        _.each(scoredWords, (sw) => {
            out += listItem(sw.word + '(' + bolded(sw.score) + ')')
        })
            out += '</ul>'
    }
    return out
}

function listItem(content): string {
    return '<li>' + content + '</li>'
}

function bolded(text): string {
    return '<b>' + text + '</b>'
}

function stepClickHandler(): void {
    var search = getSearchParams()
    var m = search.scoreMatrix
    var T = search.wordScoreThreshold

    var qws: Array<QueryWord> = queryWords(search.query, search.wordLength)

    var qwStep: string = createStep("Query Words", showQueryWordsStep(qws))
    var neighborsStep: string =
        createStep("Scored Neighbors",
                   showWordNeighborsWithScoresStep(m, qws, T))

    var steps = [
        qwStep,
        neighborsStep
    ]

    showStep(steps.join('<br />'))
}

// bind to document
$(document).ready(() => {
    $('#step').click(() => {
        stepClickHandler()
    })
})