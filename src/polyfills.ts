/* istanbul ignore next */
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#Polyfill
if (!Object.entries) {
  Object.entries = function (obj: any) {
    var ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }

    return resArray;
  }
}

/* istanbul ignore next */
function ensurePerformance(window: Window) {
  const _entries: any[] = [];
  const _marksIndex: any = {};

  function _filterEntries(key: string, value: any) {
    var i = 0, n = _entries.length, result = [];
    for (; i < n; i++) {
      if (_entries[i][key] == value) {
        result.push(_entries[i]);
      }
    }
    return result;
  }

  function _clearEntries(type: string, name: string) {
    var i = _entries.length, entry;
    while (i--) {
      entry = _entries[i];
      if (entry.entryType == type && (name === void 0 || entry.name == name)) {
        _entries.splice(i, 1);
      }
    }
  };

  if (window.performance === undefined) {
    (window as any).performance = {};
  }

  if (window.performance.now === undefined) {
    let nowOffset = Date.now();

    window.performance.now = function now() {
      return Date.now() - nowOffset;
    };
  }

  if (!window.performance.mark) {
    window.performance.mark = (window.performance as any).webkitMark || function (name) {
      const mark = {
        name,
        entryType: "mark",
        startTime: window.performance.now(),
        duration: 0
      };

      _entries.push(mark);
      _marksIndex[name] = mark;
    };
  }


  if (!window.performance.measure) {
    window.performance.measure = (window.performance as any).webkitMeasure || function (name, startMark: any, endMark: any) {
      startMark = _marksIndex[startMark].startTime;
      endMark = _marksIndex[endMark].startTime;

      _entries.push({
        name,
        entryType: "measure",
        startTime: startMark,
        duration: endMark - startMark
      });
    };
  }


  if (!window.performance.getEntriesByType) {
    window.performance.getEntriesByType = (window.performance as any).webkitGetEntriesByType || function (type) {
      return _filterEntries("entryType", type);
    };
  }


  if (!window.performance.getEntriesByName) {
    window.performance.getEntriesByName = (window.performance as any).webkitGetEntriesByName || function (name) {
      return _filterEntries("name", name);
    };
  }


  if (!window.performance.clearMarks) {
    window.performance.clearMarks = (window.performance as any).webkitClearMarks || function (name: string) {
      _clearEntries("mark", name);
    };
  }


  if (!window.performance.clearMeasures) {
    window.performance.clearMeasures = (window.performance as any).webkitClearMeasures || function (name: string) {
      _clearEntries("measure", name);
    };
  }
}

ensurePerformance(window);
