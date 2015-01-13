/// <reference path="./references.ts" />

function kLetterWords(query: string, k: number): Array<string> {
    return _.map(_.range(0, query.length-k+1), (i: number) => {
        return query.slice(i, i+k);
    });
}

// Construct a hash lookup table with pam250 values
function pam250() {
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
    var headerString = "A    R    N    D    C    Q    E    G    H    I    L    K    M    F    P    S    T    W    Y    V"
    var headers = _.str.clean(headerString).split(" ")

    var dataArray = _.map(lines, (line) => line.split(" "))

    var pam250 = {}
    _.each(headers, (header) => pam250[header] = {})
    _.each(headers, (headerRow) =>
           _.each(headers, (headerCol) => {
                  var rowIndex = _.indexOf(headers, headerRow)
                  var colIndex = _.indexOf(headers, headerCol)
                  pam250[headerRow][headerCol] = dataArray[rowIndex][colIndex]
           }
                 ))

    return pam250;
}
