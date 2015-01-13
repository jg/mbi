/// <reference path="./references.ts" />
QUnit.test("kLetterWords", function (assert) {
    var value = "hello";
    var words = kLetterWords("PQGEFG", 3);
    assert.deepEqual(words, ["PQG", "QGE", "GEF", "EFG"]);
});

QUnit.test("pam250", function (assert) {
    var pam250 = pam250();
    assert.equal(pam250['A']['A'], 13);
    assert.equal(pam250['A']['R'], 6);
    assert.equal(pam250['R']['A'], 3);
});
