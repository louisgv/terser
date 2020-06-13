import assert from "assert";
import { exec } from "child_process";
import path from "path";

describe("bin/terser with input file globs", function() {
    var tersercmd = '"' + process.argv[0] + '" bin/terser';
    it("bin/terser with one input file extension glob.", function(done) {
        var command = tersercmd + ' "test/input/issue-1242/foo.*" -cm';

        exec(command, function(err, stdout) {
            if (err) throw err;

            assert.strictEqual(stdout, 'var print=console.log.bind(console);function foo(o){print("Foo:",2*o)}\n');
            done();
        });
    });
    it("bin/terser with one input file name glob.", function(done) {
        var command = tersercmd + ' "test/input/issue-1242/b*.es5" -cm';

        exec(command, function(err, stdout) {
            if (err) throw err;

            assert.strictEqual(stdout, 'function bar(n){return 3*n}function baz(n){return n/2}\n');
            done();
        });
    });
    it("bin/terser with multiple input file globs.", function(done) {
        var command = tersercmd + ' "test/input/issue-1242/???.es5" "test/input/issue-1242/*.js" -mc toplevel,passes=3';

        exec(command, function(err, stdout) {
            if (err) throw err;

            assert.strictEqual(stdout, 'var print=console.log.bind(console);print("qux",9,6),print("Foo:",22);\n');
            done();
        });
    });
    it("Should throw with non-matching glob string", function(done) {
        var command = tersercmd + ' "test/input/issue-1242/blah.*"';

        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.ok(/^ERROR: ENOENT/.test(stderr));
            done();
        });
    });
    it('"?" in glob string should not match "/"', function(done) {
        var command = tersercmd + ' "test/input?issue-1242/foo.*"';

        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.ok(/^ERROR: ENOENT/.test(stderr));
            done();
        });
    });
    it("Should handle special characters in glob string", function(done) {
        var command = tersercmd + ' "test/input/issue-1632/^{*}[???](*)+$.??" -cm';

        exec(command, function(err, stdout) {
            if (err) throw err;

            assert.strictEqual(stdout, "console.log(x);\n");
            done();
        });
    });
    it("Should handle array of glob strings - matching and otherwise", function(done) {
        var dir = "test/input/issue-1242";
        var command = tersercmd + ' "' + [
            path.join(dir, "b*.es5"),
            path.join(dir, "z*.es5"),
            path.join(dir, "*.js")
        ].join('" "') + '"';

        exec(command, function(err, stdout, stderr) {
            assert.ok(err);
            assert.ok(/^ERROR: ENOENT.*?z\*\.es5/.test(stderr));
            done();
        });
    });
});
