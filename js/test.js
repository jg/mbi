QUnit.test("pam250", function (assert) {
    assert.equal(pam250()['A']['A'], 2);
    assert.equal(pam250()['A']['R'], -2);
    assert.equal(pam250()['R']['A'], -2);
    assert.equal(pam250()['E']['E'], 4);
});
QUnit.test("alphabet", function (assert) {
    assert.equal(alphabet().length, 20);
});
QUnit.test("wordPairScore", function (assert) {
    assert.equal(wordPairScore(pam250(), "PQG", "QGE"), -1);
    assert.equal(wordPairScore(pam250(), "PQG", "GEF"), -4);
});
QUnit.test("wordPairScore / blosum62", function (assert) {
    assert.equal(wordPairScore(blosum62(), "RGD", "RGD"), 17);
    assert.equal(wordPairScore(blosum62(), "RGD", "KGD"), 14);
});
QUnit.test("highScoringNeighbors / pam250", function (assert) {
    var expected = ["PAG", "PRG", "PNG", "PDG", "PQA", "PQD", "PQG", "PQS", "PEG", "PHG", "PKG", "PPG"];
    var w = {
        wordText: "PQG",
        queryOffset: 0
    };
    assert.deepEqual(highScoringNeighbors(pam250(), w, 10), expected);
});
//# sourceMappingURL=test.js.map