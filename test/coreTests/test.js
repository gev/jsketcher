
export class TestEnv {

  constructor(callback) {
    this.failed = false;
    this.finished = false;
    this.error = undefined;
    this.callback = callback;
    this.took = performance.now()
  }

  done() {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.took = performance.now() - this.took;
    this.callback(this);
  }

  fail(msg, optionalMsg) {
    this.failed = true;
    this.error = msg + (optionalMsg === undefined ? '' : ' ' + optionalMsg);
    this.done();
    throw assert.fail(this.error);
  }

  terminateOnError(error) {
    this.failed = true;
    this.error = error + "";
    this.done();
    throw error;
  }

  test(testBlock) {
    const env = this;
    return function() {
      try {
        testBlock.apply(this, arguments);
      } catch (e) {
        if (!env.finished) {
          env.terminateOnError(e);
        }
        console.error(e);
      }
    }
  }

  assertTrue(stmt, msg) {
    if (!stmt) {
      this.fail('assertTrue fails.', msg);
    }
  }

  assertEmpty(array, msg) {
    if (array.length !== 0) {
      this.fail('assertEmpty fails. Array length = ' + array.length, msg);
    }
  }

  assertFalse(stmt, msg) {
    if (stmt) {
      this.fail('assertFalse fails.', msg);
    }
  }
  
  assertEquals(expected, actual, msg) {
    if (expected !== actual) {
      this.fail('assertEquals: Expected: ' + expected + ' but was ' + actual, msg);
    }
  }

  assertFloatEquals(expected, actual, msg) {
    if (Math.abs(expected - actual) >= 1E-6) {
      this.fail('assertFloatEquals: Expected: ' + expected + ' but was ' + actual, msg);
    }
  }

  assertPointXY2DEquals(expectedX, expectedY, actual, msg) {
    if (actual.x !== expectedX || actual.y !== expectedY) {
      this.fail('assertPoint2DEquals: Expected: (' +  expectedX + ', ' + expectedY + ') but was (' + actual.x + ', ' + actual.y + ')' , msg);
    }
  }
  
  assertPoint2DEquals(expected, actial, msg) {
    this.assertPointXY2DEquals(expected.x, expected.y, actial, msg);
  }
  
  assertData(expected, actual) {
    const expectedJSON = JSON.stringify(expected).replace(/\s/g, '');
    const actualJSON = JSON.stringify(actual).replace(/\s/g, '');
    if (actualJSON !== expectedJSON) {
      console.log('EXPECTED:');
      console.log(this.prettyJSON(expected));
      console.log('ACTUAL:');
      console.log(this.prettyJSON(actual));
      if (checkSimilarity(expected, actual)) {
        console.log("The data is similar(has same number of faces, loops and half-edges). Most likely it the test needs to be updated.");
      } else {
        console.warn("The data isn't similar(has different number of faces, loops or half-edges). Most likely something is really broken.");
      }
      this.fail('expected data different from actual. ^^see log above^^');
    }
  }

  prettyJSON(obj) {
    return JSON.stringify(obj, null, 0);
  }
}

function checkSimilarity(data1, data2) {

  function edgesCount(data) {
    let count = 0;
    for (let face of data.faces) {
      face.forEach((loop) => count += loop.length);
    }  
    return count;
  }

  function loopsCount(data) {
    let count = 0;
    for (let face of data.faces) {
      face.forEach(() => count ++);
    }  
    return count;
  }

  function info(data) {
    const loops = loopsCount(data);
    const edges = edgesCount(data);
    return `faces: ${data.faces.length}; loops: ${loops}; half-edges: ${edges}`;
  }

  const info1 = info(data1);
  const info2 = info(data2);
  console.log(info1 + " : " + info2);
  return info1 === info2; 

}