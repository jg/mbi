/// <reference path="./references.ts" />

QUnit.test("pam250", (assert) => {
    assert.equal(pam250()['A']['A'], 13)
    assert.equal(pam250()['A']['R'], 6)
    assert.equal(pam250()['R']['A'], 3)
})


QUnit.test("alphabet", (assert) => {
    assert.equal(alphabet().length, 20)
})

QUnit.test("wordPairScore", (assert) => {
    assert.equal(wordPairScore(pam250(), "PQG", "QGE"), 17)
    assert.equal(wordPairScore(pam250(), "PQG", "GEF"), 15)
})

QUnit.test("highScoringNeighbors / pam250", (assert) => {
    var expected = ["PRG", "PNG", "PDG", "PQG", "PEG", "PHG", "PKG", "PPG"]
    assert.deepEqual(highScoringNeighbors(pam250(), "PQG", 50), expected)
})