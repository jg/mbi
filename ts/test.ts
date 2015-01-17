/// <reference path="./references.ts" />

QUnit.test("pam250", (assert) => {
    assert.equal(pam250()['A']['A'], 2)
    assert.equal(pam250()['A']['R'], -2)
    assert.equal(pam250()['R']['A'], -2)
    assert.equal(pam250()['E']['E'], 4)
})


QUnit.test("alphabet", (assert) => {
    assert.equal(alphabet().length, 20)
})

QUnit.test("wordPairScore", (assert) => {
    assert.equal(wordPairScore(pam250(), "PQG", "QGE"), -1)
    assert.equal(wordPairScore(pam250(), "PQG", "GEF"), -4)
})

QUnit.test("highScoringNeighbors / pam250", (assert) => {
    var expected = 
        [  "PAG",
           "PRG",
           "PNG",
           "PDG",
           "PQA",
           "PQD",
           "PQG",
           "PQS",
           "PEG",
           "PHG",
           "PKG",
           "PPG"]
    assert.deepEqual(highScoringNeighbors(pam250(), "PQG", 10), expected)
})