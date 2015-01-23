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

interface WordNeighbors {
    [word: string]: Array<ScoredWord>
}

// provides context of a string slice
interface Slice {
    before: string
    slice: string
    after: string
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
                       contextLength: number): string
{
    var out = ''
    out += '<pre>'
    var dbPart: string = search.db.slice(a.dbOffset, a.dbOffset + a.len)

    // matching db part with context
    out += search.db.slice(a.dbOffset, a.dbOffset + a.len)

    out += "\n"

    out += connections(dbPart.length)
    out += "\n"
    out += search.query.slice(a.queryOffset, a.queryOffset + a.len)
    out += "\n"
    out += '</pre>'
    
    return out;
}

function showAlignmentWithContext(a: Alignment, search: SearchParams,
                                  contextLength: number): string
{
    var out = ''
    out += '<pre>'
    var dbSlice = sliceWithContext(search.db, a.dbOffset, a.len, contextLength)
    out += '&hellip;'
    out += dbSlice.before
    out += highlight(dbSlice.slice)
    out += dbSlice.after
    out += '&hellip;'
    out += "\n"

    out += spaces(dbSlice.before.length+1)
    out += connections(dbSlice.slice.length)
    out += spaces(dbSlice.after.length)
    out += "\n"
    out += spaces(dbSlice.before.length+1)
    out += search.query.slice(a.queryOffset, a.queryOffset + a.len)
    out += spaces(dbSlice.after.length)
    out += "\n"
    out += 'Alignment Score: ' + scoreAlignment(a, search)
    out += '</pre>'
    
    return out;
}

function highlight(text) {
    return '<span style="color:red">' + text + '</span>'
}


function sliceWithContext(text: string, 
                          offset: number, 
                          sliceLength: number,
                          context: number): Slice 
{
    var slice = text.slice(offset, offset + sliceLength)
    var before = ''
    var after = ''

    if (offset > 0) {
        if (offset - sliceLength < 0)
            before = text.slice(0, offset-1)
        else
            before = text.slice(offset - context, offset)
    } else {
        before = ""
    }
    
    if (offset + sliceLength + context < text.length)
        after = text.slice(offset + sliceLength, offset + sliceLength + context)
    else
        after = text.slice(offset + sliceLength, text.length-1)
    
    
    return {
        before: before,
        slice: slice,
        after: after
    }
}

function spaces(n: number): string {
    var connection = ''
    for (var i = 1; i <= n; i++) {
        connection += '&nbsp;'
    }
    return connection
}


function connections(n: number): string {
    var connection = ''

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
    $('#demo').append(step)
}

function createStep(stepTitle: string, stepBody: string): string {
    return showHeader(stepTitle) + "<div class=\"step\">" + stepBody + "</div>"
}

function showQueryWordsStep(qws: Array<QueryWord>) : string {
    return _.map(qws, (qw) => qw.wordText).join(', &nbsp;')
}

function showWordNeighborsWithScoresStep(wordNeighbors: WordNeighbors): string
{
    return _.map(_.keys(wordNeighbors), (wordText: string) => {
        return showWordNeighborsWithScores(wordText, wordNeighbors[wordText])
    }).join('<br /');
}

function showWordNeighborsWithScores(word: string, 
                                     neighbors: Array<ScoredWord>): string {
    var out = ''
    if (neighbors.length > 0) {
        out += bolded(word)
        out += showNewline()
        out += '<ul><li>'
        _.each(neighbors, (sw) => {
            out += sw.wordText + '(' + bolded(sw.score) + ')'
            out += ', &nbsp;'
        })
            out += '</li></ul>'
    }
    return out
}

function showHits(hits: Array<Alignment>, 
                  search: SearchParams, 
                  contextLength: number): string
{
    var out = ''
    _.each(hits, (hit) => {
        out += showAlignmentWithContext(hit, search, contextLength)
        out += showNewline()
    })
        
    return out
}

function showHitsStep(hits: Array<Alignment>,
                      search: SearchParams,
                      contextLength: number): string 
{
    return showHits(hits, search, contextLength)
}

function listItem(content): string {
    return '<li>' + content + '</li>'
}

function bolded(text): string {
    return '<b>' + text + '</b>'
}

function showExtendedHits(hits: Array<Alignment>, 
                          search: SearchParams, 
                          contextLength: number) {
    var out = ''
    _.each(hits, (hit) => {
        out += showExtendedHit(hit, search, contextLength)
        out += showNewline()
    })
        
    return out
}

function showExtendedHit(hit: Alignment, search: SearchParams, contextLength: number) {
    var extended = findMaximalAlignment(hit, search)
    return showAlignmentWithContext(extended, 
                                    search, 
                                    contextLength)
}

var presentation

function runClickHandler(): void {
    presentation = new Presentation()
    window['p'] = presentation
    $('#demo').html('Presentation started')
}

function stepClickHandler(): void {
    presentation.makeStep()
}

class Presentation {
    currentStep: number
    search: SearchParams
    T: number
    contextLength: number
    qWords: Array<QueryWord>
    steps: Array<Function>
    highScoringQueryWords: WordNeighbors
    highScoringWords: Array<ScoredWord>
    hits: Array<Alignment>

    constructor() {
        this.steps = [
            this.queryWordsStep,
            this.highScoringNeighborsStep,
            this.hitsStep
        ]
        this.currentStep = 0
    }
    
    makeStep=(): void=>  {
        if (this.currentStep == 0) this.search = getSearchParams() 

        var step = this.steps[this.currentStep]
        window['stuff'] = step
        var output = step()
        $('#demo').append(output)

        this.currentStep += 1
    }
    
    queryWordsStep=(): string => {

        this.qWords = queryWords(this.search.query, this.search.wordLength)
        return createStep("Query Words", showQueryWordsStep(this.qWords))
    }
    
    highScoringNeighborsStep=(): string => {
        var m = this.search.scoreMatrix
        var T = this.search.wordScoreThreshold

        this.highScoringQueryWords  = {}
        _.each(this.qWords, (w) => {
            var neighbors = highScoringNeighbors(m, w, T)
            if (neighbors.length > 0) 
                this.highScoringQueryWords[w.wordText] = neighbors
        })
            
        return createStep("Scored Neighbors",
                          showWordNeighborsWithScoresStep(this.highScoringQueryWords))
    }
    
    hitsStep=(): string => {
        this.highScoringWords = _.flatten(_.values(this.highScoringQueryWords))
        this.hits = findHitsInDatabase(this.search.db, this.highScoringWords)

        return createStep("Database Hits", 
                          showHitsStep(this.hits, this.search, this.contextLength))
    }
    
    extendedHitsStep=(): string => {
        return createStep("Extended Hits", showExtendedHits(this.hits, 
                                                            this.search, 
                                                            5))
    }
}

// bind to document
$(document).ready(() => {
    $('#step').click(() => {
        stepClickHandler()
        return false
    })
    $('#run').click(() => {
        runClickHandler()
        return false
    })
})