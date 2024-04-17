/*!
 * Application Insights JavaScript SDK - Web, 3.1.0
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */
!(function (n, e) {
  var t,
    r,
    i = {},
    o = '__ms$mod__',
    a = {},
    u = (a.es5_ai_3_1_0 = {}),
    c = '3.1.0',
    s = 'Microsoft',
    f = ((f = n = n[s] = n[s] || {})[(s = 'ApplicationInsights3')] =
      f[s] || {}),
    l = ((l = n)[(s = 'ApplicationInsights')] = l[s] || {}),
    n = (f[o] = f[o] || {}),
    d = (n.v = n.v || []),
    s = (l[o] = l[o] || {}),
    v = (s.v = s.v || []);
  for (r in ((s.o = s.o || []).push(a), e(i), i))
    (t = 'x'),
      (f[r] = i[r]),
      (d[r] = c),
      'undefined' == typeof l[r]
        ? ((t = 'n'), (l[r] = i[r]) && (v[r] = c))
        : v[r] || (v[r] = '---'),
      (u[t] = u[t] || []).push(r);
})(this, function (n) {
  'use strict';
  var J = undefined,
    x = null,
    c = '',
    s = 'boolean',
    f = 'function',
    h = 'number',
    m = 'object',
    w = 'prototype',
    b = '__proto__',
    e = 'string',
    I = 'undefined',
    C = 'constructor',
    T = 'Symbol',
    k = '_polyfill',
    _ = 'indexOf',
    D = 'length',
    E = 'done',
    P = 'value',
    M = 'name',
    Y = 'slice',
    Q = 'call',
    N = 'toString',
    A = Object,
    R = A[w],
    t = String,
    U = t[w],
    q = Math,
    r = Array,
    Z = r[w];
  function O(n, e) {
    try {
      return { v: n.apply(this, e) };
    } catch (t) {
      return { e: t };
    }
  }
  var F = [e, h, s, I, 'symbol', 'bigint'];
  function V(e) {
    return function (n) {
      return typeof n === e;
    };
  }
  function z(n) {
    var e = '[object ' + n + ']';
    return function (n) {
      return !(!n || R.toString.call(n) !== e);
    };
  }
  function pn(n) {
    return typeof n === I || n === I;
  }
  function gn(n) {
    return n === x || pn(n);
  }
  function H(n) {
    return !!n || n !== J;
  }
  var G = V(e),
    $ = V(f);
  function Dn(n) {
    return !((!n && gn(n)) || !n || typeof n !== m);
  }
  var hn = r.isArray,
    j = z('Date'),
    nn = V(h),
    En = V(s),
    en = z('Error');
  function tn(n) {
    return n && n.then && $(n.then);
  }
  function rn(n) {
    return !(
      !n ||
      ((e = !n),
      (t = O(function () {
        return !(n && 0 + n);
      })).e
        ? e
        : t.v)
    );
    var e, t;
  }
  var on = A.getOwnPropertyDescriptor;
  function an(n, e) {
    return !!n && R.hasOwnProperty[Q](n, e);
  }
  var Pn =
    A.hasOwn ||
    function (n, e) {
      return an(n, e) || !!on(n, e);
    };
  function B(n, e, t) {
    if (n && Dn(n))
      for (var r in n) if (Pn(n, r) && -1 === e[Q](t || n, r, n[r])) break;
  }
  function un(n, t, r, e) {
    var i = {};
    return (
      B(n, function (n, e) {
        (i[n] = t ? e : n), (i[e] = r ? e : n);
      }),
      e(i)
    );
  }
  function cn(n) {
    throw Error(n);
  }
  function sn(n) {
    throw new TypeError(n);
  }
  var fn = A.freeze,
    ln = A.assign,
    Mn = A.keys;
  function dn(n) {
    return (
      fn &&
        B(n, function (n, e) {
          (hn(e) || Dn(e)) && fn(e);
        }),
      vn(n)
    );
  }
  var vn =
      fn ||
      function (n) {
        return n;
      },
    Nn =
      A.getPrototypeOf ||
      function (n) {
        return n[b] || x;
      };
  function An(n) {
    return un(n, 0, 0, dn);
  }
  var Rn,
    Un = An({
      asyncIterator: 0,
      hasInstance: 1,
      isConcatSpreadable: 2,
      iterator: 3,
      match: 4,
      matchAll: 5,
      replace: 6,
      search: 7,
      species: 8,
      split: 9,
      toPrimitive: 10,
      toStringTag: 11,
      unscopables: 12,
    }),
    Ln = t,
    qn = '__tsUtils$gblCfg';
  function On() {
    var n;
    return (n =
      (n =
        (n = typeof globalThis !== I ? globalThis : n) || typeof self === I
          ? n
          : self) || typeof window === I
        ? n
        : window) || typeof global === I
      ? n
      : global;
  }
  function Fn() {
    var n;
    return Rn || ((n = O(On).v || {}), (Rn = n[qn] = n[qn] || {})), Rn;
  }
  var Vn,
    zn = '[object Error]';
  function mn(n, e) {
    var t = c,
      r = R[N][Q](n);
    r === zn &&
      (n = { stack: Ln(n.stack), message: Ln(n.message), name: Ln(n.name) });
    try {
      t =
        ((t = JSON.stringify(n, x, e ? (typeof e === h ? e : 4) : J)) &&
          t.replace(/"(\w+)"\s*:\s{0,1}/g, '$1: ')) ||
        Ln(n);
    } catch (i) {
      t = ' - ' + mn(i, e);
    }
    return r + ': ' + t;
  }
  function Hn(r, n, i) {
    Vn = Vn || Z[Y];
    var o = n && n[r];
    return function (n) {
      var e,
        t = (n && n[r]) || o;
      if (t || i)
        return (e = arguments), (t || i).apply(n, t ? Vn[Q](e, 1) : e);
      sn('"' + Ln(r) + '" not defined for ' + mn(n));
    };
  }
  function jn(e) {
    return function (n) {
      return n[e];
    };
  }
  var Bn = q.max,
    Kn = Hn(Y, U),
    Xn = Hn('substring', U),
    Wn = Hn('substr', U, Jn);
  function Jn(n, e, t) {
    return (
      gn(n) && sn("'polyStrSubstr called with invalid " + mn(n)),
      t < 0
        ? c
        : ((e = e || 0) < 0 && (e = Bn(e + n[D], 0)),
          pn(t) ? Kn(n, e) : Kn(n, e, e + t))
    );
  }
  function Gn(n, e) {
    return Xn(n, 0, e);
  }
  var $n, Yn;
  function Qn(n) {
    var e = {
      description: Ln(n),
      toString: function () {
        return T + '(' + n + ')';
      },
    };
    return (e[k] = !0), e;
  }
  var y,
    Zn = {
      e: 'enumerable',
      c: 'configurable',
      v: P,
      w: 'writable',
      g: 'get',
      s: 'set',
    },
    ne = A.defineProperty;
  function yn(n, e, t) {
    return ne(
      n,
      e,
      ((r = t),
      ((i = {})[Zn.c] = !0),
      (i[Zn.e] = !0),
      r.l &&
        ((i.get = function () {
          return r.l.v;
        }),
        (n = on(r.l, 'v')) &&
          n.set &&
          (i.set = function (n) {
            r.l.v = n;
          })),
      B(r, function (n, e) {
        i[Zn[n]] = pn(e) ? i[Zn[n]] : e;
      }),
      i)
    );
    var r, i;
  }
  function ee() {
    y = Fn();
  }
  function te(e) {
    var t = {};
    return (
      y || ee(),
      (t.b = y.lzy),
      ne(t, 'v', {
        configurable: !0,
        get: function () {
          var n = e();
          return y.lzy || ne(t, 'v', { value: n }), (t.b = y.lzy), n;
        },
      }),
      t
    );
  }
  function re(e, t) {
    return te(function () {
      var n = O(e);
      return n.e ? t : n.v;
    });
  }
  function ie(n) {
    return ne(
      {
        toJSON: function () {
          return n;
        },
      },
      'v',
      { value: n }
    );
  }
  var oe,
    ae,
    ue,
    ce,
    se,
    fe,
    le,
    de,
    ve,
    pe,
    ge = 'window';
  function he(n) {
    return te(function () {
      return O(xn, [n]).v || J;
    });
  }
  function me(n) {
    return y || ee(), (oe = oe && !1 !== n && !y.lzy ? oe : ie(O(On).v || x)).v;
  }
  function xn(n, e) {
    e = oe && !1 !== e ? oe.v : me(e);
    return e && e[n] ? e[n] : n === ge && ae ? ae.v : x;
  }
  function ye() {
    return y || ee(), (ue = ue && !y.lzy ? ue : ie(O(xn, ['document']).v)).v;
  }
  function xe() {
    return y || ee(), (ae = ae && !y.lzy ? ae : ie(O(xn, [ge]).v)).v;
  }
  function we() {
    return y || ee(), (ce = ce && !y.lzy ? ce : ie(O(xn, ['navigator']).v)).v;
  }
  function be() {
    return y || ee(), (se = se && !y.lzy ? se : ie(O(xn, ['history']).v)).v;
  }
  function Ie() {
    return (fe =
      fe ||
      ie(
        !!O(function () {
          return self && self instanceof WorkerGlobalScope;
        }).v
      )).v;
  }
  function Ce() {
    (de && de.b) ||
      ((de = he(T)),
      (ve = re(function () {
        return de.v ? de.v['for'] : J;
      }, J)));
  }
  function Te(n, e) {
    var t = Un[n];
    return (
      y || ee(),
      (de && !y.lzy) || Ce(),
      de.v
        ? de.v[t || n]
        : e
          ? J
          : ((Yn = Yn || {}),
            (t = Un[n]) ? (Yn[t] = Yn[t] || Qn(T + '.' + t)) : void 0)
    );
  }
  function Se(n, e) {
    return y || ee(), (de && !y.lzy) || Ce(), de.v ? de.v(n) : e ? x : Qn(n);
  }
  function ke(n) {
    return (
      y || ee(),
      (ve && de && !y.lzy) || Ce(),
      (
        ve.v ||
        function (n) {
          $n || ((r = Fn()), ($n = r.gblSym = r.gblSym || { k: {}, s: {} }));
          var e,
            t,
            r = $n;
          return (
            Pn(r.k, n) ||
              ((e = Qn(n)),
              (t = Mn(r.s).length),
              (e._urid = function () {
                return t + '_' + e[N]();
              }),
              (r.k[n] = e),
              (r.s[e._urid()] = Ln(n))),
            r.k[n]
          );
        }
      )(n)
    );
  }
  function _e(n) {
    return n && $(n.next);
  }
  function De(n, e, t) {
    if (
      n &&
      (_e(n) || (n = n[(pe = pe || ie(Te(3))).v] ? n[pe.v]() : null), _e(n))
    ) {
      var r = void 0,
        i = void 0;
      try {
        for (var o = 0; !(i = n.next())[E] && -1 !== e[Q](t || n, i[P], o, n); )
          o++;
      } catch (a) {
        (r = { e: a }), n['throw'] && ((i = null), n['throw'](r));
      } finally {
        try {
          i && !i[E] && n['return'] && n['return'](i);
        } finally {
          if (r) throw r.e;
        }
      }
    }
  }
  var Ee = Hn('apply');
  function Pe(e, n) {
    return (
      !pn(n) &&
        e &&
        (hn(n)
          ? Ee(e.push, e, n)
          : _e(n) || (n !== x && H(n) && $(n[Te(3)]))
            ? De(n, function (n) {
                e.push(n);
              })
            : e.push(n)),
      e
    );
  }
  function wn(n, e, t) {
    if (n)
      for (
        var r = n[D] >>> 0, i = 0;
        i < r && !(i in n && -1 === e[Q](t || n, n[i], i, n));
        i++
      );
  }
  var Me,
    Ne,
    Ae = Hn(_, Z),
    Re = Hn('map', Z),
    Ue = Hn(Y, Z),
    Le = Hn('reduce', Z),
    qe =
      A.create ||
      function (n) {
        if (!n) return {};
        var e = typeof n;
        function t() {}
        return (
          e !== m &&
            e !== f &&
            sn('Prototype must be an Object or function: ' + mn(n)),
          (t[w] = n),
          new t()
        );
      };
  function Oe(n, e) {
    return (
      A.setPrototypeOf ||
      function (t, n) {
        (Me =
          Me ||
          te(function () {
            return { __proto__: [] } instanceof Array;
          })).v
          ? (t[b] = n)
          : B(n, function (n, e) {
              return (t[n] = e);
            });
      }
    )(n, e);
  }
  function Fe(n, e) {
    e && (n[M] = e);
  }
  function Ve(i, o, n) {
    var e,
      t,
      a = n || Error,
      u = a[w][M],
      c = Error.captureStackTrace,
      n = a;
    return (
      O(yn, [
        (t = function () {
          var n = this,
            e = arguments;
          try {
            O(Fe, [a, i]);
            var t,
              r = Ee(a, n, Z[Y][Q](e)) || n;
            return (
              r !== n && (t = Nn(n)) !== Nn(r) && Oe(r, t),
              c && c(r, n[C]),
              o && o(r, e),
              r
            );
          } finally {
            O(Fe, [a, u]);
          }
        }),
        M,
        { v: (e = i), c: !0, e: !1 },
      ]),
      ((t = Oe(t, n))[w] = n === x ? qe(n) : ((r[w] = n[w]), new r())),
      t
    );
    function r() {
      (this.constructor = t), O(yn, [this, M, { v: e, c: !0, e: !1 }]);
    }
  }
  function ze(n) {
    throw new (Ne = Ne || Ve('UnsupportedError'))(n);
  }
  function He() {
    return (Date.now || je)();
  }
  function je() {
    return new Date().getTime();
  }
  function Be(e) {
    return function (n) {
      return (
        gn(n) && sn('strTrim called [' + mn(n) + ']'),
        n && n.replace ? n.replace(e, c) : n
      );
    };
  }
  var Ke,
    Xe,
    We,
    Je = Hn('trim', U, Be(/^\s+|(?=\s)\s+$/g));
  function Ge(n) {
    if (!n || typeof n !== m) return !1;
    var e = !1;
    if (n !== (We = We || !xe() || xe())) {
      Xe || ((Ke = Function[w][N]), (Xe = Ke[Q](A)));
      try {
        var t = Nn(n),
          e =
            (e = !t) ||
            ((t = an(t, C) ? t[C] : t) && typeof t === f && Ke[Q](t) === Xe);
      } catch (r) {}
    }
    return e;
  }
  var $e = function (n) {
      return n.value && nt(n), !0;
    },
    Ye = [
      function (n) {
        var e,
          t = n.value;
        return (
          !!hn(t) &&
          (((e = n.result = []).length = t.length), n.copyTo(e, t), !0)
        );
      },
      nt,
      function (n) {
        return n.type === f;
      },
      function (n) {
        var e = n.value;
        return !!j(e) && ((n.result = new Date(e.getTime())), !0);
      },
    ];
  function Qe(t, n, r, e) {
    var i,
      o,
      a = r.handler,
      e = r.path ? (e ? r.path.concat(e) : r.path) : [],
      u = { handler: r.handler, src: r.src, path: e },
      c = typeof n,
      s = !1,
      f = !1,
      l =
        (n && c === m
          ? (s = Ge(n))
          : (f = n === x || (c !== m && !!~F.indexOf(c))),
        {
          type: c,
          isPrim: f,
          isPlain: s,
          value: n,
          result: n,
          path: e,
          origin: r.src,
          copy: function (n, e) {
            return Qe(t, n, e ? u : r, e);
          },
          copyTo: function (n, e) {
            return Ze(t, n, e, u);
          },
        });
    return l.isPrim
      ? a && a[Q](r, l)
        ? l.result
        : n
      : ((i = n),
        (c = function (e) {
          yn(l, 'result', {
            g: function () {
              return e.v;
            },
            s: function (n) {
              e.v = n;
            },
          });
          for (
            var n = 0, t = a;
            !(t || (n < Ye.length ? Ye[n++] : $e))[Q](r, l);

          )
            t = x;
        }),
        wn((f = t), function (n) {
          if (n.k === i) return (o = n), -1;
        }),
        o || ((o = { k: i, v: i }), f.push(o), c(o)),
        o.v);
  }
  function Ze(n, e, t, r) {
    if (!gn(t)) for (var i in t) e[i] = Qe(n, t[i], r, i);
    return e;
  }
  function nt(n) {
    var e,
      t = n.value;
    return !(!t || !n.isPlain || ((e = n.result = {}), n.copyTo(e, t), 0));
  }
  function et(e, n) {
    return (
      wn(n, function (n) {
        Ze([], e, n, { handler: void 0, src: n, path: [] });
      }),
      e
    );
  }
  function tt(n) {
    return et(Qe([], n, { handler: void 0, src: n }) || {}, Z[Y][Q](arguments));
  }
  var rt,
    it = jn(D);
  function ot() {
    return y || ee(), (rt = !rt || (!rt.b && y.lzy) ? he('performance') : rt).v;
  }
  var at = Hn('split', U);
  function ut(e, n, t) {
    var r;
    e &&
      n &&
      ((r = (n = at(n, '.')).pop()),
      wn(n, function (n) {
        gn(e[n]) && (e[n] = {}), (e = e[n]);
      }),
      (e[r] = t));
  }
  var ct = Hn('endsWith', U, st);
  function st(n, e, t) {
    G(n) || sn("'" + mn(n) + "' is not a string");
    (e = G(e) ? e : Ln(e)), (t = !pn(t) && t < n[D] ? t : n[D]);
    return Xn(n, t - e[D], t) === e;
  }
  var ft = Hn(_, U),
    lt = 'unref',
    dt = 'hasRef',
    vt = 'enabled';
  function pt(e, n, t, r) {
    var i,
      o,
      a,
      u,
      c,
      s,
      f,
      l,
      d = hn(t),
      v = d ? t.length : 0,
      p = (0 < v ? t[0] : d ? J : t) || setTimeout,
      g = (1 < v ? t[1] : J) || clearTimeout,
      h = r[0],
      m =
        ((r[0] = function () {
          m.dn(), Ee(h, e, Z[Y][Q](arguments));
        }),
        (i = function (n) {
          if (n) {
            if (n.refresh) return n.refresh(), n;
            Ee(g, e, [n]);
          }
          return Ee(p, e, r);
        }),
        (o = function (n) {
          Ee(g, e, [n]);
        }),
        (u = !0),
        (c = n ? i(x) : x),
        ((d = {
          cancel: (l = function () {
            c && o(c), (c = x);
          }),
          refresh: (f = function () {
            return (c = i(c)), u || s(), a;
          }),
          hasRef: function () {
            return c && c[dt] ? c[dt]() : u;
          },
          ref: function () {
            return (u = !0), c && c.ref && c.ref(), a;
          },
        })[lt] = s =
          function () {
            return (u = !1), c && c[lt] && c[lt](), a;
          }),
        (d[vt] = !1),
        ne((a = d), vt, {
          get: function () {
            return !!c;
          },
          set: function (n) {
            !n && c && l(), n && !c && f();
          },
        }),
        {
          h: a,
          dn: function () {
            c = x;
          },
        });
    return m.h;
  }
  function gt() {
    return pt(this, !0, J, Z[Y][Q](arguments));
  }
  var ht,
    e = function (n) {
      return un(n, 1, 0, dn);
    },
    mt = 'toLowerCase',
    yt = 'blkVal',
    bn = 'length',
    xt = 'rdOnly',
    wt = 'notify',
    bt = 'warnToConsole',
    It = 'throwInternal',
    Ct = 'setDf',
    Tt = 'watch',
    K = 'logger',
    St = 'apply',
    X = 'push',
    kt = 'splice',
    _t = 'hdlr',
    Dt = 'cancel',
    Et = 'initialize',
    Pt = 'identifier',
    Mt = 'isInitialized',
    Nt = 'getPlugin',
    At = 'pollInternalLogs',
    Rt = 'name',
    Ut = 'time',
    Lt = 'processNext',
    qt = 'getProcessTelContext',
    Ot = 'getNotifyMgr',
    Ft = 'addNotificationListener',
    Vt = 'removeNotificationListener',
    zt = 'enabled',
    Ht = 'stopPollingInternalLogs',
    jt = 'unload',
    Bt = 'onComplete',
    Kt = 'version',
    Xt = 'loggingLevelConsole',
    Wt = 'createNew',
    Jt = 'teardown',
    Gt = 'messageId',
    $t = 'message',
    Yt = 'isAsync',
    Qt = 'diagLog',
    Zt = '_doTeardown',
    nr = 'update',
    er = 'getNext',
    tr = 'setNextPlugin',
    rr = 'userAgent',
    ir = 'split',
    or = 'nodeType',
    ar = 'replace',
    ur = 'logInternalMessage',
    cr = 'type',
    sr = 'handler',
    fr = 'isChildEvt',
    lr = 'getCtx',
    dr = 'setCtx',
    vr = 'complete',
    pr = 'traceId',
    gr = 'spanId',
    hr = 'traceFlags',
    mr = 'function',
    yr = 'object',
    xr = 'undefined',
    wr = 'prototype',
    br = Object,
    Ir = br[wr],
    Cr = 'hasOwnProperty',
    Tr =
      ln ||
      function (n) {
        for (var e, t = 1, r = arguments.length; t < r; t++)
          for (var i in (e = arguments[t])) Ir[Cr].call(e, i) && (n[i] = e[i]);
        return n;
      },
    Sr = function (n, e) {
      return (Sr =
        br.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (n, e) {
            n.__proto__ = e;
          }) ||
        function (n, e) {
          for (var t in e) e[Cr](t) && (n[t] = e[t]);
        })(n, e);
    };
  function kr(n, e) {
    function t() {
      this.constructor = n;
    }
    typeof e !== mr &&
      null !== e &&
      sn('Class extends value ' + e + ' is not a constructor or null'),
      Sr(n, e),
      (n[wr] = null === e ? qe(e) : ((t[wr] = e[wr]), new t()));
  }
  function _r(n, e) {
    for (var t = 0, r = e.length, i = n.length; t < r; t++, i++) n[i] = e[t];
    return n;
  }
  var Dr = 'constructor',
    Er = 'prototype',
    Pr = 'function',
    Mr = '_dynInstFuncs',
    Nr = '_isDynProxy',
    Ar = '_dynClass',
    Rr = '_dynInstChk',
    Ur = Rr,
    Lr = '_dfOpts',
    qr = '_unknown_',
    Or = '__proto__',
    Fr = '_dyn' + Or,
    r = '__dynProto$Gbl',
    Vr = '_dynInstProto',
    zr = 'useBaseInst',
    Hr = 'setInstFuncs',
    jr = Object,
    Br = jr.getPrototypeOf,
    Kr = jr.getOwnPropertyNames,
    s = me(),
    Xr = s[r] || (s[r] = { o: (((t = {})[Hr] = !0), (t[zr] = !0), t), n: 1e3 });
  function Wr(n) {
    return n && (n === jr[Er] || n === Array[Er]);
  }
  function Jr(n) {
    return Wr(n) || n === Function[Er];
  }
  function Gr(n) {
    if (n) {
      if (Br) return Br(n);
      var e = n[Or] || n[Er] || (n[Dr] ? n[Dr][Er] : null),
        t = n[Fr] || e;
      an(n, Fr) || (delete n[Vr], (t = n[Fr] = n[Vr] || n[Fr]), (n[Vr] = e));
    }
    return t;
  }
  function $r(n, e) {
    var t = [];
    if (Kr) t = Kr(n);
    else for (var r in n) 'string' == typeof r && an(n, r) && t.push(r);
    if (t && 0 < t.length) for (var i = 0; i < t.length; i++) e(t[i]);
  }
  function Yr(n, e, t) {
    return (
      e !== Dr && typeof n[e] === Pr && (t || an(n, e)) && e !== Or && e !== Er
    );
  }
  function Qr(n) {
    sn('DynamicProto: ' + n);
  }
  function Zr(n, e) {
    for (var t = n.length - 1; 0 <= t; t--) if (n[t] === e) return 1;
  }
  function ni(n, e) {
    return an(n, Er)
      ? n.name || e || qr
      : ((n || {})[Dr] || {}).name || e || qr;
  }
  function In(n, r, e, t) {
    an(n, Er) || Qr('theClass is an invalid class definition.');
    var i,
      o,
      a,
      u,
      c,
      s,
      f = n[Er],
      l =
        ((function (n) {
          if (!Br) return 1;
          for (var e = [], t = Gr(r); t && !Jr(t) && !Zr(e, t); ) {
            if (t === n) return 1;
            e.push(t), (t = Gr(t));
          }
        })(f) || Qr('[' + ni(n) + '] not in hierarchy of [' + ni(r) + ']'),
        null),
      n =
        (an(f, Ar)
          ? (l = f[Ar])
          : ((l = '_dynCls$' + ni(n, '_') + '$' + Xr.n), Xr.n++, (f[Ar] = l)),
        In[Lr]),
      d = !!n[zr],
      v =
        (d && t && t[zr] !== undefined && (d = !!t[zr]),
        (i = r),
        (o = qe(null)),
        $r(i, function (n) {
          !o[n] && Yr(i, n, !1) && (o[n] = i[n]);
        }),
        o),
      d =
        (e(
          r,
          (function (n, e, t, o) {
            function r(n, e, t) {
              var r,
                i = e[t];
              return (
                i[Nr] &&
                  o &&
                  !1 !== (r = n[Mr] || {})[Ur] &&
                  (i = (r[e[Ar]] || {})[t] || i),
                function () {
                  return i.apply(n, arguments);
                }
              );
            }
            for (
              var i = qe(null),
                a =
                  ($r(t, function (n) {
                    i[n] = r(e, t, n);
                  }),
                  Gr(n)),
                u = [];
              a && !Jr(a) && !Zr(u, a);

            )
              $r(a, function (n) {
                !i[n] && Yr(a, n, !Br) && (i[n] = r(e, a, n));
              }),
                u.push(a),
                (a = Gr(a));
            return i;
          })(f, r, v, d)
        ),
        !!Br && !!n[Hr]);
    (a = f),
      (e = l),
      (u = r),
      (c = v),
      (n = !1 !== (d = d && t ? !!t[Hr] : d)),
      Wr(a) ||
        Wr((f = u[Mr] = u[Mr] || qe(null))) ||
        ((s = f[e] = f[e] || qe(null)),
        !1 !== f[Ur] && (f[Ur] = !!n),
        Wr(s) ||
          $r(u, function (n) {
            var t, r, i;
            Yr(u, n, !1) &&
              u[n] !== c[n] &&
              ((s[n] = u[n]),
              delete u[n],
              (an(a, n) && (!a[n] || a[n][Nr])) ||
                (a[n] =
                  ((t = a),
                  (r = n),
                  ((i = function () {
                    var n, e;
                    return (
                      (function (n, e, t, r) {
                        var i = null;
                        if (n && an(t, Ar)) {
                          var o = n[Mr] || qe(null);
                          if (
                            ((i = (o[t[Ar]] || qe(null))[e]) ||
                              Qr('Missing [' + e + '] ' + Pr),
                            !i[Rr] && !1 !== o[Ur])
                          ) {
                            for (
                              var a = !an(n, e), u = Gr(n), c = [];
                              a && u && !Jr(u) && !Zr(c, u);

                            ) {
                              var s = u[e];
                              if (s) {
                                a = s === r;
                                break;
                              }
                              c.push(u), (u = Gr(u));
                            }
                            try {
                              a && (n[e] = i), (i[Rr] = 1);
                            } catch (f) {
                              o[Ur] = !1;
                            }
                          }
                        }
                        return i;
                      })(this, r, t, i) ||
                      (typeof (e = (e = t[(n = r)]) === i ? Gr(t)[n] : e) !==
                        Pr && Qr('[' + n + '] is not a ' + Pr),
                      e)
                    ).apply(this, arguments);
                  })[Nr] = 1),
                  i)));
          }));
  }
  function ei(n, e) {
    return ti(
      n,
      function (n) {
        return e ? e({ value: n, rejected: !1 }) : n;
      },
      function (n) {
        return e ? e({ rejected: !0, reason: n }) : n;
      }
    );
  }
  function ti(n, e, t, r) {
    var i,
      o = n;
    return (
      tn(n) ? (e || t) && (o = n.then(e, t)) : e && (o = e(n)),
      r &&
        ((t = o),
        (i = r) &&
          (tn(t)
            ? t['finally']
              ? t['finally'](i)
              : t.then(
                  function (n) {
                    return i(), n;
                  },
                  function (n) {
                    throw (i(), n);
                  }
                )
            : i())),
      o
    );
  }
  In[Lr] = Xr.o;
  var ri,
    ii,
    oi,
    ai,
    ui = ['pending', 'resolving', 'resolved', 'rejected'],
    ci = 'dispatchEvent',
    si = 'Promise';
  function fi(n) {
    return $(n) ? n.toString() : mn(n);
  }
  function li(n, e, t) {
    var u,
      r = Ue(arguments, 3),
      c = 0,
      s = !1,
      f = [],
      l = !1,
      i = null,
      o =
        ((ii = ii || he(si + 'RejectionEvent')),
        function (o, a) {
          return (
            (l = !0),
            i && i.cancel(),
            (i = null),
            n(function (r, i) {
              f.push(function () {
                try {
                  var n = 2 === c ? o : a,
                    e = pn(n) ? u : $(n) ? n(u) : n;
                  tn(e) ? e.then(r, i) : (n || 3 !== c ? r : i)(e);
                } catch (t) {
                  i(t);
                }
              }),
                s && d();
            }, r)
          );
        }),
      a = function () {
        return ui[c];
      },
      d = function () {
        var n;
        0 < f.length &&
          ((n = f.slice()),
          (f = []),
          (l = !0),
          e(n),
          i && i.cancel(),
          (i = null));
      },
      v = function (e, t) {
        return function (n) {
          if (c === t) {
            if (2 === e && tn(n)) return (c = 1), void n.then(v(2, 1), v(3, 1));
            (c = e),
              (s = !0),
              (u = n),
              d(),
              l || 3 !== e || i || (i = gt(p, 10));
          }
        };
      },
      p = function () {
        var n, e, t, r, i;
        l ||
          ((le =
            le ||
            ie(
              !!O(function () {
                return process && (process.versions || {}).node;
              }).v
            )).v
            ? process.emit('unhandledRejection', u, g)
            : ((t = xe() || me()),
              (n = 'unhandledrejection'),
              (e = function (n) {
                return (
                  yn(n, 'promise', {
                    g: function () {
                      return g;
                    },
                  }),
                  (n.reason = u),
                  n
                );
              }),
              (i = !!ii.v),
              (r = ye()),
              e(
                (i = (ri =
                  ri ||
                  re(function () {
                    var n;
                    return (
                      !!(n = r && r.createEvent ? r.createEvent('Event') : n) &&
                      n.initEvent
                    );
                  }, null)).v
                  ? r.createEvent('Event')
                  : i
                    ? new Event(n)
                    : {})
              ),
              ri.v && i.initEvent(n, !1, !0),
              i && t[ci]
                ? t[ci](i)
                : (e = t['on' + n])
                  ? e(i)
                  : (t = xn('console')) && (t.error || t.log)(n, mn(i))));
      },
      g = {
        then: o,
        catch: function (n) {
          return o(undefined, n);
        },
        finally: function (e) {
          var n = e,
            t = e;
          return (
            $(e) &&
              ((n = function (n) {
                return e && e(), n;
              }),
              (t = function (n) {
                throw (e && e(), n);
              })),
            o(n, t)
          );
        },
      },
      h =
        (ne(g, 'state', { get: a }),
        y || ee(),
        (de && !y.lzy) || Ce(),
        de.v && (g[Te(11)] = 'IPromise'),
        (g.toString = function () {
          return 'IPromise ' + a() + (s ? ' - ' + fi(u) : '');
        }),
        $(t) || sn(si + ': executor is not a function - ' + fi(t)),
        v(3, 0));
    try {
      t.call(g, v(2, 0), h);
    } catch (m) {
      h(m);
    }
    return g;
  }
  function di(n, e) {
    return li(
      di,
      ((r = nn((t = e)) ? t : 0),
      function (n) {
        gt(function () {
          wn(n, function (n) {
            try {
              n();
            } catch (e) {}
          });
        }, r);
      }),
      n,
      e
    );
    var t, r;
  }
  function vi(n, e) {
    var t = (oi = oi || he(si)).v;
    if (!t) return di(n);
    $(n) || sn(si + ': executor is not a function - ' + mn(n));
    var r = 0,
      t = new t(function (e, t) {
        n(
          function (n) {
            (r = 2), e(n);
          },
          function (n) {
            (r = 3), t(n);
          }
        );
      });
    return (
      ne(t, 'state', {
        get: function () {
          return ui[r];
        },
      }),
      t
    );
  }
  function pi(n, e) {
    return (ai =
      ai ||
      te(function () {
        return vi;
      })).v.call(this, n, e);
  }
  var gi = pi,
    hi = function (e) {
      var n = Ue(arguments, 1);
      return gi(function (t, r) {
        try {
          var i = [],
            o = 1;
          wn(e, function (n, e) {
            n &&
              (o++,
              ti(
                n,
                function (n) {
                  (i[e] = n), 0 == --o && t(i);
                },
                r
              ));
          }),
            0 == --o && t(i);
        } catch (n) {
          r(n);
        }
      }, n);
    },
    mi = undefined,
    W = '',
    yi = 'channels',
    xi = 'core',
    wi = 'createPerfMgr',
    bi = 'disabled',
    Ii = 'extensionConfig',
    Ci = 'extensions',
    Ti = 'processTelemetry',
    Si = 'priority',
    ki = 'eventsSent',
    _i = 'eventsDiscarded',
    Di = 'eventsSendRequest',
    Ei = 'perfEvent',
    Pi = 'getPerfMgr',
    Mi = 'domain',
    Ni = 'path',
    Ai = 'Not dynamic - ',
    Ri = /-([a-z])/g,
    Ui = /([^\w\d_$])/g,
    Li = /^(\d+[\w\d_$])/,
    qi = Object.getPrototypeOf;
  function Oi(n) {
    return !gn(n);
  }
  function Fi(n) {
    return n && G(n)
      ? (n = (n = n[ar](Ri, function (n, e) {
          return e.toUpperCase();
        }))[ar](Ui, '_'))[ar](Li, function (n, e) {
          return '_' + e;
        })
      : n;
  }
  function Vi(n, e) {
    return !(!n || !e) && -1 !== ft(n, e);
  }
  function zi(n) {
    return (n && n.toISOString()) || '';
  }
  function Cn(n) {
    return en(n) ? n[Rt] : W;
  }
  function p(n, e, t, r, i) {
    var o = t;
    !n || (o = n[e]) === t || (i && !i(o)) || (r && !r(t)) || (n[e] = o = t);
  }
  function Hi(n, e, t) {
    var r;
    return (
      n
        ? !(r = n[e]) && gn(r) && ((r = pn(t) ? {} : t), (n[e] = r))
        : (r = pn(t) ? {} : t),
      r
    );
  }
  function ji(n, e) {
    var t = null,
      r = null;
    return (
      $(n) ? (t = n) : (r = n),
      function () {
        var n = arguments;
        if ((r = t ? t() : r)) return r[e][St](r, n);
      }
    );
  }
  function Bi(n, e, t, r, i) {
    n && e && t && ((!1 === i && !pn(n[e])) || (n[e] = ji(t, r)));
  }
  function Ki(e, t, n, r) {
    e &&
      t &&
      Dn(e) &&
      hn(n) &&
      wn(n, function (n) {
        G(n) && Bi(e, n, t, n, r);
      });
  }
  function Xi(n) {
    return n && ln ? br(ln({}, n)) : n;
  }
  function Wi(n, e) {
    e = e && e.featureOptIn && e.featureOptIn[n];
    return n && e && (3 == (n = e.mode) || 1 == n);
  }
  var Ji = 'documentMode',
    Gi = 'location',
    $i = 'console',
    Yi = 'JSON',
    Qi = 'crypto',
    Zi = 'msCrypto',
    no = 'msie',
    eo = 'trident/',
    to = 'XMLHttpRequest',
    ro = null,
    io = null,
    oo = !1,
    ao = null,
    uo = null;
  function co(n, e) {
    var t,
      r = !1;
    if (n) {
      try {
        (r = e in n) || ((t = n[wr]) && (r = e in t));
      } catch (i) {}
      if (!r)
        try {
          r = !pn(new n()[e]);
        } catch (i) {}
    }
    return r;
  }
  function so(n) {
    if (n && oo) {
      n = xn('__mockLocation');
      if (n) return n;
    }
    return typeof location === yr && location ? location : xn(Gi);
  }
  function fo() {
    return (typeof JSON === yr && JSON) || null !== xn(Yi);
  }
  function lo() {
    return fo() ? JSON || xn(Yi) : null;
  }
  function vo() {
    var n = we();
    return (
      !n ||
        (n[rr] === io && null !== ro) ||
        ((n = ((io = n[rr]) || W)[mt]()), (ro = Vi(n, no) || Vi(n, eo))),
      ro
    );
  }
  function po(n) {
    var e = ((n = (n = void 0 === n ? null : n)
      ? n
      : (e = we() || {})
        ? (e.userAgent || W)[mt]()
        : W) || W)[mt]();
    if (Vi(e, no))
      return (n = ye() || {}), Math.max(parseInt(e[ir](no)[1]), n[Ji] || 0);
    if (Vi(e, eo)) {
      n = parseInt(e[ir](eo)[1]);
      if (n) return n + 4;
    }
    return null;
  }
  function go(n) {
    return (uo = null !== uo && !1 !== n ? uo : !!we() && !!we().sendBeacon);
  }
  function ho(n) {
    var e = !1;
    try {
      var e = !!xn('fetch'),
        t = xn('Request');
      e && n && t && (e = co(t, 'keepalive'));
    } catch (r) {}
    return e;
  }
  function mo() {
    var n = !1;
    try {
      n = !!xn(to);
    } catch (e) {}
    return n;
  }
  function yo(n, e) {
    if (n)
      for (var t = 0; t < n[bn]; t++) {
        var r = n[t];
        if (r[Rt] && r[Rt] === e) return r;
      }
    return {};
  }
  function xo(n) {
    var e = ye();
    return e && n ? yo(e.querySelectorAll('meta'), n).content : null;
  }
  var wo = 4294967296,
    bo = 4294967295,
    Io = 123456789,
    Co = 987654321,
    To = !1,
    So = Io,
    ko = Co;
  function _o(n) {
    return 0 < n ? Math.floor((Do() / bo) * (n + 1)) >>> 0 : 0;
  }
  function Do(n) {
    var e,
      t = 0,
      r = xn(Qi) || xn(Zi);
    if (
      0 ===
        (t =
          r && r.getRandomValues
            ? r.getRandomValues(new Uint32Array(1))[0] & bo
            : t) &&
      vo()
    ) {
      if (!To)
        try {
          var i = 2147483647 & He();
          (e = ((Math.random() * wo) ^ i) + i) < 0 && (e >>>= 0),
            (So = (Io + e) & bo),
            (ko = (Co - e) & bo),
            (To = !0);
        } catch (o) {}
      (r =
        (((((ko = (36969 * (65535 & ko) + (ko >> 16)) & bo) << 16) +
          (65535 & (So = (18e3 * (65535 & So) + (So >> 16)) & bo))) >>>
          0) &
          bo) |
        0),
        (t = (r >>>= 0) & bo);
    }
    return (
      0 === t && (t = Math.floor((wo * Math.random()) | 0)), n || (t >>>= 0), t
    );
  }
  function Eo(n) {
    void 0 === n && (n = 22);
    for (var e = Do() >>> 0, t = 0, r = W; r[bn] < n; )
      (r +=
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[
          0 | (63 & e)
        ] || ''),
        (e >>>= 6),
        5 == ++t &&
          ((e = (((Do() << 2) & 4294967295) | (3 & e)) >>> 0), (t = 0));
    return r;
  }
  var Po = '3.0.5',
    Mo = '.' + Eo(6),
    No = 0;
  function Ao(n) {
    return 1 === n[or] || 9 === n[or] || !+n[or];
  }
  function Ro(n, e) {
    return Fi(n + No++ + ((e = void 0 !== e && e) ? '.' + Po : W) + Mo);
  }
  function Uo(n) {
    var o = {
      id: Ro('_aiData-' + (n || W) + '.' + Po),
      accept: Ao,
      get: function (n, e, t, r) {
        var i = n[o.id];
        return i
          ? i[Fi(e)]
          : (r &&
              ((i = (function (n, e) {
                var t = e[n.id];
                if (!t) {
                  t = {};
                  try {
                    Ao(e) && yn(e, n.id, { e: !1, v: t });
                  } catch (r) {}
                }
                return t;
              })(o, n))[Fi(e)] = t),
            t);
      },
      kill: function (n, e) {
        if (n && n[e])
          try {
            delete n[e];
          } catch (t) {}
      },
    };
    return o;
  }
  function Lo(n) {
    return (
      n &&
      Dn(n) &&
      (n.isVal || n.fb || Pn(n, 'v') || Pn(n, 'mrg') || Pn(n, 'ref') || n.set)
    );
  }
  function qo(n, e, t) {
    var r,
      i = t.dfVal || H;
    if (e && t.fb) {
      var o = t.fb;
      hn(o) || (o = [o]);
      for (var a = 0; a < o[bn]; a++) {
        var u = o[a],
          c = e[u];
        if (
          (i(c)
            ? (r = c)
            : n && (i((c = n.cfg[u])) && (r = c), n.set(n.cfg, Ln(u), c)),
          i(r))
        )
          break;
      }
    }
    return !i(r) && i(t.v) ? t.v : r;
  }
  function Oo(t, n, e, r) {
    var i,
      o,
      a,
      u,
      c,
      s,
      f = r,
      f = Lo(f)
        ? ((i = f.isVal),
          (o = f.set),
          (c = f[xt]),
          (l = f[yt]),
          (a = f.mrg),
          !(u = f.ref) && pn(u) && (u = !!a),
          qo(t, n, f))
        : r,
      r = (l && t[yt](n, e), !0),
      l = n[e];
    (!l && gn(l)) ||
      ((s = l),
      (r = !1),
      i && s !== f && !i(s) && ((s = f), (r = !0)),
      o && (r = (s = o(s, f, n)) === f)),
      r
        ? (s =
            f &&
            (function d(t, r, n) {
              var i,
                e = n;
              return (
                (e = n && Lo(n) ? qo(t, r, n) : e) &&
                  (Lo(e) && (e = d(t, r, e)),
                  hn(e) ? ((i = [])[bn] = e[bn]) : Ge(e) && (i = {}),
                  i &&
                    (B(e, function (n, e) {
                      e && Lo(e) && (e = d(t, r, e)), (i[n] = e);
                    }),
                    (e = i))),
                e
              );
            })(t, n, f))
        : (Ge(s) || hn(f)) &&
          a &&
          f &&
          (Ge(f) || hn(f)) &&
          B(f, function (n, e) {
            Oo(t, s, n, e);
          }),
      t.set(n, e, s),
      u && t.ref(n, e),
      c && t[xt](n, e);
  }
  var Fo = ke('[[ai_dynCfg_1]]'),
    Vo = ke('[[ai_blkDynCfg_1]]'),
    zo = ke('[[ai_frcDynCfg_1]]');
  function Ho(n, e, t) {
    var r = !1;
    return !t || n[e.blkVal] || (r = t[zo]) || t[Vo] ? r : Ge(t) || hn(t);
  }
  function jo(n) {
    sn('InvalidAccess:' + n);
  }
  var Bo = ['push', 'pop', 'shift', 'unshift', 'splice'],
    Ko = function (n, e, t, r) {
      n && n[It](3, 108, ''.concat(t, ' [').concat(e, '] failed - ') + mn(r));
    };
  function Xo(n, e) {
    n = on(n, e);
    return n && n.get;
  }
  function Wo(i, o, a, u) {
    var c = {
        n: a,
        h: [],
        trk: function (n) {
          n && n.fn && (-1 === Ae(c.h, n) && c.h[X](n), i.trk(n, c));
        },
        clr: function (n) {
          n = Ae(c.h, n);
          -1 !== n && c.h[kt](n, 1);
        },
      },
      s = !0,
      f = !1;
    function l() {
      s &&
        ((f = f || Ho(l, i, u)),
        u && !u[Fo] && f && (u = $o(i, u, a, 'Converting')),
        (s = !1));
      var n = i.act;
      return n && c.trk(n), u;
    }
    (l[i.prop] = {
      chng: function () {
        i.add(c);
      },
    }),
      yn(o, c.n, {
        g: l,
        s: function (e) {
          if (u !== e) {
            l[i.ro] && !i.upd && jo('[' + a + '] is read-only:' + mn(o)),
              s && ((f = f || Ho(l, i, u)), (s = !1));
            var n,
              t = f && l[i.rf];
            if (f)
              if (t) {
                B(u, function (n) {
                  u[n] = e ? e[n] : mi;
                });
                try {
                  B(e, function (n, e) {
                    Jo(i, u, n, e);
                  }),
                    (e = u);
                } catch (r) {
                  Ko((i.hdlr || {})[K], a, 'Assigning', r), (f = !1);
                }
              } else
                u &&
                  u[Fo] &&
                  B(u, function (n) {
                    var n = Xo(u, n);
                    n && (n = n[i.prop]) && n.chng();
                  });
            e !== u &&
              ((n = e && Ho(l, i, e)),
              !t && n && (e = $o(i, e, a, 'Converting')),
              (u = e),
              (f = n)),
              i.add(c);
          }
        },
      });
  }
  function Jo(n, e, t, r) {
    var i;
    return e && ((i = Xo(e, t)) && i[n.prop] ? (e[t] = r) : Wo(n, e, t, r)), e;
  }
  function Go(n, e, t, r) {
    if (e) {
      var i = Xo(e, t),
        o = i && !!i[n.prop],
        a = r && r[0],
        u = r && r[1],
        r = r && r[2];
      if (!o) {
        if (r)
          try {
            var c = e;
            if (c && (Ge(c) || hn(c)))
              try {
                c[Vo] = !0;
              } catch (s) {}
          } catch (f) {
            Ko((n.hdlr || {})[K], t, 'Blocking', f);
          }
        try {
          Jo(n, e, t, e[t]), (i = Xo(e, t));
        } catch (f) {
          Ko((n.hdlr || {})[K], t, 'State', f);
        }
      }
      a && (i[n.rf] = a), u && (i[n.ro] = u), r && (i[n.blkVal] = !0);
    }
    return e;
  }
  function $o(t, r, n, e) {
    try {
      B(r, function (n, e) {
        Jo(t, r, n, e);
      }),
        r[Fo] ||
          (ne(r, Fo, {
            get: function () {
              return t[_t];
            },
          }),
          (i = t),
          (a = n),
          hn((o = r)) &&
            wn(Bo, function (n) {
              var r = o[n];
              o[n] = function () {
                for (var n = [], e = 0; e < arguments.length; e++)
                  n[e] = arguments[e];
                var t = r[St](this, n);
                return $o(i, o, a, 'Patching'), t;
              };
            }));
    } catch (u) {
      Ko((t.hdlr || {})[K], n, e, u);
    }
    var i, o, a;
    return r;
  }
  var Yo = '[[ai_',
    Qo = ']]';
  function Zo(o) {
    var a,
      n = Se(Yo + 'get' + o.uid + Qo),
      e = Se(Yo + 'ro' + o.uid + Qo),
      t = Se(Yo + 'rf' + o.uid + Qo),
      r = Se(Yo + 'blkVal' + o.uid + Qo),
      u = Se(Yo + 'dtl' + o.uid + Qo),
      i = null,
      c = null;
    function s(e, n) {
      var t = a.act;
      try {
        (a.act = e) &&
          e[u] &&
          (wn(e[u], function (n) {
            n.clr(e);
          }),
          (e[u] = [])),
          n({
            cfg: o.cfg,
            set: o.set.bind(o),
            setDf: o[Ct].bind(o),
            ref: o.ref.bind(o),
            rdOnly: o[xt].bind(o),
          });
      } catch (i) {
        var r = o[K];
        throw (r && r[It](1, 107, mn(i)), i);
      } finally {
        a.act = t || null;
      }
    }
    function f() {
      if (i) {
        var t,
          n = i,
          r = ((i = null), c && c[Dt](), (c = null), []);
        if (
          (wn(n, function (e) {
            if (
              e &&
              (e[u] &&
                (wn(e[u], function (n) {
                  n.clr(e);
                }),
                (e[u] = null)),
              e.fn)
            )
              try {
                s(e, e.fn);
              } catch (n) {
                r[X](n);
              }
          }),
          i)
        )
          try {
            f();
          } catch (e) {
            r[X](e);
          }
        if (0 < r[bn])
          throw (
            ((n = r),
            (ht =
              ht ||
              Ve('AggregationError', function (n, e) {
                1 < e[bn] && (n.errors = e[1]);
              })),
            (t = 'Watcher error(s): '),
            wn(n, function (n, e) {
              t += '\n'.concat(e, ' > ').concat(mn(n));
            }),
            new ht(t, n || []))
          );
      }
    }
    return (
      ((n = { prop: n, ro: e, rf: t })[yt] = r),
      (n[_t] = o),
      (n.add = function (n) {
        if (n && 0 < n.h[bn]) {
          (i = i || []),
            (c =
              c ||
              gt(function () {
                (c = null), f();
              }, 0));
          for (var e = 0; e < n.h[bn]; e++) {
            var t = n.h[e];
            t && -1 === Ae(i, t) && i[X](t);
          }
        }
      }),
      (n[wt] = f),
      (n.use = s),
      (n.trk = function (n, e) {
        n && ((n = n[u] = n[u] || []), -1 === Ae(n, e) && n[X](e));
      }),
      (a = n)
    );
  }
  function na(i, e, n) {
    var t,
      r = (function () {
        if (e) {
          var n = e[Fo] || e;
          if (n.cfg && (n.cfg === e || n.cfg[Fo] === n)) return n;
        }
        return null;
      })();
    if (r) return r;
    var o,
      r = Ro('dyncfg', !0),
      n =
        e && !1 !== n
          ? e
          : (function u(n) {
              var t;
              return n &&
                (hn(n) ? ((t = [])[bn] = n[bn]) : Ge(n) && (t = {}), t)
                ? (B(n, function (n, e) {
                    t[n] = u(e);
                  }),
                  t)
                : n;
            })(e),
      a =
        (((t = { uid: null, cfg: n })[K] = i),
        (t[wt] = function () {
          o[wt]();
        }),
        (t.set = function (n, e, t) {
          try {
            n = Jo(o, n, e, t);
          } catch (r) {
            Ko(i, e, 'Setting value', r);
          }
          return n[e];
        }),
        (t[Ct] = function (t, n) {
          return (
            n &&
              B(n, function (n, e) {
                Oo(a, t, n, e);
              }),
            t
          );
        }),
        (t[Tt] = function (n) {
          return (
            (t = {
              fn: (e = n),
              rm: function () {
                (t.fn = null), (e = null);
              },
            }),
            o.use(t, e),
            t
          );
          var e, t;
        }),
        (t.ref = function (n, e) {
          return Go(o, n, e, (((n = {})[0] = !0), n))[e];
        }),
        (t[xt] = function (n, e) {
          return Go(o, n, e, (((n = {})[1] = !0), n))[e];
        }),
        (t[yt] = function (n, e) {
          return Go(o, n, e, (((n = {})[2] = !0), n))[e];
        }),
        (t._block = function (t, r) {
          o.use(null, function (n) {
            var e = o.upd;
            try {
              pn(r) || (o.upd = r), t(n);
            } finally {
              o.upd = e;
            }
          });
        }),
        t);
    return (
      yn(a, 'uid', { c: !1, e: !1, w: !1, v: r }),
      $o((o = Zo(a)), n, 'config', 'Creating'),
      a
    );
  }
  function ea(n, e, t, r) {
    t = na(t, n || {}, r);
    return e && t[Ct](t.cfg, e), t;
  }
  function Tn(n, e, t) {
    var r,
      i,
      o = n[Fo] || n;
    return !o.cfg || (o.cfg !== n && o.cfg[Fo] !== o)
      ? ((r = t),
        (i = Ai + mn(n)),
        r ? (r[bt](i), r[It](2, 108, i)) : jo(i),
        ea(n, null, t)[Tt](e))
      : o[Tt](e);
  }
  function ta(n, e) {
    if (n && n[jt]) return n[jt](e);
  }
  function ra(n, e, t) {
    return !n && gn(n) ? e : En(n) ? n : 'true' === Ln(n)[mt]();
  }
  function ia(n) {
    return { mrg: !0, v: n };
  }
  function oa(n, e) {
    return { set: n, v: e };
  }
  function aa(n, e, t) {
    return { fb: t, isVal: n, v: e };
  }
  function i(n, e) {
    return { fb: e, set: ra, v: !!n };
  }
  var ua,
    ca = [ki, _i, Di, Ei],
    sa = null;
  function fa(n) {
    var e = sa;
    return (e =
      e || !0 === n.disableDbgExt
        ? e
        : sa || ((n = xn('Microsoft')), (sa = n ? n.ApplicationInsights : sa)))
      ? e.ChromeDbgExt
      : null;
  }
  var la = 'warnToConsole',
    da = {
      loggingLevelConsole: 0,
      loggingLevelTelemetry: 1,
      maxMessageLimit: 25,
      enableDebug: !1,
    },
    va =
      (((q = {})[0] = null),
      (q[1] = 'errorToConsole'),
      (q[2] = la),
      (q[3] = 'debugToConsole'),
      q);
  function pa(n) {
    return n ? '"' + n[ar](/\"/g, W) + '"' : W;
  }
  function ga(n, e) {
    var t,
      r = typeof console !== xr ? console : xn($i);
    r && ((t = 'log'), r[n] && (t = n), $(r[t]) && r[t](e));
  }
  ma.dataType = 'MessageData';
  var ha = ma;
  function ma(n, e, t, r) {
    void 0 === t && (t = !1),
      (this[Gt] = n),
      (this[$t] = (t ? 'AI: ' : 'AI (Internal): ') + n);
    (t = W),
      fo() && (t = lo().stringify(r)),
      (n = (e ? ' message:' + pa(e) : W) + (r ? ' props:' + pa(t) : W));
    this[$t] += n;
  }
  function ya(n, e) {
    return (n || {})[K] || new xa(e);
  }
  wa.__ieDyn = 1;
  var xa = wa;
  function wa(r) {
    (this.identifier = 'DiagnosticLogger'), (this.queue = []);
    var c,
      i,
      s,
      f,
      e,
      l = 0,
      d = {};
    In(wa, this, function (o) {
      function a(n, e) {
        var t, r;
        s <= l ||
          ((r = !0),
          (t = 'AITR_' + e[Gt]),
          d[t] ? (r = !1) : (d[t] = !0),
          r &&
            (n <= i && (o.queue[X](e), l++, u(1 === n ? 'error' : 'warn', e)),
            l === s &&
              ((r = new ha(
                23,
                (t =
                  'Internal events throttle limit per PageView reached for this app.'),
                !1
              )),
              o.queue[X](r),
              1 === n ? o.errorToConsole(t) : o[bt](t))));
      }
      function u(n, e) {
        var t = fa(r || {});
        t && t[Qt] && t[Qt](n, e);
      }
      (e = Tn(ea(r || {}, da, o).cfg, function (n) {
        n = n.cfg;
        (c = n[Xt]),
          (i = n.loggingLevelTelemetry),
          (s = n.maxMessageLimit),
          (f = n.enableDebug);
      })),
        (o.consoleLoggingLevel = function () {
          return c;
        }),
        (o[It] = function (n, e, t, r, i) {
          e = new ha(e, t, (i = void 0 !== i && i), r);
          if (f) throw mn(e);
          t = va[n] || la;
          pn(e[$t])
            ? u('throw' + (1 === n ? 'Critical' : 'Warning'), e)
            : (i
                ? ((r = +e[Gt]), !d[r] && n <= c && (o[t](e[$t]), (d[r] = !0)))
                : n <= c && o[t](e[$t]),
              a(n, e));
        }),
        (o.debugToConsole = function (n) {
          ga('debug', n), u('warning', n);
        }),
        (o[bt] = function (n) {
          ga('warn', n), u('warning', n);
        }),
        (o.errorToConsole = function (n) {
          ga('error', n), u('error', n);
        }),
        (o.resetInternalMessageCount = function () {
          (l = 0), (d = {});
        }),
        (o[ur] = a),
        (o[jt] = function (n) {
          e && e.rm(), (e = null);
        });
    });
  }
  function ba(n) {
    return n || new xa();
  }
  function Sn(n, e, t, r, i, o) {
    void 0 === o && (o = !1), ba(n)[It](e, t, r, i, o);
  }
  function Ia(n, e) {
    ba(n)[bt](e);
  }
  var Ca,
    Ta = 'toGMTString',
    Sa = 'toUTCString',
    ka = 'cookie',
    _a = 'expires',
    Da = 'isCookieUseDisabled',
    Ea = 'disableCookiesUsage',
    Pa = '_ckMgr',
    Ma = null,
    Na = null,
    Aa = null,
    Ra = {},
    Ua = {},
    La =
      (((U = {
        cookieCfg: ia(
          (((_ = {})[Mi] = { fb: 'cookieDomain', dfVal: Oi }),
          (_.path = { fb: 'cookiePath', dfVal: Oi }),
          (_.enabled = mi),
          (_.ignoreCookies = mi),
          (_.blockedCookies = mi),
          _)
        ),
        cookieDomain: mi,
        cookiePath: mi,
      })[Ea] = mi),
      U);
  function qa() {
    Ca = Ca || te(ye);
  }
  function Oa(n) {
    return !n || n.isEnabled();
  }
  function Fa(n, e) {
    return e && n && hn(n.ignoreCookies) && -1 !== Ae(n.ignoreCookies, e);
  }
  function Va(n, e) {
    var t,
      e = e[zt];
    return (
      gn(e) &&
        ((t = void 0),
        pn(n[Da]) || (t = !n[Da]),
        (e = t = pn(n[Ea]) ? t : !n[Ea])),
      e
    );
  }
  function za(n, e) {
    var t, r;
    return (
      n
        ? (t = n.getCookieMgr())
        : e && (t = (r = e.cookieCfg) && r[Pa] ? r[Pa] : Ha(e)),
      t ||
        ((r = (n || {})[K]),
        (n = Ha[Pa] || Ua[Pa]) || ((n = Ha[Pa] = Ha(e, r)), (Ua[Pa] = n)),
        (t = n)),
      t
    );
  }
  function Ha(t, i) {
    (t = ea(t || Ua, null, i).cfg),
      (e = Tn(
        t,
        function (n) {
          n[Ct](n.cfg, La),
            (s = n.ref(n.cfg, 'cookieCfg')),
            (f = s[Ni] || '/'),
            (l = s[Mi]),
            (r = !1 !== Va(t, s)),
            (o = s.getCookie || Wa),
            (d = s.setCookie || Ja),
            (a = s.delCookie || Ja);
        },
        i
      )),
      ((n = {
        isEnabled: function () {
          var n = !1 !== Va(t, s) && r && ja(i),
            e = Ua[Pa];
          return n && e && v !== e ? Oa(e) : n;
        },
        setEnabled: function (n) {
          (r = !1 !== n), (s[zt] = n);
        },
        set: function (n, e, t, r, i) {
          var o,
            a,
            u,
            c = !1;
          return (
            !Oa(v) ||
              ((a = s),
              ((u = n) &&
                a &&
                hn(a.blockedCookies) &&
                -1 !== Ae(a.blockedCookies, u)) ||
                Fa(a, u)) ||
              ((a = {}),
              (u = Je(e || W)),
              -1 !== (o = ft(u, ';')) &&
                ((u = Je(Gn(e, o))), (a = Ba(Xn(e, o + 1)))),
              p(a, Mi, r || l, rn, pn),
              gn(t) ||
                ((e = vo()),
                pn(a[_a]) &&
                  0 < (o = He() + 1e3 * t) &&
                  ((r = new Date()).setTime(o),
                  p(a, _a, Ka(r, e ? Ta : Sa) || Ka(r, e ? Ta : Sa) || W, rn)),
                e || p(a, 'max-age', W + t, null, pn)),
              (o = so()) &&
                'https:' === o.protocol &&
                (p(a, 'secure', null, null, pn),
                (Na =
                  null === Na
                    ? ((r = (we() || {})[rr]),
                      !(
                        G(r) &&
                        (Vi(r, 'CPU iPhone OS 12') ||
                          Vi(r, 'iPad; CPU OS 12') ||
                          (Vi(r, 'Macintosh; Intel Mac OS X 10_14') &&
                            Vi(r, 'Version/') &&
                            Vi(r, 'Safari')) ||
                          (Vi(r, 'Macintosh; Intel Mac OS X 10_14') &&
                            ct(
                              r,
                              'AppleWebKit/605.1.15 (KHTML, like Gecko)'
                            )) ||
                          Vi(r, 'Chrome/5') ||
                          Vi(r, 'Chrome/6') ||
                          (Vi(r, 'UnrealEngine') && !Vi(r, 'Chrome')) ||
                          Vi(r, 'UCBrowser/12') ||
                          Vi(r, 'UCBrowser/11'))
                      ))
                    : Na) && p(a, 'SameSite', 'None', null, pn)),
              p(a, Ni, i || f, null, pn),
              d(n, Xa(u, a)),
              (c = !0)),
            c
          );
        },
        get: function (n) {
          var e = W;
          return Oa(v) && !Fa(s, n) ? o(n) : e;
        },
        del: function (n, e) {
          return !!Oa(v) && v.purge(n, e);
        },
        purge: function (n, e) {
          var t,
            r = !1;
          return (
            ja(i) &&
              (((t = {})[Ni] = e || '/'),
              (t[_a] = 'Thu, 01 Jan 1970 00:00:01 GMT'),
              (e = t),
              vo() || (e['max-age'] = '0'),
              a(n, Xa(W, e)),
              (r = !0)),
            r
          );
        },
      })[jt] = function (n) {
        e && e.rm(), (e = null);
      });
    var n,
      s,
      f,
      l,
      e,
      r,
      o,
      d,
      a,
      v = n;
    return (v[Pa] = v);
  }
  function ja(n) {
    if (null === Ma) {
      (Ma = !1), Ca || qa();
      try {
        var e = Ca.v || {};
        Ma = e[ka] !== undefined;
      } catch (t) {
        Sn(n, 2, 68, 'Cannot access document.cookie - ' + Cn(t), {
          exception: mn(t),
        });
      }
    }
    return Ma;
  }
  function Ba(n) {
    var t = {};
    return (
      n &&
        n[bn] &&
        wn(Je(n)[ir](';'), function (n) {
          var e;
          (n = Je(n || W)) &&
            (-1 === (e = ft(n, '='))
              ? (t[n] = null)
              : (t[Je(Gn(n, e))] = Je(Xn(n, e + 1))));
        }),
      t
    );
  }
  function Ka(n, e) {
    return $(n[e]) ? n[e]() : null;
  }
  function Xa(n, e) {
    var t = n || W;
    return (
      B(e, function (n, e) {
        t += '; ' + n + (gn(e) ? W : '=' + e);
      }),
      t
    );
  }
  function Wa(n) {
    var e,
      t = W;
    return (
      Ca || qa(),
      Ca.v &&
        ((e = Ca.v[ka] || W),
        Aa !== e && ((Ra = Ba(e)), (Aa = e)),
        (t = Je(Ra[n] || W))),
      t
    );
  }
  function Ja(n, e) {
    Ca || qa(), Ca.v && (Ca.v[ka] = n + '=' + e);
  }
  var Ga = { perfEvtsSendAll: !1 };
  function $a(n, t, r, i) {
    wn(n, function (n) {
      if (n && n[t])
        if (r)
          gt(function () {
            return i(n);
          }, 0);
        else
          try {
            i(n);
          } catch (e) {}
    });
  }
  Qa.__ieDyn = 1;
  var Ya = Qa;
  function Qa(n) {
    this.listeners = [];
    var t,
      i = [],
      o = ea(n, Ga)[Tt](function (n) {
        t = !!n.cfg.perfEvtsSendAll;
      });
    In(Qa, this, function (n) {
      yn(n, 'listeners', {
        g: function () {
          return i;
        },
      }),
        (n[Ft] = function (n) {
          i[X](n);
        }),
        (n[Vt] = function (n) {
          for (var e = Ae(i, n); -1 < e; ) i[kt](e, 1), (e = Ae(i, n));
        }),
        (n[ki] = function (e) {
          $a(i, ki, !0, function (n) {
            n[ki](e);
          });
        }),
        (n[_i] = function (e, t) {
          $a(i, _i, !0, function (n) {
            n[_i](e, t);
          });
        }),
        (n[Di] = function (e, t) {
          $a(i, Di, t, function (n) {
            n[Di](e, t);
          });
        }),
        (n[Ei] = function (e) {
          !e ||
            (!t && e[fr]()) ||
            $a(i, Ei, !1, function (n) {
              e[Yt]
                ? gt(function () {
                    return n[Ei](e);
                  }, 0)
                : n[Ei](e);
            });
        }),
        (n[jt] = function (e) {
          var t,
            r = function () {
              o && o.rm(), (o = null), (i = []);
            };
          if (
            ($a(i, 'unload', !1, function (n) {
              n = n[jt](e);
              n && (t = t || [])[X](n);
            }),
            t)
          )
            return pi(function (n) {
              return ei(hi(t), function () {
                r(), n();
              });
            });
          r();
        });
    });
  }
  var Za = 'ParentContextKey',
    nu = 'ChildrenContextKey',
    eu =
      ((tu.ParentContextKey = 'parent'),
      (tu.ChildrenContextKey = 'childEvts'),
      tu);
  function tu(n, e, t) {
    var r,
      i = this;
    (i.start = He()),
      (i[Rt] = n),
      (i[Yt] = t),
      (i[fr] = function () {
        return !1;
      }),
      $(e) &&
        yn(i, 'payload', {
          g: function () {
            return !r && $(e) && ((r = e()), (e = null)), r;
          },
        }),
      (i[lr] = function (n) {
        return n ? (n === tu[Za] || n === tu[nu] ? i : i.ctx || {})[n] : null;
      }),
      (i[dr] = function (n, e) {
        n &&
          (n === tu[Za]
            ? (i[n] ||
                (i[fr] = function () {
                  return !0;
                }),
              (i[n] = e))
            : n === tu[nu]
              ? (i[n] = e)
              : ((i.ctx = i.ctx || {})[n] = e));
      }),
      (i[vr] = function () {
        var n = 0,
          e = i[lr](tu[nu]);
        if (hn(e))
          for (var t = 0; t < e[bn]; t++) {
            var r = e[t];
            r && (n += r[Ut]);
          }
        (i[Ut] = He() - i.start),
          (i.exTime = i[Ut] - n),
          (i[vr] = function () {});
      });
  }
  iu.__ieDyn = 1;
  var ru = iu;
  function iu(e) {
    (this.ctx = {}),
      In(iu, this, function (t) {
        (t.create = function (n, e, t) {
          return new eu(n, e, t);
        }),
          (t.fire = function (n) {
            n && (n[vr](), e && $(e[Ei]) && e[Ei](n));
          }),
          (t[dr] = function (n, e) {
            n && ((t.ctx = t.ctx || {})[n] = e);
          }),
          (t[lr] = function (n) {
            return (t.ctx || {})[n];
          });
      });
  }
  var ou = 'CoreUtils.doPerf';
  function au(n, e, t, r, i) {
    if (n)
      if ((n = n[Pi] ? n[Pi]() : n)) {
        var o,
          a = void 0,
          u = n[lr](ou);
        try {
          if ((a = n.create(e(), r, i)))
            return (
              u &&
                a[dr] &&
                (a[dr](eu[Za], u),
                u[lr] &&
                  u[dr] &&
                  ((o = u[lr](eu[nu])) || ((o = []), u[dr](eu[nu], o)),
                  o[X](a))),
              n[dr](ou, a),
              t(a)
            );
        } catch (c) {
          a && a[dr] && a[dr]('exception', c);
        } finally {
          a && n.fire(a), n[dr](ou, u);
        }
      }
    return t();
  }
  function uu() {
    for (
      var n,
        e = [
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          'a',
          'b',
          'c',
          'd',
          'e',
          'f',
        ],
        t = W,
        r = 0;
      r < 4;
      r++
    )
      t +=
        e[15 & (n = Do())] +
        e[(n >> 4) & 15] +
        e[(n >> 8) & 15] +
        e[(n >> 12) & 15] +
        e[(n >> 16) & 15] +
        e[(n >> 20) & 15] +
        e[(n >> 24) & 15] +
        e[(n >> 28) & 15];
    var i = e[(8 + (3 & Do())) | 0];
    return (
      Wn(t, 0, 8) +
      Wn(t, 9, 4) +
      '4' +
      Wn(t, 13, 3) +
      i +
      Wn(t, 16, 3) +
      Wn(t, 19, 12)
    );
  }
  var cu =
      /^([\da-f]{2})-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})(-[^\s]{1,64})?$/i,
    su = '00',
    fu = 'ff',
    lu = '00000000000000000000000000000000',
    du = '0000000000000000';
  function vu(n, e, t) {
    return n && n[bn] === e && n !== t && n.match(/^[\da-f]*$/i);
  }
  function pu(n, e, t) {
    return vu(n, e) ? n : t;
  }
  function gu(n, e, t, r) {
    var i = {};
    return (
      (i[Kt] = vu(r, 2, fu) ? r : su),
      (i[pr] = mu(n) ? n : uu()),
      (i[gr] = yu(e) ? e : Gn(uu(), 16)),
      (i.traceFlags = 0 <= t && t <= 255 ? t : 1),
      i
    );
  }
  function hu(n, e) {
    if (!n) return null;
    if (!(n = hn(n) ? n[0] || '' : n) || !G(n) || 8192 < n[bn]) return null;
    ~n.indexOf(',') && (n = (t = n[ir](','))[0 < e && t[bn] > e ? e : 0]);
    var t = cu.exec(Je(n));
    return t && t[1] !== fu && t[2] !== lu && t[3] !== du
      ? (((e = {
          version: (t[1] || W)[mt](),
          traceId: (t[2] || W)[mt](),
          spanId: (t[3] || W)[mt](),
        })[hr] = parseInt(t[4], 16)),
        e)
      : null;
  }
  function mu(n) {
    return vu(n, 32, lu);
  }
  function yu(n) {
    return vu(n, 16, du);
  }
  function xu(n) {
    var e, t;
    return n
      ? (vu(
          (e = (function (n) {
            for (
              var e = (n = isNaN(n) || n < 0 || 255 < n ? 1 : n).toString(16);
              e[bn] < 2;

            )
              e = '0' + e;
            return e;
          })(n[hr])),
          2
        ) || (e = '01'),
        (t = n[Kt] || su),
        ''
          .concat((t = '00' !== t && 'ff' !== t ? su : t).toLowerCase(), '-')
          .concat(pu(n.traceId, 32, lu).toLowerCase(), '-')
          .concat(pu(n.spanId, 16, du).toLowerCase(), '-')
          .concat(e.toLowerCase()))
      : '';
  }
  var wu = Uo('plugin');
  function bu(n) {
    return wu.get(n, 'state', {}, !0);
  }
  function Iu(t, r) {
    for (var n = [], e = null, i = t[er](); i; ) {
      var o,
        a,
        u = i[Nt]();
      u &&
        (e && e[tr] && u[Ti] && e[tr](u),
        (a = !!(o = bu(u))[Mt]),
        (a = u[Mt] ? u[Mt]() : a) || n[X](u),
        (e = u),
        (i = i[er]()));
    }
    wn(n, function (n) {
      var e = t[xi]();
      n[Et](t.getCfg(), e, r, t[er]()),
        (o = bu(n)),
        n[xi] || o[xi] || (o[xi] = e),
        (o[Mt] = !0),
        delete o[Jt];
    });
  }
  function Cu(n) {
    return n.sort(function (n, e) {
      var t,
        r = 0;
      return (
        e
          ? ((t = e[Ti]), n[Ti] ? (r = t ? n[Si] - e[Si] : 1) : t && (r = -1))
          : (r = n ? 1 : -1),
        r
      );
    });
  }
  var Tu = 'TelemetryPluginChain',
    Su = '_hasRun',
    ku = '_getTelCtx',
    _u = 0;
  function Du(n, o, t, e) {
    var r = null,
      i = [],
      a =
        ((o = o || ea({}, null, t[K])),
        null !== e &&
          (r = e
            ? (function (n, e, t) {
                for (; n; ) {
                  if (n[Nt]() === t) return n;
                  n = n[er]();
                }
                return Nu([t], e.config || {}, e);
              })(n, t, e)
            : n),
        {
          _next: function () {
            var n,
              e = r;
            return (
              (r = e ? e[er]() : null),
              e ||
                ((n = i) &&
                  0 < n[bn] &&
                  (wn(n, function (n) {
                    try {
                      n.func.call(n.self, n.args);
                    } catch (e) {
                      Sn(
                        t[K],
                        2,
                        73,
                        'Unexpected Exception during onComplete - ' + mn(e)
                      );
                    }
                  }),
                  (i = []))),
              e
            );
          },
          ctx: {
            core: function () {
              return t;
            },
            diagLog: function () {
              return ya(t, o.cfg);
            },
            getCfg: function () {
              return o.cfg;
            },
            getExtCfg: function (n, e) {
              var r = u(n, !0);
              return (
                e &&
                  B(e, function (n, e) {
                    var t;
                    !gn(r[n]) || (!(t = o.cfg[n]) && gn(t)) || (r[n] = t),
                      Oo(o, r, n, e);
                  }),
                o[Ct](r, e)
              );
            },
            getConfig: function (n, e, t) {
              void 0 === t && (t = !1);
              var r,
                n = u(n, !1),
                i = o.cfg;
              return (
                !n || (!n[e] && gn(n[e]))
                  ? (!i[e] && gn(i[e])) || (r = i[e])
                  : (r = n[e]),
                r || !gn(r) ? r : t
              );
            },
            hasNext: function () {
              return !!r;
            },
            getNext: function () {
              return r;
            },
            setNext: function (n) {
              r = n;
            },
            iterate: function (n) {
              for (; (e = a._next()); ) {
                var e = e[Nt]();
                e && n(e);
              }
            },
            onComplete: function (n, e) {
              for (var t = [], r = 2; r < arguments.length; r++)
                t[r - 2] = arguments[r];
              n && i[X]({ func: n, self: pn(e) ? a.ctx : e, args: t });
            },
          },
        });
    function u(n, e) {
      var t,
        r = null,
        i = o.cfg;
      return (
        i &&
          n &&
          ((t = i[Ii]),
          (i[Ii] = t = !t && e ? {} : t),
          (t = o.ref(i, Ii)) &&
            ((r = t[n]), (t[n] = r = !r && e ? {} : r), (r = o.ref(t, n)))),
        r
      );
    }
    return a;
  }
  function Eu(n, e, t, r) {
    var i = ea(e),
      o = Du(n, i, t, r),
      a = o.ctx;
    return (
      (a[Lt] = function (n) {
        var e = o._next();
        return e && e[Ti](n, a), !e;
      }),
      (a[Wt] = function (n, e) {
        return Eu(
          (n = hn((n = void 0 === n ? null : n)) ? Nu(n, i.cfg, t, e) : n) ||
            a[er](),
          i.cfg,
          t,
          e
        );
      }),
      a
    );
  }
  function Pu(n, t, e) {
    var r = ea(t.config),
      i = Du(n, r, t, e),
      o = i.ctx;
    return (
      (o[Lt] = function (n) {
        var e = i._next();
        return e && e[jt](o, n), !e;
      }),
      (o[Wt] = function (n, e) {
        return Pu(
          (n = hn((n = void 0 === n ? null : n)) ? Nu(n, r.cfg, t, e) : n) ||
            o[er](),
          t,
          e
        );
      }),
      o
    );
  }
  function Mu(n, t, e) {
    var r = ea(t.config),
      i = Du(n, r, t, e).ctx;
    return (
      (i[Lt] = function (e) {
        return i.iterate(function (n) {
          $(n[nr]) && n[nr](i, e);
        });
      }),
      (i[Wt] = function (n, e) {
        return Mu(
          (n = hn((n = void 0 === n ? null : n)) ? Nu(n, r.cfg, t, e) : n) ||
            i[er](),
          t,
          e
        );
      }),
      i
    );
  }
  function Nu(n, e, t, r) {
    var i,
      o = null,
      a = !r;
    return (
      hn(n) &&
        0 < n[bn] &&
        ((i = null),
        wn(n, function (n) {
          (a = (!a && r === n) || a) &&
            n &&
            $(n[Ti]) &&
            ((n = Au(n, e, t)), (o = o || n), i && i._setNext(n), (i = n));
        })),
      r && !o ? Nu([r], e, t) : o
    );
  }
  function Au(c, r, i) {
    var s = null,
      o = $(c[Ti]),
      a = $(c[tr]),
      f = c ? c[Pt] + '-' + c[Si] + '-' + _u++ : 'Unknown-0-' + _u++,
      u = {
        getPlugin: function () {
          return c;
        },
        getNext: function () {
          return s;
        },
        processTelemetry: function (t, n) {
          var e;
          l(
            (n = n || (e = (e = c && $(c[ku]) ? c[ku]() : e) || Eu(u, r, i))),
            function (n) {
              if (!c || !o) return !1;
              var e = bu(c);
              return !e[Jt] && !e[bi] && (a && c[tr](s), c[Ti](t, n), !0);
            },
            'processTelemetry',
            function () {
              return { item: t };
            },
            !t.sync
          ) || n[Lt](t);
        },
        unload: function (r, i) {
          l(
            r,
            function () {
              var n,
                e,
                t = !1;
              return (
                c &&
                  ((n = bu(c)),
                  (e = c[xi] || n[xi]),
                  !c ||
                    (e && e !== r.core()) ||
                    n[Jt] ||
                    ((n[xi] = null),
                    (n[Jt] = !0),
                    (n[Mt] = !1),
                    c[Jt] && !0 === c[Jt](r, i) && (t = !0))),
                t
              );
            },
            'unload',
            function () {},
            i[Yt]
          ) || r[Lt](i);
        },
        update: function (r, i) {
          l(
            r,
            function () {
              var n,
                e,
                t = !1;
              return (
                c &&
                  ((n = bu(c)),
                  (e = c[xi] || n[xi]),
                  !c ||
                    (e && e !== r.core()) ||
                    n[Jt] ||
                    (c[nr] && !0 === c[nr](r, i) && (t = !0))),
                t
              );
            },
            'update',
            function () {},
            !1
          ) || r[Lt](i);
        },
        _id: f,
        _setNext: function (n) {
          s = n;
        },
      };
    function l(t, r, i, n, e) {
      var o = !1,
        a = c ? c[Pt] : Tu,
        u = (u = t[Su]) || (t[Su] = {});
      return (
        t.setNext(s),
        c &&
          au(
            t[xi](),
            function () {
              return a + ':' + i;
            },
            function () {
              u[f] = !0;
              try {
                var n = s ? s._id : W;
                n && (u[n] = !1), (o = r(t));
              } catch (e) {
                n = !s || u[s._id];
                n && (o = !0),
                  (s && n) ||
                    Sn(
                      t[Qt](),
                      1,
                      73,
                      'Plugin [' +
                        a +
                        '] failed during ' +
                        i +
                        ' - ' +
                        mn(e) +
                        ', run flags: ' +
                        mn(u)
                    );
              }
            },
            n,
            e
          ),
        o
      );
    }
    return vn(u);
  }
  function Ru() {
    var e = [];
    return {
      add: function (n) {
        n && e[X](n);
      },
      run: function (t, r) {
        wn(e, function (n) {
          try {
            n(t, r);
          } catch (e) {
            Sn(
              t[Qt](),
              2,
              73,
              'Unexpected error calling unload handler - ' + mn(e)
            );
          }
        }),
          (e = []);
      },
    };
  }
  function Uu() {
    var e = [];
    return {
      run: function (t) {
        var n = e;
        (e = []),
          wn(n, function (n) {
            try {
              (n.rm || n.remove).call(n);
            } catch (e) {
              Sn(t, 2, 73, 'Unloading:' + mn(e));
            }
          });
      },
      add: function (n) {
        n && Pe(e, n);
      },
    };
  }
  var Lu = 'getPlugin',
    qu = (((r = {})[Ii] = { isVal: Oi, v: {} }), r),
    s = ((Ou.__ieDyn = 1), Ou);
  function Ou() {
    var i,
      o,
      s,
      f,
      l,
      a = this;
    function e(n) {
      var e,
        n = (n = void 0 === n ? null : n);
      return (
        n ||
          ((e = o || Eu(null, {}, a[xi])),
          (n = s && s[Lu] ? e[Wt](null, s[Lu]) : e[Wt](null, s))),
        n
      );
    }
    function u(n, e, t) {
      ea(n, qu, ya(e)), !t && e && (t = e[qt]()[er]());
      var r = s;
      s && s[Lu] && (r = s[Lu]()), (a[xi] = e), (o = Eu(t, n, e, r));
    }
    function d() {
      (i = !1), (a[xi] = null), (s = o = null), (l = Uu()), (f = Ru());
    }
    d(),
      In(Ou, a, function (c) {
        (c[Et] = function (n, e, t, r) {
          u(n, e, r), (i = !0);
        }),
          (c[Jt] = function (n, e) {
            var t,
              r,
              i,
              o,
              a = c[xi];
            if (a && (!n || a === n[xi]()))
              return (
                (r = !1),
                (i = n || Pu(null, a, s && s[Lu] ? s[Lu]() : s)),
                (o = e || (((n = { reason: 0 })[Yt] = !1), n)),
                c[Zt] && !0 === c[Zt](i, o, u) ? (t = !0) : u(),
                t
              );
            function u() {
              r ||
                ((r = !0),
                f.run(i, e),
                l.run(i[Qt]()),
                !0 === t && i[Lt](o),
                d());
            }
          }),
          (c[nr] = function (n, e) {
            var t,
              r,
              i,
              o = c[xi];
            if (o && (!n || o === n[xi]()))
              return (
                (r = !1),
                (i = n || Mu(null, o, s && s[Lu] ? s[Lu]() : s)),
                c._doUpdate && !0 === c._doUpdate(i, e || { reason: 0 }, a)
                  ? (t = !0)
                  : a(),
                t
              );
            function a() {
              r || ((r = !0), u(i.getCfg(), i.core(), i[er]()));
            }
          }),
          Bi(
            c,
            '_addUnloadCb',
            function () {
              return f;
            },
            'add'
          ),
          Bi(
            c,
            '_addHook',
            function () {
              return l;
            },
            'add'
          ),
          yn(c, '_unloadHooks', {
            g: function () {
              return l;
            },
          });
      }),
      (a[Qt] = function (n) {
        return e(n)[Qt]();
      }),
      (a[Mt] = function () {
        return i;
      }),
      (a.setInitialized = function (n) {
        i = n;
      }),
      (a[tr] = function (n) {
        s = n;
      }),
      (a[Lt] = function (n, e) {
        e ? e[Lt](n) : s && $(s[Ti]) && s[Ti](n, null);
      }),
      (a._getTelCtx = e);
  }
  function Fu(n, e, t) {
    for (var r = !1, i = n[bn], o = 0; o < i; ++o) {
      var a = n[o];
      if (a)
        try {
          if (!1 === a.fn[St](null, [e])) {
            r = !0;
            break;
          }
        } catch (u) {
          Sn(
            t,
            2,
            64,
            'Telemetry initializer failed: ' + Cn(u),
            { exception: mn(u) },
            !0
          );
        }
    }
    return !r;
  }
  kr(Hu, (Vu = s)), (Hu.__ieDyn = 1);
  var Vu,
    zu = Hu;
  function Hu() {
    var i,
      o,
      n = Vu.call(this) || this;
    function e() {
      (i = 0), (o = []);
    }
    return (
      (n.identifier = 'TelemetryInitializerPlugin'),
      (n.priority = 199),
      e(),
      In(Hu, n, function (t, n) {
        (t.addTelemetryInitializer = function (n) {
          return (
            (e = i++),
            Pe((t = o), (r = { id: e, fn: n })),
            {
              remove: function () {
                wn(t, function (n, e) {
                  if (n.id === r.id) return t[kt](e, 1), -1;
                });
              },
            }
          );
          var t, e, r;
        }),
          (t[Ti] = function (n, e) {
            Fu(o, n, (e || t)[Qt]()) && t[Lt](n, e);
          }),
          (t[Zt] = function () {
            e();
          });
      }),
      n
    );
  }
  var ju = 'Plugins must provide initialize method',
    Bu = 'SDK is still unloading...',
    Ku = dn(
      (((t = { cookieCfg: {} })[Ci] = { rdOnly: !0, ref: !0, v: [] }),
      (t[yi] = { rdOnly: !0, ref: !0, v: [] }),
      (t[Ii] = { ref: !0, v: {} }),
      (t[wi] = mi),
      (t.loggingLevelConsole = 0),
      (t.diagnosticLogInterval = mi),
      t)
    );
  function Xu(n, e) {
    return new ru(e);
  }
  function Wu(e, n) {
    var t = !1;
    return (
      wn(n, function (n) {
        if (n === e) return (t = !0), -1;
      }),
      t
    );
  }
  function Ju(n, t) {
    var r = null,
      i = -1;
    return (
      wn(n, function (n, e) {
        if (n.w === t) return (r = n), (i = e), -1;
      }),
      { i: i, l: r }
    );
  }
  $u.__ieDyn = 1;
  var Gu = $u;
  function $u() {
    var x,
      w,
      b,
      r,
      I,
      i,
      C,
      T,
      S,
      k,
      _,
      D,
      E,
      o,
      P,
      M,
      N,
      A,
      R,
      U,
      L,
      q,
      O,
      F,
      V,
      z,
      H,
      j;
    In($u, this, function (u) {
      function a(n) {
        return (
          (z && z[zt]) ||
            j ||
            ((n || (b && 0 < b.queue[bn])) &&
              (H ||
                ((H = !0),
                y(
                  x[Tt](function (n) {
                    var n = n.cfg.diagnosticLogInterval,
                      e = ((n && 0 < n) || (n = 1e4), !1);
                    z && ((e = z[zt]), z[Dt]()),
                      (z = (function () {
                        return pt(this, !1, J, Z[Y][Q](arguments));
                      })(p, n)).unref(),
                      (z[zt] = e);
                  })
                )),
              (z[zt] = !0))),
          z
        );
      }
      function e() {
        var t = {},
          e =
            ((F = []),
            function (n) {
              n &&
                wn(n, function (n) {
                  var e;
                  n[Pt] &&
                    n[Kt] &&
                    !t[n.identifier] &&
                    ((e = n[Pt] + '=' + n[Kt]), F[X](e), (t[n.identifier] = n));
                });
            });
        e(D),
          _ &&
            wn(_, function (n) {
              e(n);
            }),
          e(k);
      }
      function c() {
        (w = !1),
          ((x = ea({}, Ku, u[K])).cfg[Xt] = 1),
          yn(u, 'config', {
            g: function () {
              return x.cfg;
            },
            s: function (n) {
              u.updateCfg(n, !1);
            },
          }),
          yn(u, 'pluginVersionStringArr', {
            g: function () {
              return F || e(), F;
            },
          }),
          yn(u, 'pluginVersionString', {
            g: function () {
              return V || (F || e(), (V = F.join(';'))), V || W;
            },
          }),
          yn(u, 'logger', {
            g: function () {
              return b || ((b = new xa(x.cfg)), (x[K] = b)), b;
            },
            s: function (n) {
              (x[K] = n), b !== n && (ta(b, !1), (b = n));
            },
          }),
          (u[K] = new xa(x.cfg)),
          (O = []);
        var n = u.config[Ci] || [];
        n.splice(0, n[bn]),
          Pe(n, O),
          (o = new zu()),
          ta(I, !(r = [])),
          (C = i = I = null),
          ta(T, !1),
          (E = !(k = [])),
          (M = Ro('AIBaseCore', !(P = D = _ = S = T = null))),
          (N = Ru()),
          (A = Uu()),
          (F = V = L = U = null),
          (j = !(q = []));
      }
      function s() {
        var n = Eu(d(), x.cfg, u);
        return n[Bt](a), n;
      }
      function f(n) {
        (r = u[K]),
          (i = []),
          (o = []),
          (a = {}),
          wn(k, function (n) {
            (gn(n) || gn(n[Et])) && cn(ju);
            var e = n[Si],
              t = n[Pt];
            n &&
              e &&
              (gn(a[e])
                ? (a[e] = t)
                : Ia(
                    r,
                    'Two extensions have same priority #' +
                      e +
                      ' - ' +
                      a[e] +
                      ', ' +
                      t
                  )),
              (!e || e < 500 ? i : o)[X](n);
          }),
          ((e = {})[xi] = i),
          (e[yi] = o);
        (F = V = S = null), (D = Cu(Pe((D = (_ || [])[0] || []), e[yi])));
        var r,
          i,
          o,
          a,
          e = Pe(Cu(e[xi]), D),
          t = ((O = vn(e)), u.config[Ci] || []),
          t = (t.splice(0, t[bn]), Pe(t, O), s());
        D && 0 < D[bn] && Iu(t[Wt](D), e), Iu(t, e), n && h(n);
      }
      function l(e) {
        var i = null,
          t = [];
        return (
          wn(O, function (n) {
            if (n[Pt] === e && n !== o) return (i = n), -1;
            n.getChannel && t[X](n);
          }),
          !i &&
            0 < t[bn] &&
            wn(t, function (n) {
              if (!(i = n.getChannel(e))) return -1;
            }),
          i
            ? {
                plugin: i,
                setEnabled: function (n) {
                  bu(i)[bi] = !n;
                },
                isEnabled: function () {
                  var n = bu(i);
                  return !n[Jt] && !n[bi];
                },
                remove: function (n, e) {
                  var t,
                    r = [i];
                  ((t = { reason: 1 })[Yt] = n = void 0 === n || n),
                    v(r, t, function (n) {
                      n && f({ reason: 32, removed: r }), e && e(n);
                    });
                },
              }
            : null
        );
      }
      function d() {
        var n;
        return (
          S ||
            ((n = (O || []).slice()),
            -1 === Ae(n, o) && n[X](o),
            (S = Nu(Cu(n), x.cfg, u))),
          S
        );
      }
      function v(o, n, e) {
        var t;
        o && 0 < o[bn]
          ? ((t = Pu(Nu(o, x.cfg, u), u))[Bt](function () {
              var r = !1,
                t = [],
                i =
                  (wn(k, function (n, e) {
                    Wu(n, o) ? (r = !0) : t[X](n);
                  }),
                  (k = t),
                  (F = V = null),
                  []);
              _ &&
                (wn(_, function (n, e) {
                  var t = [];
                  wn(n, function (n) {
                    Wu(n, o) ? (r = !0) : t[X](n);
                  }),
                    i[X](t);
                }),
                (_ = i)),
                e && e(r),
                a();
            }),
            t[Lt](n))
          : e(!1);
      }
      function p() {
        var n;
        b &&
          b.queue &&
          ((n = b.queue.slice(0)),
          (b.queue[bn] = 0),
          wn(n, function (n) {
            ((e = {})[Rt] = P || 'InternalMessageId: ' + n[Gt]),
              (e.iKey = L),
              (e[Ut] = zi(new Date())),
              (e.baseType = ha.dataType),
              (e.baseData = { message: n[$t] });
            var e,
              n = e;
            u.track(n);
          }));
      }
      function g(t, n, r, i) {
        var o = 1,
          e = !1,
          a = null;
        function u() {
          o--,
            e && 0 === o && (a && a[Dt](), (a = null), n && n(e), (n = null));
        }
        return (
          (i = i || 5e3),
          D &&
            0 < D[bn] &&
            s()
              [Wt](D)
              .iterate(function (n) {
                var e;
                n.flush &&
                  (o++,
                  (e = !1),
                  n.flush(
                    t,
                    function () {
                      (e = !0), u();
                    },
                    r
                  ) ||
                    e ||
                    (t && null == a
                      ? (a = gt(function () {
                          (a = null), u();
                        }, i))
                      : u()));
              }),
          (e = !0),
          u(),
          !0
        );
      }
      function h(n) {
        var e = Mu(d(), u);
        e[Bt](a), (u._updateHook && !0 === u._updateHook(e, n)) || e[Lt](n);
      }
      function m(n) {
        var e = u[K];
        e ? (Sn(e, 2, 73, n), a()) : cn(n);
      }
      function t(n) {
        var e = u[Ot]();
        e && e[_i]([n], 2);
      }
      function y(n) {
        A.add(n);
      }
      c(),
        (u._getDbgPlgTargets = function () {
          return [O];
        }),
        (u[Mt] = function () {
          return w;
        }),
        (u[Et] = function (n, e, t, r) {
          E && cn(Bu),
            u[Mt]() && cn('Core cannot be initialized more than once'),
            (n = (x = ea(n, Ku, t || u[K], !1)).cfg),
            y(
              x[Tt](function (e) {
                L = e.cfg.instrumentationKey;
                var t = e.ref(e.cfg, Ii);
                B(t, function (n) {
                  e.ref(t, n);
                }),
                  gn(L) && cn('Please provide instrumentation key');
              })
            ),
            (I = r) || u[Ot](),
            y(
              x[Tt](function (n) {
                var e = n.cfg.disableDbgExt;
                !0 === e && R && (I[Vt](R), (R = null)),
                  I &&
                    !R &&
                    !0 !== e &&
                    ((R = (function (n) {
                      if (!ua) {
                        ua = {};
                        for (var e = 0; e < ca[bn]; e++)
                          ua[ca[e]] = (function (t, r) {
                            return function () {
                              var n = arguments,
                                e = fa(r);
                              e && (e = e.listener) && e[t] && e[t][St](e, n);
                            };
                          })(ca[e], n);
                      }
                      return ua;
                    })(n.cfg)),
                    I[Ft](R));
              })
            ),
            y(
              x[Tt](function (n) {
                var e = n.cfg.enablePerfMgr;
                !e && C && (C = null), e && Hi(n.cfg, wi, Xu);
              })
            ),
            (u[K] = t);
          var i,
            o,
            r = n[Ci];
          (k = [])[X].apply(k, _r(_r([], e), r)),
            (_ = n[yi]),
            f(null),
            (D && 0 !== D[bn]) || cn('No ' + yi + ' available'),
            _ &&
              1 < _[bn] &&
              (((t = u[Nt]('TeeChannelController')) && t.plugin) ||
                Sn(b, 1, 28, 'TeeChannel required')),
            (i = n),
            (o = b),
            wn(q, function (n) {
              var e = Tn(i, n.w, o);
              delete n.w,
                (n.rm = function () {
                  e.rm();
                });
            }),
            (w = !(q = null)),
            u.releaseQueue(),
            u[At]();
        }),
        (u.getChannels = function () {
          var e = [];
          return (
            D &&
              wn(D, function (n) {
                e[X](n);
              }),
            vn(e)
          );
        }),
        (u.track = function (n) {
          au(
            u[Pi](),
            function () {
              return 'AppInsightsCore:track';
            },
            function () {
              null === n && (t(n), cn('Invalid telemetry item')),
                !n[Rt] && gn(n[Rt]) && (t(n), cn('telemetry name required')),
                (n.iKey = n.iKey || L),
                (n[Ut] = n[Ut] || zi(new Date())),
                (n.ver = n.ver || '4.0'),
                !E && u[Mt]() ? s()[Lt](n) : r[X](n);
            },
            function () {
              return { item: n };
            },
            !n.sync
          );
        }),
        (u[qt] = s),
        (u[Ot] = function () {
          return I || ((I = new Ya(x.cfg)), (u._notificationManager = I)), I;
        }),
        (u[Ft] = function (n) {
          u[Ot]()[Ft](n);
        }),
        (u[Vt] = function (n) {
          I && I[Vt](n);
        }),
        (u.getCookieMgr = function () {
          return (T = T || Ha(x.cfg, u[K]));
        }),
        (u.setCookieMgr = function (n) {
          T !== n && (ta(T, !1), (T = n));
        }),
        (u[Pi] = function () {
          return (
            i ||
              C ||
              y(
                x[Tt](function (n) {
                  n.cfg.enablePerfMgr &&
                    ((n = n.cfg[wi]), $(n) && (C = n(u, u[Ot]())));
                })
              ),
            i || C || null
          );
        }),
        (u.setPerfMgr = function (n) {
          i = n;
        }),
        (u.eventCnt = function () {
          return r[bn];
        }),
        (u.releaseQueue = function () {
          var n;
          w &&
            0 < r[bn] &&
            ((n = r),
            (r = []),
            wn(n, function (n) {
              s()[Lt](n);
            }));
        }),
        (u[At] = function (n) {
          return (P = n || null), (j = !1), z && z[Dt](), a(!0);
        }),
        (u[Ht] = function () {
          (j = !0), z && z[Dt](), p();
        }),
        Ki(
          u,
          function () {
            return o;
          },
          ['addTelemetryInitializer']
        ),
        (u[jt] = function (n, e, t) {
          void 0 === n && (n = !0),
            w || cn('SDK is not initialized'),
            E && cn(Bu),
            ((r = { reason: 50 })[Yt] = n),
            (r.flushComplete = !1);
          var r,
            i,
            o = r,
            a =
              (n &&
                !e &&
                (i = pi(function (n) {
                  e = n;
                })),
              Pu(d(), u));
          return (
            a[Bt](function () {
              A.run(u[K]),
                (function r(n, e, t) {
                  t ||
                    pi(function (n) {
                      t = n;
                    }),
                    n && 0 < it(n)
                      ? ei(ta(n[0], e), function () {
                          r(Ue(n, 1), e, t);
                        })
                      : t();
                })([T, I, b], n, function () {
                  c(), e && e(o);
                });
            }, u),
            p(),
            g(
              n,
              function (n) {
                (o.flushComplete = n), (E = !0), N.run(a, o), u[Ht](), a[Lt](o);
              },
              6,
              t
            ),
            i
          );
        }),
        (u[Nt] = l),
        (u.addPlugin = function (n, e, t, r) {
          if (!n) return r && r(!1), void m(ju);
          var i = l(n[Pt]);
          if (i && !e)
            return (
              r && r(!1), void m('Plugin [' + n[Pt] + '] is already loaded!')
            );
          var o,
            a = { reason: 16 };
          function u() {
            k[X](n), (a.added = [n]), f(a), r && r(!0);
          }
          i
            ? v((o = [i.plugin]), { reason: 2, isAsync: !!t }, function (n) {
                n ? ((a.removed = o), (a.reason |= 32), u()) : r && r(!1);
              })
            : u();
        }),
        (u.updateCfg = function (r, n) {
          var e, t;
          void 0 === n && (n = !0),
            u[Mt]() &&
              ((e = {
                reason: 1,
                cfg: x.cfg,
                oldCfg: tt({}, x.cfg),
                newConfig: tt({}, r),
                merge: n,
              }),
              (r = e.newConfig),
              (t = x.cfg),
              (r[Ci] = t[Ci]),
              (r[yi] = t[yi])),
            x._block(function (e) {
              var t = e.cfg;
              !(function o(t, r, n, i) {
                n &&
                  B(n, function (n, e) {
                    i && Ge(e) && Ge(r[n]) && o(t, r[n], e, i),
                      i && Ge(e) && Ge(r[n])
                        ? o(t, r[n], e, i)
                        : t.set(r, n, e);
                  });
              })(e, t, r, n),
                n ||
                  B(t, function (n) {
                    Pn(r, n) || e.set(t, n, mi);
                  }),
                e[Ct](t, Ku);
            }, !0),
            x[wt](),
            e && h(e);
        }),
        (u.evtNamespace = function () {
          return M;
        }),
        (u.flush = g),
        (u.getTraceCtx = function (n) {
          var e;
          return (
            U ||
              ((e = {}),
              (U = {
                getName: function () {
                  return e[Rt];
                },
                setName: function (n) {
                  e[Rt] = n;
                },
                getTraceId: function () {
                  return e[pr];
                },
                setTraceId: function (n) {
                  mu(n) && (e[pr] = n);
                },
                getSpanId: function () {
                  return e[gr];
                },
                setSpanId: function (n) {
                  yu(n) && (e[gr] = n);
                },
                getTraceFlags: function () {
                  return e[hr];
                },
                setTraceFlags: function (n) {
                  e[hr] = n;
                },
              })),
            U
          );
        }),
        (u.setTraceCtx = function (n) {
          U = n || null;
        }),
        (u.addUnloadHook = y),
        Bi(
          u,
          'addUnloadCb',
          function () {
            return N;
          },
          'add'
        ),
        (u.onCfgChange = function (n) {
          var e,
            t,
            r = w
              ? Tn(x.cfg, n, u[K])
              : ((n = Ju((e = q), (t = n)).l) ||
                  e[X](
                    (n = {
                      w: t,
                      rm: function () {
                        var n = Ju(e, t);
                        -1 !== n.i && e[kt](n.i, 1);
                      },
                    })
                  ),
                n);
          return {
            rm: function () {
              r.rm();
            },
          };
        }),
        (u.getWParam = function () {
          return ye() || x.cfg.enableWParam ? 0 : -1;
        });
    });
  }
  var Yu = 'on',
    Qu = 'attachEvent',
    Zu = 'addEventListener',
    nc = 'detachEvent',
    ec = 'removeEventListener',
    tc = 'events',
    rc = 'visibilitychange',
    ic = 'pagehide',
    oc = 'beforeunload',
    ac = Ro('aiEvtPageHide'),
    uc = (Ro('aiEvtPageShow'), /\.[\.]+/g),
    cc = /[\.]+$/,
    sc = 1,
    fc = Uo('events'),
    lc = /^([^.]*)(?:\.(.+)|)/;
  function dc(n) {
    return n && n[ar] ? n[ar](/^[\s\.]+|(?=[\s\.])[\.\s]+$/g, W) : n;
  }
  function vc(n, e) {
    e &&
      ((t = W),
      hn(e)
        ? ((t = W),
          wn(e, function (n) {
            (n = dc(n)) && ('.' !== n[0] && (n = '.' + n), (t += n));
          }))
        : (t = dc(e)),
      t && ('.' !== t[0] && (t = '.' + t), (n = (n || W) + t)));
    var t,
      e = lc.exec(n || W) || [],
      n = {};
    return (
      (n[cr] = e[1]),
      (n.ns = (e[2] || W)
        .replace(uc, '.')
        .replace(cc, W)
        [ir]('.')
        .sort()
        .join('.')),
      n
    );
  }
  function pc(n, e, t) {
    n = fc.get(n, tc, {}, (t = void 0 === t || t));
    return n[e] || (n[e] = []);
  }
  function gc(n, e, t, r) {
    n &&
      e &&
      e[cr] &&
      (n[ec] ? n[ec](e[cr], t, r) : n[nc] && n[nc](Yu + e[cr], t));
  }
  function hc(n, e, t, r) {
    for (var i = e[bn]; i--; ) {
      var o = e[i];
      !o ||
        (t.ns && t.ns !== o.evtName.ns) ||
        (r && !r(o)) ||
        (gc(n, o.evtName, o[sr], o.capture), e[kt](i, 1));
    }
  }
  function mc(n, e) {
    return e ? vc('xx', hn(e) ? [n].concat(e) : [n, e]).ns[ir]('.') : n;
  }
  function yc(n, e, t, r, i) {
    void 0 === i && (i = !1);
    var o,
      a,
      u = !1;
    if (n)
      try {
        var c,
          s = vc(e, r),
          f = s,
          l = t,
          d = i,
          v = !1;
        (a = n) &&
          f &&
          f[cr] &&
          l &&
          (a[Zu]
            ? (a[Zu](f[cr], l, d), (v = !0))
            : a[Qu] && (a[Qu](Yu + f[cr], l), (v = !0))),
          (u = v) &&
            fc.accept(n) &&
            (((o = { guid: sc++, evtName: s })[sr] = t),
            (o.capture = i),
            (c = o),
            pc(n, s.type)[X](c));
      } catch (p) {}
    return u;
  }
  function xc(n, e, t, r, i) {
    if ((void 0 === i && (i = !1), n))
      try {
        var o = vc(e, r),
          a = !1,
          u = n,
          c = function (n) {
            return !((!o.ns || t) && n[sr] !== t) && (a = !0);
          };
        (s = o)[cr]
          ? hc(u, pc(u, s[cr]), s, c)
          : (B((f = fc.get(u, tc, {})), function (n, e) {
              hc(u, e, s, c);
            }),
            0 === Mn(f)[bn] && fc.kill(u, tc)),
          a || gc(n, o, t, i);
      } catch (l) {}
    var s, f;
  }
  function wc(n, e, t) {
    var r = !1,
      i = xe(),
      i = (i && ((r = yc(i, n, e, t)), (r = yc(i.body, n, e, t) || r)), ye());
    return (i && yc(i, n, e, t)) || r;
  }
  function bc(n, e, t) {
    var r = xe(),
      r = (r && (xc(r, n, e, t), xc(r.body, n, e, t)), ye());
    r && xc(r, n, e, t);
  }
  function Ic(n, e, t, r) {
    var i = !1;
    return (
      e &&
        n &&
        0 < n[bn] &&
        wn(n, function (n) {
          !n || (t && -1 !== Ae(t, n)) || (i = wc(n, e, r) || i);
        }),
      i
    );
  }
  function Cc(n, e, t) {
    n &&
      hn(n) &&
      wn(n, function (n) {
        n && bc(n, e, t);
      });
  }
  function Tc(t, n, e) {
    var r = mc(ac, e),
      i = Ic([ic], t, n, r);
    return !(i =
      ((!n || -1 === Ae(n, rc)) &&
        Ic(
          [rc],
          function (n) {
            var e = ye();
            t && e && 'hidden' === e.visibilityState && t(n);
          },
          n,
          r
        )) ||
      i) && n
      ? Tc(t, null, e)
      : i;
  }
  var q = e({ DISABLED: 0, CRITICAL: 1, WARNING: 2, DEBUG: 3 }),
    Sc = '_aiHooks',
    kc = ['req', 'rsp', 'hkErr', 'fnErr'];
  function _c(n, e) {
    if (n) for (var t = 0; t < n[bn] && !e(n[t], t); t++);
  }
  function Dc(n, a, u, c, s) {
    0 <= s &&
      s <= 2 &&
      _c(n, function (n, e) {
        var n = n.cbks,
          t = n[kc[s]];
        if (t) {
          a.ctx = function () {
            return (c[e] = c[e] || {});
          };
          try {
            t[St](a.inst, u);
          } catch (i) {
            t = a.err;
            try {
              var r = n.hkErr;
              r && ((a.err = i), r[St](a.inst, u));
            } catch (o) {
            } finally {
              a.err = t;
            }
          }
        }
      });
  }
  function Ec(c) {
    return function () {
      var t = arguments,
        n = c.h,
        r =
          (((e = {})[Rt] = c.n),
          (e.inst = this),
          (e.ctx = null),
          (e.set = function (n, e) {
            ((t = o([], t))[n] = e), (i = o([r], t));
          }),
          e),
        e = [],
        i = o([r], t);
      function o(e, n) {
        return (
          _c(n, function (n) {
            e[X](n);
          }),
          e
        );
      }
      (r.evt = xn('event')), Dc(n, r, i, e, 0);
      var a = c.f;
      if (a)
        try {
          r.rslt = a[St](this, t);
        } catch (u) {
          throw ((r.err = u), Dc(n, r, i, e, 3), u);
        }
      return Dc(n, r, i, e, 1), r.rslt;
    };
  }
  function Pc(n, e, t, r) {
    var i = null;
    return n && (an(n, e) ? (i = n) : t && (i = Pc(qi(n), e, r, !1))), i;
  }
  function Mc(n, e, t, r) {
    var i = t && t[Sc],
      e =
        (i ||
          (((t = Ec((i = { i: 0, n: e, f: t, h: [] })))[Sc] = i), (n[e] = t)),
        {
          id: i.i,
          cbks: r,
          rm: function () {
            var t = this.id;
            _c(i.h, function (n, e) {
              return n.id === t && (i.h[kt](e, 1), 1);
            });
          },
        });
    return i.i++, i.h[X](e), e;
  }
  function Nc(n, e, t, r, i) {
    if ((void 0 === r && (r = !0), n && e && t)) {
      n = Pc(n, e, r, i);
      if (n) {
        r = n[e];
        if (typeof r === mr) return Mc(n, e, r, t);
      }
    }
    return null;
  }
  function Ac(n, e, t, r, i) {
    if (n && e && t) {
      r = Pc(n, e, r, i) || n;
      if (r) return Mc(r, e, r[e], t);
    }
    return null;
  }
  var Rc,
    Uc = 'Microsoft_ApplicationInsights_BypassAjaxInstrumentation',
    Lc = 'sampleRate',
    qc = 'ProcessLegacy',
    Oc = 'http.method',
    Fc = 'https://dc.services.visualstudio.com',
    Vc = '/v2/track',
    zc = 'not_specified',
    Hc = 'iKey',
    kn =
      ((Rc = {}),
      B(
        {
          requestContextHeader: [0, 'Request-Context'],
          requestContextTargetKey: [1, 'appId'],
          requestContextAppIdFormat: [2, 'appId=cid-v1:'],
          requestIdHeader: [3, 'Request-Id'],
          traceParentHeader: [4, 'traceparent'],
          traceStateHeader: [5, 'tracestate'],
          sdkContextHeader: [6, 'Sdk-Context'],
          sdkContextHeaderAppIdRequest: [7, 'appId'],
          requestContextHeaderLowerCase: [8, 'request-context'],
        },
        function (n, e) {
          (Rc[n] = e[1]), (Rc[e[0]] = e[1]);
        }
      ),
      dn(Rc)),
    jc = 'split',
    S = 'length',
    Bc = 'toLowerCase',
    Kc = 'ingestionendpoint',
    Xc = 'toString',
    Wc = 'push',
    Jc = 'removeItem',
    Gc = 'name',
    $c = 'message',
    Yc = 'count',
    Qc = 'preTriggerDate',
    Zc = 'disabled',
    ns = 'interval',
    es = 'daysOfMonth',
    ts = 'date',
    rs = 'getUTCDate',
    is = 'stringify',
    os = 'pathname',
    as = 'correlationHeaderExcludePatterns',
    us = 'exceptions',
    cs = 'parsedStack',
    ss = 'properties',
    fs = 'measurements',
    ls = 'sizeInBytes',
    ds = 'typeName',
    vs = 'severityLevel',
    ps = 'problemGroup',
    gs = 'isManual',
    hs = 'CreateFromInterface',
    ms = 'assembly',
    ys = 'fileName',
    xs = 'hasFullStack',
    ws = 'level',
    bs = 'method',
    Is = 'line',
    Cs = 'duration',
    Ts = 'receivedResponse';
  function Ss(n, e, t) {
    var r,
      i,
      o = e[S],
      a =
        ((n = n),
        (e = e) &&
          150 < (e = Je(Ln(e)))[S] &&
          ((i = Xn(e, 0, 150)),
          Sn(
            n,
            2,
            57,
            'name is too long.  It has been truncated to 150 characters.',
            { name: e },
            !0
          )),
        i || e);
    if (a[S] !== o) {
      for (var u = 0, c = a; t[c] !== undefined; )
        u++, (c = Xn(a, 0, 147) + Wn((r = '00' + u), r[S] - 3));
      a = c;
    }
    return a;
  }
  function L(n, e, t) {
    var r;
    return (
      void 0 === t && (t = 1024),
      e &&
        ((t = t || 1024),
        (e = Je(Ln(e)))[S] > t &&
          ((r = Xn(e, 0, t)),
          Sn(
            n,
            2,
            61,
            'string value is too long. It has been truncated to ' +
              t +
              ' characters.',
            { value: e },
            !0
          ))),
      r || e
    );
  }
  function ks(n, e) {
    return Ps(n, e, 2048, 66);
  }
  function _s(n, e) {
    var t;
    return (
      e &&
        32768 < e[S] &&
        ((t = Xn(e, 0, 32768)),
        Sn(
          n,
          2,
          56,
          'message is too long, it has been truncated to 32768 characters.',
          { message: e },
          !0
        )),
      t || e
    );
  }
  function Ds(r, n) {
    var i;
    return (
      n &&
        ((i = {}),
        B(n, function (n, e) {
          if (Dn(e) && fo())
            try {
              e = lo()[is](e);
            } catch (t) {
              Sn(
                r,
                2,
                49,
                'custom property is not valid',
                { exception: t },
                !0
              );
            }
          (e = L(r, e, 8192)), (n = Ss(r, n, i)), (i[n] = e);
        }),
        (n = i)),
      n
    );
  }
  function Es(t, n) {
    var r;
    return (
      n &&
        ((r = {}),
        B(n, function (n, e) {
          (n = Ss(t, n, r)), (r[n] = e);
        }),
        (n = r)),
      n
    );
  }
  function Ps(n, e, t, r) {
    var i;
    return (
      e &&
        (e = Je(Ln(e)))[S] > t &&
        ((i = Xn(e, 0, t)),
        Sn(
          n,
          2,
          r,
          'input is too long, it has been truncated to ' + t + ' characters.',
          { data: e },
          !0
        )),
      i || e
    );
  }
  var Ms = ye() || {},
    Ns = 0,
    As = [null, null, null, null, null];
  function Rs(t) {
    var n = Ns,
      e = As,
      r = e[n];
    return (
      Ms.createElement
        ? e[n] || (r = e[n] = Ms.createElement('a'))
        : (r = {
            host: (function () {
              var n = Us(t, !0) || '';
              if (n) {
                var e = n.match(/(www\d{0,5}\.)?([^\/:]{1,256})(:\d{1,20})?/i);
                if (null != e && 3 < e[S] && G(e[2]) && 0 < e[2][S])
                  return e[2] + (e[3] || '');
              }
              return n;
            })(),
          }),
      (r.href = t),
      ++n >= e[S] && (n = 0),
      (Ns = n),
      r
    );
  }
  function Us(n, e) {
    var t = null;
    return (
      n &&
        null != (n = n.match(/(\w{1,150}):\/\/([^\/:]{1,256})(:\d{1,20})?/i)) &&
        2 < n[S] &&
        G(n[2]) &&
        0 < n[2][S] &&
        ((t = n[2] || ''),
        e &&
          2 < n[S] &&
          ((e = (n[1] || '')[Bc]()),
          (n = n[3] || ''),
          (t += n =
            ('http' === e && ':80' === n) || ('https' === e && ':443' === n)
              ? ''
              : n))),
      t
    );
  }
  var Ls = [
      Fc + Vc,
      'https://breeze.aimon.applicationinsights.io' + Vc,
      'https://dc-int.services.visualstudio.com' + Vc,
    ],
    qs = 'cid-v1:';
  function Os(n) {
    return -1 !== Ae(Ls, n[Bc]());
  }
  function Fs(n, e, t) {
    if (!(!e || (n && n.disableCorrelationHeaders))) {
      if (n && n[as])
        for (var r = 0; r < n.correlationHeaderExcludePatterns[S]; r++)
          if (n[as][r].test(e)) return;
      var i = Rs(e).host[Bc]();
      if (
        (!i ||
          (-1 === ft(i, ':443') && -1 === ft(i, ':80')) ||
          (i = (Us(e, !0) || '')[Bc]()),
        (n && n.enableCorsCorrelation) || !i || i === t)
      ) {
        var o,
          t = n && n.correlationHeaderDomains;
        if (
          !t ||
          (wn(t, function (n) {
            n = RegExp(
              n
                .toLowerCase()
                .replace(/\\/g, '\\\\')
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*')
            );
            o = o || n.test(i);
          }),
          o)
        ) {
          var a = n && n.correlationHeaderExcludedDomains;
          if (!a || 0 === a[S]) return 1;
          for (r = 0; r < a[S]; r++)
            if (
              RegExp(
                a[r]
                  .toLowerCase()
                  .replace(/\\/g, '\\\\')
                  .replace(/\./g, '\\.')
                  .replace(/\*/g, '.*')
              ).test(i)
            )
              return;
          return i && 0 < i[S];
        }
      }
    }
  }
  function Vs(n) {
    if (n) {
      n = (function (n, e) {
        if (n)
          for (var t = n[jc](','), r = 0; r < t[S]; ++r) {
            var i = t[r][jc]('=');
            if (2 === i[S] && i[0] === e) return i[1];
          }
      })(n, kn[1]);
      if (n && n !== qs) return n;
    }
  }
  function zs() {
    var n = ot();
    if (n && n.now && n.timing) {
      n = n.now() + n.timing.navigationStart;
      if (0 < n) return n;
    }
    return He();
  }
  function Hs(n, e) {
    return 0 === n || 0 === e || gn(n) || gn(e) ? null : e - n;
  }
  function js(n, e) {
    var t = n || {};
    return {
      getName: function () {
        return t[Gc];
      },
      setName: function (n) {
        e && e.setName(n), (t[Gc] = n);
      },
      getTraceId: function () {
        return t.traceID;
      },
      setTraceId: function (n) {
        e && e.setTraceId(n), mu(n) && (t.traceID = n);
      },
      getSpanId: function () {
        return t.parentID;
      },
      setSpanId: function (n) {
        e && e.setSpanId(n), yu(n) && (t.parentID = n);
      },
      getTraceFlags: function () {
        return t.traceFlags;
      },
      setTraceFlags: function (n) {
        e && e.setTraceFlags(n), (t.traceFlags = n);
      },
    };
  }
  var Bs = e({ LocalStorage: 0, SessionStorage: 1 }),
    _ = e({ AI: 0, AI_AND_W3C: 1, W3C: 2 }),
    Ks = undefined,
    Xs = undefined,
    Ws = '';
  function Js() {
    return Qs() ? Gs(Bs.LocalStorage) : null;
  }
  function Gs(n) {
    try {
      if (gn(me())) return null;
      var e = new Date()[Xc](),
        t = xn(n === Bs.LocalStorage ? 'localStorage' : 'sessionStorage'),
        r = Ws + e,
        i = (t.setItem(r, e), t.getItem(r) !== e);
      if ((t[Jc](r), !i)) return t;
    } catch (o) {}
    return null;
  }
  function $s() {
    return tf() ? Gs(Bs.SessionStorage) : null;
  }
  function Ys(n) {
    Ws = n || '';
  }
  function Qs(n) {
    return (Ks = n || Ks === undefined ? !!Gs(Bs.LocalStorage) : Ks);
  }
  function Zs(n, e) {
    var t = Js();
    if (null !== t)
      try {
        return t.getItem(e);
      } catch (r) {
        (Ks = !1),
          Sn(n, 2, 1, 'Browser failed read of local storage. ' + Cn(r), {
            exception: mn(r),
          });
      }
    return null;
  }
  function nf(n, e, t) {
    var r = Js();
    if (null !== r)
      try {
        return r.setItem(e, t);
      } catch (i) {
        (Ks = !1),
          Sn(n, 2, 3, 'Browser failed write to local storage. ' + Cn(i), {
            exception: mn(i),
          });
      }
  }
  function ef(n, e) {
    var t = Js();
    if (null !== t)
      try {
        t[Jc](e);
      } catch (r) {
        (Ks = !1),
          Sn(
            n,
            2,
            5,
            'Browser failed removal of local storage item. ' + Cn(r),
            { exception: mn(r) }
          );
      }
  }
  function tf(n) {
    return (Xs = n || Xs === undefined ? !!Gs(Bs.SessionStorage) : Xs);
  }
  function rf(n, e) {
    var t = $s();
    if (null !== t)
      try {
        return t.getItem(e);
      } catch (r) {
        (Xs = !1),
          Sn(n, 2, 2, 'Browser failed read of session storage. ' + Cn(r), {
            exception: mn(r),
          });
      }
    return null;
  }
  function of(n, e, t) {
    var r = $s();
    if (null !== r)
      try {
        return r.setItem(e, t), !0;
      } catch (i) {
        (Xs = !1),
          Sn(n, 2, 4, 'Browser failed write to session storage. ' + Cn(i), {
            exception: mn(i),
          });
      }
    return !1;
  }
  function af(n, e) {
    var t = $s();
    if (null !== t)
      try {
        t[Jc](e);
      } catch (r) {
        (Xs = !1),
          Sn(
            n,
            2,
            6,
            'Browser failed removal of session storage item. ' + Cn(r),
            { exception: mn(r) }
          );
      }
  }
  var uf = function (n, e) {
      var v,
        p,
        d,
        i,
        g,
        o,
        a,
        t = this,
        h = !1,
        m = !1;
      function u(n, e, t, r) {
        if (h) {
          if (
            !(function (n) {
              try {
                var e = y(n);
                return _o(1e6) <= e.limit.samplingRate;
              } catch (t) {}
            })(n)
          )
            return;
          var i = y(n),
            o = I(n),
            a = x(i, v, o),
            u = !1,
            c = 0,
            s = C(n);
          try {
            a && !s
              ? ((c = Math.min(i.limit.maxSendNumber, o[Yc] + 1)),
                (u = !(o[Yc] = 0)),
                (g[n] = !0),
                (o[Qc] = new Date()))
              : ((g[n] = a), (o[Yc] += 1));
            var f = w(n);
            b(p, f, o);
            for (var l = 0; l < c; l++) Sn(p, t || 1, n, e);
          } catch (d) {}
          return { isThrottled: u, throttleNum: c };
        }
        return r && T(n)[Wc]({ msgID: n, message: e, severity: t }), null;
      }
      function y(n) {
        return d[n] || d[109];
      }
      function r(n, e) {
        var t, r, i, o, a;
        try {
          var u = e || {},
            c = {},
            s = ((c[Zc] = !!u[Zc]), u[ns] || {}),
            f =
              ((m =
                (null === s ? void 0 : s.daysOfMonth) &&
                0 < (null === s ? void 0 : s.daysOfMonth[S])),
              (c[ns] =
                ((o = null == (i = s || {}) ? void 0 : i.monthInterval),
                (a = null == i ? void 0 : i.dayInterval),
                gn(o) &&
                  gn(a) &&
                  ((i.monthInterval = 3), m || ((i[es] = [28]), (m = !0))),
                {
                  monthInterval: null == i ? void 0 : i.monthInterval,
                  dayInterval: null == i ? void 0 : i.dayInterval,
                  daysOfMonth: null == i ? void 0 : i.daysOfMonth,
                })),
              {
                samplingRate:
                  (null == (t = u.limit) ? void 0 : t.samplingRate) || 100,
                maxSendNumber:
                  (null == (r = u.limit) ? void 0 : r.maxSendNumber) || 1,
              });
          (c.limit = f), (d[n] = c);
        } catch (l) {}
      }
      function x(n, e, t) {
        var r, i;
        return (
          !(!n || n[Zc] || !e || !Oi(t)) &&
          ((e = c()),
          (t = t[ts]),
          (r = 1),
          null != (n = n[ns]) &&
            n.monthInterval &&
            ((i =
              12 * (e.getUTCFullYear() - t.getUTCFullYear()) +
              e.getUTCMonth() -
              t.getUTCMonth()),
            (r = s(n.monthInterval, 0, i))),
          (i = 1),
          m
            ? (i = Ae(n[es], e[rs]()))
            : null != n &&
              n.dayInterval &&
              ((e = Math.floor((e.getTime() - t.getTime()) / 864e5)),
              (i = s(n.dayInterval, 0, e))),
          0 <= r && 0 <= i)
        );
      }
      function w(n, e) {
        e = Oi(e) ? e : '';
        return n ? 'appInsightsThrottle' + e + '-' + n : null;
      }
      function c(n) {
        try {
          if (!n) return new Date();
          var e = new Date(n);
          if (!isNaN(e.getDate())) return e;
        } catch (t) {}
        return null;
      }
      function b(n, e, t) {
        try {
          nf(n, e, Je(JSON[is](t)));
        } catch (r) {}
      }
      function s(n, e, t) {
        return n <= 0
          ? 1
          : e <= t && (t - e) % n == 0
            ? 1 + Math.floor((t - e) / n)
            : -1;
      }
      function I(n) {
        try {
          var e, t;
          return (
            i[n] ||
              ((e = w(n, o)),
              (t = (function (n, e, t) {
                try {
                  var r,
                    i = { date: c(), count: 0 };
                  return n
                    ? {
                        date: c((r = JSON.parse(n))[ts]) || i[ts],
                        count: r[Yc] || i[Yc],
                        preTriggerDate: r.preTriggerDate ? c(r[Qc]) : undefined,
                      }
                    : (b(e, t, i), i);
                } catch (o) {}
                return null;
              })(Zs(p, e), p, e)),
              (i[n] = t)),
            i[n]
          );
        } catch (r) {}
        return null;
      }
      function C(n) {
        var e,
          t = g[n];
        return (
          gn(t) &&
            ((t = !1),
            (e = I(n)) &&
              (t = (function (n) {
                try {
                  var e;
                  if (n)
                    return (
                      (e = new Date()),
                      n.getUTCFullYear() == e.getUTCFullYear() &&
                        n.getUTCMonth() == e.getUTCMonth() &&
                        n[rs]() === e[rs]()
                    );
                } catch (t) {}
                return !1;
              })(e[Qc])),
            (g[n] = t)),
          g[n]
        );
      }
      function T(n) {
        return gn((a = a || {})[n]) && (a[n] = []), a[n];
      }
      (p = ya(n)),
        (g = {}),
        (i = {}),
        (a = {}),
        (d = {}),
        r(109),
        (o = Oi(e) ? e : ''),
        n.addUnloadHook(
          Tn(n.config, function (n) {
            n = n.cfg;
            (v = Qs()),
              B(n.throttleMgrCfg || {}, function (n, e) {
                r(parseInt(n), e);
              });
          })
        ),
        (t._getDbgPlgTargets = function () {
          return [a];
        }),
        (t.getConfig = function () {
          return d;
        }),
        (t.canThrottle = function (n) {
          var e = I(n);
          return x(y(n), v, e);
        }),
        (t.isTriggered = C),
        (t.isReady = function () {
          return h;
        }),
        (t.flush = function (n) {
          try {
            var e,
              t = T(n);
            if (t && 0 < t[S])
              return (
                (e = t.slice(0)),
                (a[n] = []),
                wn(e, function (n) {
                  u(n.msgID, n[$c], n.severity, !1);
                }),
                !0
              );
          } catch (r) {}
          return !1;
        }),
        (t.flushAll = function () {
          try {
            var e;
            if (a)
              return (
                (e = !0),
                B(a, function (n) {
                  n = t.flush(parseInt(n));
                  e = e && n;
                }),
                e
              );
          } catch (n) {}
          return !1;
        }),
        (t.onReadyState = function (n, e) {
          return (
            void 0 === e && (e = !0),
            (h = !!gn(n) || n) && e ? t.flushAll() : null
          );
        }),
        (t.sendMessage = function (n, e, t) {
          return u(n, e, t, !0);
        });
    },
    cf = function (n, e, t) {
      var r = this,
        i = this;
      (i.ver = 1),
        (i.sampleRate = 100),
        (i.tags = {}),
        (i[Gc] = L(n, t) || zc),
        (i.data = e),
        (i.time = zi(new Date())),
        (i.aiDataContract = {
          time: 1,
          iKey: 1,
          name: 1,
          sampleRate: function () {
            return 100 === r.sampleRate ? 4 : 1;
          },
          tags: 1,
          data: 1,
        });
    },
    sf =
      ((ff.envelopeType = 'Microsoft.ApplicationInsights.{0}.Event'),
      (ff.dataType = 'EventData'),
      ff);
  function ff(n, e, t, r) {
    (this.aiDataContract = { ver: 1, name: 1, properties: 0, measurements: 0 }),
      (this.ver = 2),
      (this[Gc] = L(n, e) || zc),
      (this[ss] = Ds(n, t)),
      (this[fs] = Es(n, r));
  }
  var lf = 'error',
    df = 'stack',
    vf = 'stackDetails',
    pf = 'errorSrc',
    gf = 'message',
    hf = 'description';
  function mf(n, e) {
    var t = n;
    return (
      t &&
        !G(t) &&
        (JSON && JSON[is]
          ? ((t = JSON[is](n)),
            !e || (t && '{}' !== t) || (t = $(n[Xc]) ? n[Xc]() : '' + n))
          : (t = n + ' - (Missing JSON.stringify)')),
      t || ''
    );
  }
  function yf(n, e) {
    var t = n;
    return (
      n &&
        ((t = (t && !G(t) && (n[gf] || n[hf])) || t) &&
          !G(t) &&
          (t = mf(t, !0)),
        n.filename &&
          (t =
            t +
            ' @' +
            (n.filename || '') +
            ':' +
            (n.lineno || '?') +
            ':' +
            (n.colno || '?'))),
      (e &&
      'String' !== e &&
      'Object' !== e &&
      'Error' !== e &&
      -1 === ft(t || '', e)
        ? e + ': ' + t
        : t) || ''
    );
  }
  function xf(n) {
    return n && n.src && G(n.src) && n.obj && hn(n.obj);
  }
  function wf(n) {
    var n = n || '',
      e = (n = G(n) ? n : G(n[df]) ? n[df] : '' + n)[jc]('\n');
    return { src: n, obj: e };
  }
  function bf(n) {
    var e,
      t = null;
    if (n)
      try {
        n[df]
          ? (t = wf(n[df]))
          : n[lf] && n[lf][df]
            ? (t = wf(n[lf][df]))
            : n.exception && n.exception[df]
              ? (t = wf(n.exception[df]))
              : xf(n)
                ? (t = n)
                : xf(n[vf])
                  ? (t = n[vf])
                  : xe() && xe().opera && n[gf]
                    ? (t = (function (n) {
                        for (
                          var e = [], t = n[jc]('\n'), r = 0;
                          r < t[S];
                          r++
                        ) {
                          var i = t[r];
                          t[r + 1] && ((i += '@' + t[r + 1]), r++), e[Wc](i);
                        }
                        return { src: n, obj: e };
                      })(n[$c]))
                    : n.reason && n.reason[df]
                      ? (t = wf(n.reason[df]))
                      : G(n)
                        ? (t = wf(n))
                        : ((e = n[gf] || n[hf] || ''),
                          G(n[pf]) &&
                            (e && (e += '\n'), (e += ' from ' + n[pf])),
                          e && (t = wf(e)));
      } catch (r) {
        t = wf(r);
      }
    return t || { src: '', obj: null };
  }
  function If(n) {
    var e = '';
    if (n && !(e = n.typeName || n[Gc] || ''))
      try {
        var t = /function (.{1,200})\(/.exec(n.constructor[Xc]()),
          e = t && 1 < t[S] ? t[1] : '';
      } catch (r) {}
    return e;
  }
  function Cf(n) {
    if (n)
      try {
        var e, t;
        if (!G(n))
          return (
            (e = If(n)),
            ((t = mf(n, !1)) && '{}' !== t) ||
              (n[lf] && (e = If((n = n[lf]))), (t = mf(n, !0))),
            0 !== ft(t, e) && 'String' !== e ? e + ':' + t : t
          );
      } catch (r) {}
    return '' + (n || '');
  }
  (Sf.CreateAutoException = function (n, e, t, r, i, o, a, u) {
    var c = If(i || o || n),
      s = {};
    return (
      (s[$c] = yf(n, c)),
      (s.url = e),
      (s.lineNumber = t),
      (s.columnNumber = r),
      (s.error = Cf(i || o || n)),
      (s.evt = Cf(o || n)),
      (s[ds] = c),
      (s.stackDetails = bf(a || i || o)),
      (s.errorSrc = u),
      s
    );
  }),
    (Sf.CreateFromInterface = function (e, n, t, r) {
      var i =
        n[us] &&
        Re(n[us], function (n) {
          return kf[hs](e, n);
        });
      return new Sf(e, Tr(Tr({}, n), { exceptions: i }), t, r);
    }),
    (Sf.prototype.toInterface = function () {
      var n = this,
        e = n.exceptions,
        t = n.properties,
        r = n.measurements,
        i = n.severityLevel,
        o = n.problemGroup,
        a = n.id,
        n = n.isManual,
        e =
          (e instanceof Array &&
            Re(e, function (n) {
              return n.toInterface();
            })) ||
          undefined,
        u = { ver: '4.0' };
      return (
        (u[us] = e),
        (u.severityLevel = i),
        (u.properties = t),
        (u.measurements = r),
        (u.problemGroup = o),
        (u.id = a),
        (u.isManual = n),
        u
      );
    }),
    (Sf.CreateSimpleException = function (n, e, t, r, i, o) {
      var a;
      return {
        exceptions: [
          (((a = {})[xs] = !0),
          (a.message = n),
          (a.stack = i),
          (a.typeName = e),
          a),
        ],
      };
    }),
    (Sf.envelopeType = 'Microsoft.ApplicationInsights.{0}.Exception'),
    (Sf.dataType = 'ExceptionData'),
    (Sf.formatError = Cf);
  var Tf = Sf;
  function Sf(n, e, t, r, i, o) {
    this.aiDataContract = {
      ver: 1,
      exceptions: 1,
      severityLevel: 0,
      properties: 0,
      measurements: 0,
    };
    var a = this;
    (a.ver = 2),
      (function (n) {
        try {
          if (Dn(n))
            return 'ver' in n && 'exceptions' in n && 'properties' in n;
        } catch (e) {}
      })(e)
        ? ((a[us] = e[us] || []),
          (a[ss] = e[ss]),
          (a[fs] = e[fs]),
          e[vs] && (a[vs] = e[vs]),
          e.id && ((a.id = e.id), (e[ss].id = e.id)),
          e[ps] && (a[ps] = e[ps]),
          gn(e[gs]) || (a[gs] = e[gs]))
        : ((t = t || {}),
          o && (t.id = o),
          (a[us] = [new kf(n, e, t)]),
          (a[ss] = Ds(n, t)),
          (a[fs] = Es(n, r)),
          i && (a[vs] = i),
          o && (a.id = o));
  }
  (_f.prototype.toInterface = function () {
    var n = this,
      e =
        n[cs] instanceof Array &&
        Re(n[cs], function (n) {
          return n.toInterface();
        });
    return (
      ((n = {
        id: n.id,
        outerId: n.outerId,
        typeName: n[ds],
        message: n[$c],
        hasFullStack: n[xs],
        stack: n[df],
      })[cs] = e || undefined),
      n
    );
  }),
    (_f.CreateFromInterface = function (n, e) {
      var t =
        (e[cs] instanceof Array &&
          Re(e[cs], function (n) {
            return Df[hs](n);
          })) ||
        e[cs];
      return new _f(n, Tr(Tr({}, e), { parsedStack: t }));
    });
  var kf = _f;
  function _f(e, n, t) {
    this.aiDataContract = {
      id: 0,
      outerId: 0,
      typeName: 1,
      message: 1,
      hasFullStack: 0,
      stack: 0,
      parsedStack: 2,
    };
    var s,
      r,
      i,
      o,
      a,
      u,
      c = this;
    !(function (n) {
      try {
        if (Dn(n)) return 'hasFullStack' in n && 'typeName' in n;
      } catch (e) {}
    })(n)
      ? ((r = (a = n) && a.evt),
        en(a) || (a = a[lf] || r || a),
        (c[ds] = L(e, If(a)) || zc),
        (c[$c] = _s(e, yf(n || a, c[ds])) || zc),
        (s = n[vf] || bf(n)),
        (c[cs] = (function () {
          var n = s.obj;
          if (n && 0 < n[S]) {
            var e = [],
              t = 0,
              r = 0;
            if (
              (wn(n, function (n) {
                var n = n[Xc]();
                Df.regex.test(n) &&
                  ((n = new Df(n, t++)), (r += n[ls]), e[Wc](n));
              }),
              32768 < r)
            )
              for (var i = 0, o = e[S] - 1, a = 0, u = i, c = o; i < o; ) {
                if (32768 < (a += e[i][ls] + e[o][ls])) {
                  e.splice(u, c - u + 1);
                  break;
                }
                (u = i), (c = o), i++, o--;
              }
          }
          return e;
        })()),
        hn(c[cs]) &&
          Re(c[cs], function (n) {
            (n[ms] = L(e, n[ms])), (n[ys] = L(e, n[ys]));
          }),
        (c[df] =
          ((r = e),
          (u = ''),
          (a = s) &&
            (a.obj
              ? wn(a.obj, function (n) {
                  u += n + '\n';
                })
              : (u = a.src || '')),
          (a = u) &&
            32768 < (o = '' + a)[S] &&
            ((i = Xn(o, 0, 32768)),
            Sn(
              r,
              2,
              52,
              'exception is too long, it has been truncated to 32768 characters.',
              { exception: a },
              !0
            )),
          i || a)),
        (c.hasFullStack = hn(c.parsedStack) && 0 < c.parsedStack[S]),
        t && (t[ds] = t[ds] || c[ds]))
      : ((c[ds] = n[ds]),
        (c[$c] = n[$c]),
        (c[df] = n[df]),
        (c[cs] = n[cs] || []),
        (c[xs] = n[xs]));
  }
  (Ef.CreateFromInterface = function (n) {
    return new Ef(n, null);
  }),
    (Ef.prototype.toInterface = function () {
      var n = this;
      return {
        level: n[ws],
        method: n[bs],
        assembly: n[ms],
        fileName: n[ys],
        line: n[Is],
      };
    }),
    (Ef.regex =
      /^([\s]+at)?[\s]{0,50}([^\@\()]+?)[\s]{0,50}(\@|\()([^\(\n]+):([0-9]+):([0-9]+)(\)?)$/),
    (Ef.baseSize = 58);
  var Df = Ef;
  function Ef(n, e) {
    this.aiDataContract = {
      level: 1,
      method: 1,
      assembly: 0,
      fileName: 0,
      line: 0,
    };
    var t,
      r = this;
    (r[ls] = 0),
      'string' == typeof n
        ? ((t = n),
          (r[ws] = e),
          (r[bs] = '<no_method>'),
          (r[ms] = Je(t)),
          (r[ys] = ''),
          (r[Is] = 0),
          (e = t.match(Ef.regex)) &&
            5 <= e[S] &&
            ((r[bs] = Je(e[2]) || r[bs]),
            (r[ys] = Je(e[4])),
            (r[Is] = parseInt(e[5]) || 0)))
        : ((r[ws] = n[ws]),
          (r[bs] = n[bs]),
          (r[ms] = n[ms]),
          (r[ys] = n[ys]),
          (r[Is] = n[Is]),
          (r[ls] = 0)),
      (r.sizeInBytes += r.method[S]),
      (r.sizeInBytes += r.fileName[S]),
      (r.sizeInBytes += r.assembly[S]),
      (r[ls] += Ef.baseSize),
      (r.sizeInBytes += r.level.toString()[S]),
      (r.sizeInBytes += r.line.toString()[S]);
  }
  var Pf = function () {
      (this.aiDataContract = {
        name: 1,
        kind: 0,
        value: 1,
        count: 0,
        min: 0,
        max: 0,
        stdDev: 0,
      }),
        (this.kind = 0);
    },
    Mf =
      ((Nf.envelopeType = 'Microsoft.ApplicationInsights.{0}.Metric'),
      (Nf.dataType = 'MetricData'),
      Nf);
  function Nf(n, e, t, r, i, o, a, u, c) {
    (this.aiDataContract = { ver: 1, metrics: 1, properties: 0 }),
      (this.ver = 2);
    var s = new Pf();
    (s[Yc] = 0 < r ? r : undefined),
      (s.max = isNaN(o) || null === o ? undefined : o),
      (s.min = isNaN(i) || null === i ? undefined : i),
      (s[Gc] = L(n, e) || zc),
      (s.value = t),
      (s.stdDev = isNaN(a) || null === a ? undefined : a),
      (this.metrics = [s]),
      (this[ss] = Ds(n, u)),
      (this[fs] = Es(n, c));
  }
  var Af = '';
  function Rf(n) {
    var e =
        Af +
        (Math.floor((n = Math.round((n = isNaN(n) || n < 0 ? 0 : n))) / 1e3) %
          60),
      t = Af + (Math.floor(n / 6e4) % 60),
      r = Af + (Math.floor(n / 36e5) % 24),
      i = Math.floor(n / 864e5),
      n = 1 === (n = Af + (n % 1e3))[S] ? '00' + n : 2 === n[S] ? '0' + n : n,
      e = e[S] < 2 ? '0' + e : e,
      t = t[S] < 2 ? '0' + t : t,
      r = r[S] < 2 ? '0' + r : r;
    return (0 < i ? i + '.' : Af) + r + ':' + t + ':' + e + '.' + n;
  }
  (Lf.envelopeType = 'Microsoft.ApplicationInsights.{0}.Pageview'),
    (Lf.dataType = 'PageviewData');
  var Uf = Lf;
  function Lf(n, e, t, r, i, o, a) {
    this.aiDataContract = {
      ver: 1,
      name: 0,
      url: 0,
      duration: 0,
      properties: 0,
      measurements: 0,
      id: 0,
    };
    var u = this;
    (u.ver = 2),
      (u.id = a && Ps(n, a, 128, 69)[Xc]()),
      (u.url = ks(n, t)),
      (u[Gc] = L(n, e) || zc),
      isNaN(r) || (u[Cs] = Rf(r)),
      (u[ss] = Ds(n, i)),
      (u[fs] = Es(n, o));
  }
  (Of.envelopeType = 'Microsoft.ApplicationInsights.{0}.RemoteDependency'),
    (Of.dataType = 'RemoteDependencyData');
  var qf = Of;
  function Of(n, e, t, r, i, o, a, u, c, s, f, l) {
    void 0 === c && (c = 'Ajax'),
      (this.aiDataContract = {
        id: 1,
        ver: 1,
        name: 0,
        resultCode: 0,
        duration: 0,
        success: 0,
        data: 0,
        target: 0,
        type: 0,
        properties: 0,
        measurements: 0,
        kind: 0,
        value: 0,
        count: 0,
        min: 0,
        max: 0,
        stdDev: 0,
        dependencyKind: 0,
        dependencySource: 0,
        commandName: 0,
        dependencyTypeName: 0,
      });
    var d,
      v,
      p = this,
      t =
        ((p.ver = 2),
        (p.id = e),
        (p[Cs] = Rf(i)),
        (p.success = o),
        (p.resultCode = a + ''),
        (p.type = L(n, c)),
        (e = n),
        (i = u),
        (c = a = o = r),
        (a =
          (u = t) && 0 < u[S]
            ? ((v = (t = Rs(u)).host),
              a ||
                (null != t[os]
                  ? ('/' !=
                      ((d = 0 === t.pathname[S] ? '/' : t[os])[0] || '') &&
                      (d = '/' + d),
                    (c = t[os]),
                    L(e, i ? i + ' ' + d : d))
                  : L(e, u)))
            : (v = o)),
        { target: v, name: a, data: c });
    (p.data = ks(n, r) || t.data),
      (p.target = L(n, t.target)),
      s && (p.target = ''.concat(p.target, ' | ').concat(s)),
      (p[Gc] = L(n, t[Gc])),
      (p[ss] = Ds(n, f)),
      (p[fs] = Es(n, l));
  }
  (Vf.envelopeType = 'Microsoft.ApplicationInsights.{0}.Message'),
    (Vf.dataType = 'MessageData');
  var Ff = Vf;
  function Vf(n, e, t, r, i) {
    this.aiDataContract = {
      ver: 1,
      message: 1,
      severityLevel: 0,
      properties: 0,
    };
    var o = this;
    (o.ver = 2),
      (o[$c] = _s(n, (e = e || zc))),
      (o[ss] = Ds(n, r)),
      (o[fs] = Es(n, i)),
      t && (o[vs] = t);
  }
  (Hf.envelopeType = 'Microsoft.ApplicationInsights.{0}.PageviewPerformance'),
    (Hf.dataType = 'PageviewPerformanceData');
  var zf = Hf;
  function Hf(n, e, t, r, i, o, a) {
    this.aiDataContract = {
      ver: 1,
      name: 0,
      url: 0,
      duration: 0,
      perfTotal: 0,
      networkConnect: 0,
      sentRequest: 0,
      receivedResponse: 0,
      domProcessing: 0,
      properties: 0,
      measurements: 0,
    };
    var u = this;
    (u.ver = 2),
      (u.url = ks(n, t)),
      (u[Gc] = L(n, e) || zc),
      (u[ss] = Ds(n, i)),
      (u[fs] = Es(n, o)),
      a &&
        ((u.domProcessing = a.domProcessing),
        (u[Cs] = a[Cs]),
        (u.networkConnect = a.networkConnect),
        (u.perfTotal = a.perfTotal),
        (u[Ts] = a[Ts]),
        (u.sentRequest = a.sentRequest));
  }
  var jf = function (n, e) {
      (this.aiDataContract = { baseType: 1, baseData: 1 }),
        (this.baseType = n),
        (this.baseData = e);
    },
    U = e({ Verbose: 0, Information: 1, Warning: 2, Error: 3, Critical: 4 });
  function Bf(n) {
    var e = 'ai.' + n + '.';
    return function (n) {
      return e + n;
    };
  }
  var Kf,
    Xf,
    r = Bf('application'),
    t = Bf('device'),
    e = Bf('location'),
    o = Bf('operation'),
    a = Bf('session'),
    u = Bf('user'),
    Wf = Bf('cloud'),
    Jf = Bf('internal'),
    Gf =
      ((Xf = {
        applicationVersion: r('ver'),
        applicationBuild: r('build'),
        applicationTypeId: r('typeId'),
        applicationId: r('applicationId'),
        applicationLayer: r('layer'),
        deviceId: t('id'),
        deviceIp: t('ip'),
        deviceLanguage: t('language'),
        deviceLocale: t('locale'),
        deviceModel: t('model'),
        deviceFriendlyName: t('friendlyName'),
        deviceNetwork: t('network'),
        deviceNetworkName: t('networkName'),
        deviceOEMName: t('oemName'),
        deviceOS: t('os'),
        deviceOSVersion: t('osVersion'),
        deviceRoleInstance: t('roleInstance'),
        deviceRoleName: t('roleName'),
        deviceScreenResolution: t('screenResolution'),
        deviceType: t('type'),
        deviceMachineName: t('machineName'),
        deviceVMName: t('vmName'),
        deviceBrowser: t('browser'),
        deviceBrowserVersion: t('browserVersion'),
        locationIp: e('ip'),
        locationCountry: e('country'),
        locationProvince: e('province'),
        locationCity: e('city'),
        operationId: o('id'),
        operationName: o('name'),
        operationParentId: o('parentId'),
        operationRootId: o('rootId'),
        operationSyntheticSource: o('syntheticSource'),
        operationCorrelationVector: o('correlationVector'),
        sessionId: a('id'),
        sessionIsFirst: a('isFirst'),
        sessionIsNew: a('isNew'),
        userAccountAcquisitionDate: u('accountAcquisitionDate'),
        userAccountId: u('accountId'),
        userAgent: u('userAgent'),
        userId: u('id'),
        userStoreRegion: u('storeRegion'),
        userAuthUserId: u('authUserId'),
        userAnonymousUserAcquisitionDate: u('anonUserAcquisitionDate'),
        userAuthenticatedUserAcquisitionDate: u('authUserAcquisitionDate'),
        cloudName: Wf('name'),
        cloudRole: Wf('role'),
        cloudRoleVer: Wf('roleVer'),
        cloudRoleInstance: Wf('roleInstance'),
        cloudEnvironment: Wf('environment'),
        cloudLocation: Wf('location'),
        cloudDeploymentUnit: Wf('deploymentUnit'),
        internalNodeName: Jf('nodeName'),
        internalSdkVersion: Jf('sdkVersion'),
        internalAgentVersion: Jf('agentVersion'),
        internalSnippet: Jf('snippet'),
        internalSdkSrc: Jf('sdkSrc'),
      }),
      kr(
        $f,
        (Kf = function () {
          var t = this;
          B(Xf, function (n, e) {
            t[n] = e;
          });
        })
      ),
      $f);
  function $f() {
    return Kf.call(this) || this;
  }
  function Yf(n, e, t, r, i, o) {
    (t = L(r, t) || zc),
      (gn(n) || gn(e) || gn(t)) &&
        cn("Input doesn't contain all required fields");
    var a,
      r = '',
      u =
        (n[Hc] && ((r = n[Hc]), delete n[Hc]),
        ((a = {})[Gc] = t),
        (a.time = zi(new Date())),
        (a.iKey = r),
        (a.ext = o || {}),
        (a.tags = []),
        (a.data = {}),
        (a.baseType = e),
        (a.baseData = n),
        a);
    return (
      gn(i) ||
        B(i, function (n, e) {
          u.data[n] = e;
        }),
      u
    );
  }
  var l = new Gf();
  function Qf(n) {
    var e,
      t = null;
    return (
      $(Event)
        ? (t = new Event(n))
        : (e = ye()) &&
          e.createEvent &&
          (t = e.createEvent('Event')).initEvent(n, !0, !0),
      t
    );
  }
  function Zf(n, e) {
    xc(n, null, null, e);
  }
  var nl = 'AppInsightsPropertiesPlugin',
    el = 'AppInsightsChannelPlugin',
    tl = 'ApplicationInsightsAnalytics',
    rl = 'toString',
    il = 'isStorageUseDisabled',
    ol = '_addHook',
    al = 'core',
    ul = 'dataType',
    cl = 'envelopeType',
    sl = 'diagLog',
    fl = 'track',
    ll = 'trackPageView',
    dl = 'trackPreviousPageVisit',
    vl = 'sendPageViewInternal',
    pl = 'startTime',
    gl = 'properties',
    hl = 'duration',
    ml = 'sendPageViewPerformanceInternal',
    yl = 'populatePageViewPerformanceEvent',
    xl = 'href',
    wl = 'sendExceptionInternal',
    bl = 'exception',
    Il = 'error',
    Cl = '_onerror',
    Tl = 'errorSrc',
    Sl = 'lineNumber',
    kl = 'columnNumber',
    _l = 'message',
    Dl = 'CreateAutoException',
    El = 'addTelemetryInitializer',
    Pl = 'autoTrackPageVisitTime',
    Ml = 'isBrowserLinkTrackingEnabled',
    Nl = 'length',
    Al = 'enableAutoRouteTracking',
    Rl = 'enableUnhandledPromiseRejectionTracking',
    Ul = 'autoUnhandledPromiseInstrumented',
    Ll = 'getEntriesByType',
    ql = 'isPerformanceTimingSupported',
    Ol = 'getPerformanceTiming',
    Fl = 'navigationStart',
    Vl = 'shouldCollectDuration',
    zl = 'isPerformanceTimingDataReady',
    Hl = 'responseStart',
    jl = 'requestStart',
    Bl = 'loadEventEnd',
    Kl = 'responseEnd',
    Xl = 'connectEnd',
    Wl = 'pageVisitStartTime',
    Jl = ((Gl.__ieDyn = 1), Gl);
  function Gl(g, h, e, m) {
    In(Gl, this, function (n) {
      var f,
        r = null,
        i = [],
        l = !1,
        d = !1;
      function v(n) {
        e && e.flush(n, function () {});
      }
      function p(n) {
        i.push(n),
          (function t() {
            r =
              r ||
              gt(function () {
                r = null;
                var n = i.slice(0),
                  e = !1;
                (i = []),
                  wn(n, function (n) {
                    n() ? (e = !0) : i.push(n);
                  }),
                  0 < i[Nl] && t(),
                  e && v(!0);
              }, 100);
          })();
      }
      e && (f = e.logger),
        (n[ll] = function (r, i) {
          var n,
            e,
            o = r.name,
            a =
              ((!gn(o) && 'string' == typeof o) ||
                ((e = ye()), (o = r.name = (e && e.title) || '')),
              r.uri);
          if (
            ((!gn(a) && 'string' == typeof a) ||
              ((e = so()), (a = r.uri = (e && e[xl]) || '')),
            d ||
              ((n = (e = ot()) && e[Ll] && e[Ll]('navigation')) &&
              n[0] &&
              !pn(e.timeOrigin)
                ? ((n = n[0].loadEventStart),
                  (r[pl] = new Date(e.timeOrigin + n)))
                : ((e = (i || r[gl] || {})[hl] || 0),
                  (r[pl] = new Date(new Date().getTime() - e))),
              (d = !0)),
            !m[ql]())
          )
            return (
              g[vl](r, i),
              v(!0),
              void (
                Ie() ||
                Sn(
                  f,
                  2,
                  25,
                  'trackPageView: navigation timing API used for calculation of page duration is not supported in this browser. This page view will be collected without duration and timing info.'
                )
              )
            );
          var u,
            t,
            c = !1,
            s = m[Ol]()[Fl];
          0 < s && ((u = Hs(s, +new Date())), m[Vl](u) || (u = undefined)),
            gn(i) || gn(i[hl]) || (t = i[hl]),
            (!h && isNaN(t)) ||
              (isNaN(t) && ((i = i || {})[hl] = u),
              g[vl](r, i),
              v(!0),
              (c = !0)),
            (i = i || {}),
            p(function () {
              var n,
                e = !1;
              try {
                m[zl]()
                  ? ((e = !0),
                    (n = { name: o, uri: a }),
                    m[yl](n),
                    n.isValid || c
                      ? (c || ((i[hl] = n.durationMs), g[vl](r, i)),
                        l || (g[ml](n, i), (l = !0)))
                      : ((i[hl] = u), g[vl](r, i)))
                  : 0 < s &&
                    6e4 < Hs(s, +new Date()) &&
                    ((e = !0), c || ((i[hl] = 6e4), g[vl](r, i)));
              } catch (t) {
                Sn(
                  f,
                  1,
                  38,
                  'trackPageView failed on page load calculation: ' + Cn(t),
                  { exception: mn(t) }
                );
              }
              return e;
            });
        }),
        (n.teardown = function (n, e) {
          var t;
          r &&
            (r.cancel(),
            (r = null),
            (t = i.slice(0)),
            (i = []),
            wn(t, function (n) {
              n();
            }));
        });
    });
  }
  var $l = 36e5,
    Yl = ['googlebot', 'adsbot-google', 'apis-google', 'mediapartners-google'];
  function Ql() {
    var n = ot();
    return n && !!n.timing;
  }
  function Zl() {
    var n = ot(),
      n = n ? n.timing : 0;
    return (
      n &&
      0 < n.domainLookupStart &&
      0 < n[Fl] &&
      0 < n[Hl] &&
      0 < n[jl] &&
      0 < n[Bl] &&
      0 < n[Kl] &&
      0 < n[Xl] &&
      0 < n.domLoading
    );
  }
  function nd() {
    return Ql() ? ot().timing : null;
  }
  function ed() {
    for (var n = [], e = 0; e < arguments.length; e++) n[e] = arguments[e];
    var t = (we() || {}).userAgent,
      r = !1;
    if (t)
      for (var i = 0; i < Yl[Nl]; i++)
        r = r || -1 !== ft(t.toLowerCase(), Yl[i]);
    if (r) return !1;
    for (i = 0; i < n[Nl]; i++) if (n[i] < 0 || n[i] >= $l) return !1;
    return !0;
  }
  rd.__ieDyn = 1;
  var td = rd;
  function rd(n) {
    var c = ya(n);
    In(rd, this, function (u) {
      (u[yl] = function (n) {
        n.isValid = !1;
        var e =
            (e = ot()) &&
            e.getEntriesByType &&
            0 < e.getEntriesByType('navigation')[Nl]
              ? ot()[Ll]('navigation')[0]
              : null,
          t = nd(),
          r = 0,
          i = 0,
          o = 0,
          a = 0;
        (e || t) &&
          ((e = e
            ? ((r = e[hl]),
              (i = 0 === e[pl] ? e[Xl] : Hs(e[pl], e[Xl])),
              (o = Hs(e.requestStart, e[Hl])),
              (a = Hs(e[Hl], e[Kl])),
              Hs(e.responseEnd, e[Bl]))
            : ((r = Hs(t[Fl], t[Bl])),
              (i = Hs(t[Fl], t[Xl])),
              (o = Hs(t.requestStart, t[Hl])),
              (a = Hs(t[Hl], t[Kl])),
              Hs(t.responseEnd, t[Bl]))),
          0 === r
            ? Sn(c, 2, 10, 'error calculating page view performance.', {
                total: r,
                network: i,
                request: o,
                response: a,
                dom: e,
              })
            : u[Vl](r, i, o, a, e)
              ? r <
                Math.floor(i) + Math.floor(o) + Math.floor(a) + Math.floor(e)
                ? Sn(c, 2, 8, 'client performance math error.', {
                    total: r,
                    network: i,
                    request: o,
                    response: a,
                    dom: e,
                  })
                : ((n.durationMs = r),
                  (n.perfTotal = n[hl] = Rf(r)),
                  (n.networkConnect = Rf(i)),
                  (n.sentRequest = Rf(o)),
                  (n.receivedResponse = Rf(a)),
                  (n.domProcessing = Rf(e)),
                  (n.isValid = !0))
              : Sn(
                  c,
                  2,
                  45,
                  "Invalid page load duration value. Browser perf data won't be sent.",
                  { total: r, network: i, request: o, response: a, dom: e }
                ));
      }),
        (u[Ol] = nd),
        (u[ql] = Ql),
        (u[zl] = Zl),
        (u[Vl] = ed);
    });
  }
  od.__ieDyn = 1;
  var id = od;
  function od(a, u) {
    var c = 'prevPageVisitData';
    In(od, this, function (n) {
      function i(n, e) {
        var t = null;
        try {
          var r,
            t = o();
          tf() &&
            (null != rf(a, c) &&
              cn(
                'Cannot call startPageVisit consecutively without first calling stopPageVisit'
              ),
            (r = lo().stringify(new ad(n, e))),
            of(a, c, r));
        } catch (i) {
          Ia(a, 'Call to restart failed: ' + mn(i)), (t = null);
        }
        return t;
      }
      function o() {
        var n,
          e,
          t = null;
        try {
          tf() &&
            ((n = He()),
            (e = rf(a, c)) &&
              fo() &&
              (((t = lo().parse(e)).pageVisitTime = n - t[Wl]), af(a, c)));
        } catch (r) {
          Ia(a, 'Stop page visit timer failed: ' + mn(r)), (t = null);
        }
        return t;
      }
      (n[dl] = function (n, e) {
        try {
          var t = i(n, e);
          t && u(t.pageName, t.pageUrl, t.pageVisitTime);
        } catch (r) {
          Ia(
            a,
            'Auto track page visit time failed, metric will not be collected: ' +
              mn(r)
          );
        }
      }),
        yn(n, '_logger', {
          g: function () {
            return a;
          },
        }),
        yn(n, 'pageVisitTimeTrackingHandler', {
          g: function () {
            return u;
          },
        });
    });
  }
  var ad = function (n, e) {
      (this[Wl] = He()), (this.pageName = n), (this.pageUrl = e);
    },
    ud = function (o, n) {
      var a = this,
        u = {};
      (a.start = function (n) {
        'undefined' != typeof u[n] &&
          Sn(
            o,
            2,
            62,
            'start was called more than once for this event without calling stop.',
            { name: n, key: n },
            !0
          ),
          (u[n] = +new Date());
      }),
        (a.stop = function (n, e, t, r) {
          var i = u[n];
          isNaN(i)
            ? Sn(
                o,
                2,
                63,
                'stop was called without a corresponding start.',
                { name: n, key: n },
                !0
              )
            : ((i = Hs(i, +new Date())), a.action(n, e, i, t, r)),
            delete u[n],
            (u[n] = undefined);
        });
    };
  function cd(n, e) {
    n && n.dispatchEvent && e && n.dispatchEvent(e);
  }
  var sd = dn(
    (((r = {
      sessionRenewalMs: oa(fd, 18e5),
      sessionExpirationMs: oa(fd, 864e5),
      disableExceptionTracking: i(),
    })[Pl] = i()),
    (r.overridePageViewDuration = i()),
    (r[Rl] = i()),
    (r[Ul] = !1),
    (r.samplingPercentage = aa(function (n) {
      return !isNaN(n) && 0 < n && n <= 100;
    }, 100)),
    (r[il] = i()),
    (r[Ml] = i()),
    (r[Al] = i()),
    (r.namePrefix = { isVal: G, v: Ln(W) }),
    (r.enableDebug = i()),
    (r.disableFlushOnBeforeUnload = i()),
    (r.disableFlushOnUnload = i(!1, 'disableFlushOnBeforeUnload')),
    r)
  );
  function fd(n, e) {
    return +((n = n || e) < 6e4 ? 6e4 : n);
  }
  kr(vd, (ld = s)), (vd.Version = '3.1.0');
  var ld,
    dd = vd;
  function vd() {
    var m,
      y,
      x,
      w,
      b,
      I,
      C,
      T,
      S,
      k,
      _,
      D,
      E,
      P,
      M,
      N,
      A,
      R,
      U,
      n = ld.call(this) || this;
    return (
      (n.identifier = tl),
      (n.priority = 180),
      (n.autoRoutePVDelay = 500),
      In(vd, n, function (p, g) {
        var h = g[ol];
        function d(n, e, t, r, i) {
          p[sl]().throwInternal(n, e, t, r, i);
        }
        function t() {
          I = b = w = x = y = m = null;
          var n = so(!(N = P = E = D = _ = k = S = T = C = !1));
          (A = (n && n[xl]) || ''),
            (M = U = R = null),
            yn(p, 'config', {
              g: function () {
                return M;
              },
            });
        }
        t(),
          (p.getCookieMgr = function () {
            return za(p[al]);
          }),
          (p.processTelemetry = function (n, e) {
            p.processNext(n, e);
          }),
          (p.trackEvent = function (n, e) {
            try {
              var t = Yf(n, sf[ul], sf[cl], p[sl](), e);
              p[al][fl](t);
            } catch (r) {
              d(
                2,
                39,
                'trackTrace failed, trace will not be collected: ' + Cn(r),
                { exception: mn(r) }
              );
            }
          }),
          (p.startTrackEvent = function (n) {
            try {
              m.start(n);
            } catch (e) {
              d(
                1,
                29,
                'startTrackEvent failed, event will not be collected: ' + Cn(e),
                { exception: mn(e) }
              );
            }
          }),
          (p.stopTrackEvent = function (n, e, t) {
            try {
              m.stop(n, undefined, e, t);
            } catch (r) {
              d(
                1,
                30,
                'stopTrackEvent failed, event will not be collected: ' + Cn(r),
                { exception: mn(r) }
              );
            }
          }),
          (p.trackTrace = function (n, e) {
            try {
              var t = Yf(n, Ff[ul], Ff[cl], p[sl](), e);
              p[al][fl](t);
            } catch (r) {
              d(
                2,
                39,
                'trackTrace failed, trace will not be collected: ' + Cn(r),
                { exception: mn(r) }
              );
            }
          }),
          (p.trackMetric = function (n, e) {
            try {
              var t = Yf(n, Mf[ul], Mf[cl], p[sl](), e);
              p[al][fl](t);
            } catch (r) {
              d(
                1,
                36,
                'trackMetric failed, metric will not be collected: ' + Cn(r),
                { exception: mn(r) }
              );
            }
          }),
          (p[ll] = function (n, e) {
            try {
              var t = n || {};
              x[ll](t, Tr(Tr(Tr({}, t.properties), t.measurements), e)),
                N && b[dl](t.name, t.uri);
            } catch (r) {
              d(
                1,
                37,
                'trackPageView failed, page view will not be collected: ' +
                  Cn(r),
                { exception: mn(r) }
              );
            }
          }),
          (p[vl] = function (n, e, t) {
            var r = ye(),
              r =
                (r &&
                  (n.refUri = n.refUri === undefined ? r.referrer : n.refUri),
                gn(n[pl]) &&
                  ((r = (e || n[gl] || {})[hl] || 0),
                  (n[pl] = new Date(new Date().getTime() - r))),
                Yf(n, Uf[ul], Uf[cl], p[sl](), e, t));
            p[al][fl](r);
          }),
          (p[ml] = function (n, e, t) {
            n = Yf(n, zf[ul], zf[cl], p[sl](), e, t);
            p[al][fl](n);
          }),
          (p.trackPageViewPerformance = function (n, e) {
            n = n || {};
            try {
              w[yl](n), p[ml](n, e);
            } catch (t) {
              d(
                1,
                37,
                'trackPageViewPerformance failed, page view will not be collected: ' +
                  Cn(t),
                { exception: mn(t) }
              );
            }
          }),
          (p.startTrackPage = function (n) {
            try {
              var e;
              'string' != typeof n && (n = ((e = ye()) && e.title) || ''),
                y.start(n);
            } catch (t) {
              d(
                1,
                31,
                'startTrackPage failed, page view may not be collected: ' +
                  Cn(t),
                { exception: mn(t) }
              );
            }
          }),
          (p.stopTrackPage = function (n, e, t, r) {
            try {
              var i, o;
              'string' != typeof n && (n = ((i = ye()) && i.title) || ''),
                'string' != typeof e && (e = ((o = so()) && o[xl]) || ''),
                y.stop(n, e, t, r),
                N && b[dl](n, e);
            } catch (a) {
              d(
                1,
                32,
                'stopTrackPage failed, page view will not be collected: ' +
                  Cn(a),
                { exception: mn(a) }
              );
            }
          }),
          (p[wl] = function (n, e, t) {
            var r = (n && (n[bl] || n[Il])) ||
                (en(n) && n) || { name: n && typeof n, message: n || zc },
              r =
                ((n = n || {}),
                Yf(
                  new Tf(
                    p[sl](),
                    r,
                    n[gl] || e,
                    n.measurements,
                    n.severityLevel,
                    n.id
                  ).toInterface(),
                  Tf[ul],
                  Tf[cl],
                  p[sl](),
                  e,
                  t
                ));
            p[al][fl](r);
          }),
          (p.trackException = function (n, e) {
            n && !n[bl] && n[Il] && (n[bl] = n[Il]);
            try {
              p[wl](n, e);
            } catch (t) {
              d(
                1,
                35,
                'trackException failed, exception will not be collected: ' +
                  Cn(t),
                { exception: mn(t) }
              );
            }
          }),
          (p[Cl] = function (n) {
            var e,
              t,
              r,
              i = n && n[Il],
              o = n && n.evt;
            try {
              o || ((f = xe()) && (o = f.event));
              var a = (n && n.url) || (ye() || {}).URL,
                u =
                  n[Tl] ||
                  'window.onerror@' +
                    a +
                    ':' +
                    (n[Sl] || 0) +
                    ':' +
                    (n[kl] || 0),
                c = {
                  errorSrc: u,
                  url: a,
                  lineNumber: n[Sl] || 0,
                  columnNumber: n[kl] || 0,
                  message: n[_l],
                },
                s = n.message;
              n.url,
                n.lineNumber,
                n.columnNumber,
                n[Il] ||
                !G(s) ||
                ('Script error.' !== s && 'Script error' !== s)
                  ? (n[Tl] || (n[Tl] = u),
                    p.trackException({ exception: n, severityLevel: 3 }, c))
                  : ((e = Tf[Dl](
                      "Script error: The browser's same-origin policy prevents us from getting the details of this exception. Consider using the 'crossorigin' attribute.",
                      a,
                      n[Sl] || 0,
                      n[kl] || 0,
                      i,
                      o,
                      null,
                      u
                    )),
                    (t = c),
                    (r = Yf(e, Tf[ul], Tf[cl], p[sl](), t)),
                    p[al][fl](r));
            } catch (l) {
              var f = i ? i.name + ', ' + i[_l] : 'null';
              d(
                1,
                11,
                '_onError threw exception while logging error, error will not be collected: ' +
                  Cn(l),
                { exception: mn(l), errorString: f }
              );
            }
          }),
          (p[El] = function (n) {
            if (p[al]) return p[al][El](n);
            (I = I || []).push(n);
          }),
          (p.initialize = function (n, e, t, r) {
            if (!p.isInitialized()) {
              gn(e) && cn('Error initializing'), g.initialize(n, e, t, r);
              try {
                var i, o;
                (U = mc(Ro(p.identifier), e.evtNamespace && e.evtNamespace())),
                  I &&
                    (wn(I, function (n) {
                      e[El](n);
                    }),
                    (I = null)),
                  (f = n),
                  (l = p.identifier),
                  (d = p[al]),
                  p[ol](
                    Tn(f, function () {
                      var r,
                        n = Eu(null, f, d);
                      (M = n.getExtCfg(l, sd)),
                        (N = M[Pl]),
                        f.storagePrefix && Ys(f.storagePrefix),
                        pn((n = M)[il]) ||
                          (Xs = n[il] ? (Ks = !1) : ((Ks = Qs(!0)), tf(!0))),
                        (C = M[Ml]),
                        !T &&
                          C &&
                          ((r = ['/browserLinkSignalR/', '/__browserLink/']),
                          p[ol](
                            p[El](function (n) {
                              if (C && n.baseType === qf[ul]) {
                                var e = n.baseData;
                                if (e)
                                  for (var t = 0; t < r[Nl]; t++)
                                    if (e.target && 0 <= ft(e.target, r[t]))
                                      return !1;
                              }
                              return !0;
                            })
                          ),
                          (T = !0));
                    })
                  ),
                  (w = new td(p[al])),
                  (x = new Jl(p, M.overridePageViewDuration, p[al], w)),
                  (b = new id(p[sl](), function (n, e, t) {
                    p.trackMetric(
                      {
                        name: 'PageVisitTime',
                        average: t,
                        max: t,
                        min: t,
                        sampleCount: 1,
                      },
                      { PageName: n, PageUrl: e }
                    );
                  })),
                  ((m = new ud(p[sl]())).action = function (n, e, t, r, i) {
                    (i = i || {}),
                      ((r = r || {}).duration = t[rl]()),
                      p.trackEvent({ name: n, properties: r, measurements: i });
                  }),
                  ((y = new ud(p[sl]())).action = function (n, e, t, r, i) {
                    ((r = gn(r) ? {} : r).duration = t[rl]()),
                      p[vl](
                        { name: n, uri: e, properties: r, measurements: i },
                        r
                      );
                  }),
                  xe() &&
                    ((c = xe()),
                    (s = so(!0)),
                    p[ol](
                      Tn(M, function () {
                        (_ = M.disableExceptionTracking) ||
                          D ||
                          M.autoExceptionInstrumented ||
                          (h(
                            Ac(
                              c,
                              'onerror',
                              {
                                ns: U,
                                rsp: function (n, e, t, r, i, o) {
                                  _ ||
                                    !0 === n.rslt ||
                                    p[Cl](Tf[Dl](e, t, r, i, o, n.evt));
                                },
                              },
                              !1
                            )
                          ),
                          (D = !0));
                      })
                    ),
                    (i = c),
                    (o = s),
                    p[ol](
                      Tn(M, function () {
                        (E = !0 === M[Rl]),
                          (D = D || M[Ul]),
                          E &&
                            !P &&
                            (h(
                              Ac(
                                i,
                                'onunhandledrejection',
                                {
                                  ns: U,
                                  rsp: function (n, e) {
                                    var t, r;
                                    E &&
                                      !0 !== n.rslt &&
                                      p[Cl](
                                        Tf[Dl](
                                          (t = e) && t.reason
                                            ? ((r = t.reason),
                                              !G(r) && $(r[rl])
                                                ? r[rl]()
                                                : mn(r))
                                            : t || '',
                                          o ? o[xl] : '',
                                          0,
                                          0,
                                          e,
                                          n.evt
                                        )
                                      );
                                  },
                                },
                                !1
                              )
                            ),
                            (M[Ul] = P = !0));
                      })
                    ),
                    (a = xe()),
                    (u = so(!0)),
                    p[ol](
                      Tn(M, function () {
                        var n, e, t, r;
                        (S = !0 === M[Al]),
                          a &&
                            S &&
                            !k &&
                            be() &&
                            ((e = be()),
                            $(e.pushState) &&
                              $(e.replaceState) &&
                              typeof Event !== xr &&
                              ((n = a),
                              (e = e),
                              (t = u),
                              k ||
                                ((r = M.namePrefix || ''),
                                h(
                                  Ac(
                                    e,
                                    'pushState',
                                    {
                                      ns: U,
                                      rsp: function () {
                                        S &&
                                          (cd(n, Qf(r + 'pushState')),
                                          cd(n, Qf(r + 'locationchange')));
                                      },
                                    },
                                    !0
                                  )
                                ),
                                h(
                                  Ac(
                                    e,
                                    'replaceState',
                                    {
                                      ns: U,
                                      rsp: function () {
                                        S &&
                                          (cd(n, Qf(r + 'replaceState')),
                                          cd(n, Qf(r + 'locationchange')));
                                      },
                                    },
                                    !0
                                  )
                                ),
                                yc(
                                  n,
                                  r + 'popstate',
                                  function () {
                                    S && cd(n, Qf(r + 'locationchange'));
                                  },
                                  U
                                ),
                                yc(
                                  n,
                                  r + 'locationchange',
                                  function () {
                                    var n, e;
                                    R && (A = R),
                                      (R = (t && t[xl]) || ''),
                                      S &&
                                        ((e = null),
                                        (e =
                                          p[al] && p[al].getTraceCtx
                                            ? p[al].getTraceCtx(!1)
                                            : e) ||
                                          ((n = p[al].getPlugin(nl)) &&
                                            (n = n.plugin.context) &&
                                            (e = js(n.telemetryTrace))),
                                        (n = e) &&
                                          (n.setTraceId(uu()),
                                          (e = '_unknown_'),
                                          t &&
                                            t.pathname &&
                                            (e = t.pathname + (t.hash || '')),
                                          n.setName(L(p[sl](), e))),
                                        gt(
                                          function (n) {
                                            p[ll]({
                                              refUri: n,
                                              properties: { duration: 0 },
                                            });
                                          }.bind(p, A),
                                          p.autoRoutePVDelay
                                        ));
                                  },
                                  U
                                ),
                                (k = !0))));
                      })
                    ));
              } catch (v) {
                throw (p.setInitialized(!1), v);
              }
              var a, u, c, s, f, l, d;
            }
          }),
          (p._doTeardown = function (n, e) {
            x && x.teardown(n, e), xc(window, null, null, U), t();
          }),
          yn(p, '_pageViewManager', {
            g: function () {
              return x;
            },
          }),
          yn(p, '_pageViewPerformanceManager', {
            g: function () {
              return w;
            },
          }),
          yn(p, '_pageVisitTimeManager', {
            g: function () {
              return b;
            },
          }),
          yn(p, '_evtNamespace', {
            g: function () {
              return '.' + U;
            },
          });
      }),
      n
    );
  }
  var pd,
    gd = 'featureOptIn',
    hd = 'onCfgChangeReceive',
    md = 'nonOverrideConfigs',
    yd = 'scheduleFetchTimeout',
    xd = 'featureOptIn.',
    wd = '.offCfg',
    t = undefined,
    bd = dn(
      (((e = {
        syncMode: 1,
        blkCdnCfg: t,
        customEvtName: t,
        cfgUrl: t,
        overrideSyncFn: t,
        overrideFetchFn: t,
      })[hd] = t),
      (e[yd] = 18e5),
      (e[md] = {
        instrumentationKey: !0,
        connectionString: !0,
        endpointUrl: !0,
      }),
      e)
    ),
    Id = (kr(Cd, (pd = s)), (Cd.__ieDyn = 1), Cd);
  function Cd() {
    var y,
      x,
      w,
      b,
      I,
      n,
      C,
      T,
      S,
      k,
      _,
      D,
      E,
      P,
      M,
      N,
      e = pd.call(this) || this,
      r = ((e.priority = 198), !(e.identifier = 'AppInsightsCfgSyncPlugin'));
    return (
      In(Cd, e, function (u, c) {
        function t() {
          D = N = M = S = _ = k = n = E = T = C = I = b = w = x = null;
        }
        function a(n, e) {
          if (n) {
            if (((x = n), e && !r)) return f();
            if (C && !r) return u.core.updateCfg(n), !0;
          }
          return !1;
        }
        function s() {
          try {
            var n = me();
            n && xc(n, null, null, b);
          } catch (e) {}
        }
        function f(n) {
          try {
            if (N && $(N)) return N(x, n);
            var e,
              t,
              r,
              i,
              o,
              a,
              u = w,
              c = x,
              s = n,
              f = me();
            if (f && f.CustomEvent)
              try {
                return (
                  (e = f),
                  (r = u),
                  (o = null),
                  (a = {
                    detail: { cfg: c || null, customDetails: s || null },
                  }),
                  $(CustomEvent)
                    ? (o = new CustomEvent(r, a))
                    : (i = ye()) &&
                      i.createEvent &&
                      (o = i.createEvent('CustomEvent')).initCustomEvent(
                        r,
                        !0,
                        !0,
                        a
                      ),
                  (t = o),
                  !!(e && e.dispatchEvent && t) && (e.dispatchEvent(t), !0)
                );
              } catch (l) {}
            return !1;
          } catch (d) {}
          return !1;
        }
        function l(n) {
          try {
            if ((s(), n && ((w = n), C))) {
              var e = me();
              if (e)
                try {
                  yc(
                    e,
                    w,
                    function (n) {
                      var n = n && n.detail;
                      D && n
                        ? D(n)
                        : (n =
                            (n = n && n.cfg) &&
                            Ge(n) &&
                            (function (n) {
                              var e = null;
                              try {
                                n &&
                                  (e = (function u(n, t, r, i) {
                                    try {
                                      var e = i < r,
                                        o =
                                          (e && (n = null),
                                          0 == r
                                            ? (function (n) {
                                                return et(
                                                  n,
                                                  Z[Y][Q](arguments)
                                                );
                                              })({}, n)
                                            : n);
                                      return (
                                        o &&
                                          t &&
                                          !e &&
                                          B(o, function (n) {
                                            var e = t[n];
                                            e &&
                                              (Dn(o[n]) && Dn(e)
                                                ? (o[n] = u(o[n], e, ++r, i))
                                                : delete o[n]);
                                          }),
                                        o
                                      );
                                    } catch (a) {}
                                    return n;
                                  })(n, E, 0, 5));
                              } catch (t) {}
                              return e;
                            })(n)) && a(n);
                    },
                    b,
                    !0
                  );
                } catch (t) {}
            }
            return !0;
          } catch (r) {}
          return !1;
        }
        function d(n, t, r) {
          var e = me(),
            e = (e && e.fetch) || null;
          if (n && e && $(e))
            try {
              var i = new Request(n, { method: 'GET' });
              ei(fetch(i), function (n) {
                var e = n.value;
                n.rejected
                  ? g(t, 400)
                  : e.ok
                    ? ei(e.text(), function (n) {
                        g(t, e.status, n.value, r);
                      })
                    : g(t, e.status, null, r);
              });
            } catch (o) {}
        }
        function v(n, e, t) {
          try {
            var r = new XMLHttpRequest();
            r.open('GET', n),
              (r.onreadystatechange = function () {
                r.readyState === XMLHttpRequest.DONE &&
                  g(e, r.status, r.responseText, t);
              }),
              (r.onerror = function () {
                g(e, 400);
              }),
              (r.ontimeout = function () {
                g(e, 400);
              }),
              r.send();
          } catch (i) {}
        }
        function p(n, e, t) {
          try {
            var r, i;
            200 <= n && n < 400 && e
              ? ((_ = 0),
                (r = lo()) &&
                  (i = (function (v, i) {
                    try {
                      if (!v || !v.enabled) return null;
                      if (!v[gd]) return v.config;
                      var n = v[gd],
                        o = v.config || {};
                      return (
                        B(n, function (d) {
                          var t,
                            n,
                            e,
                            r = (function (n) {
                              if (!v || !v.enabled) return null;
                              var e = (v[gd] || {})[d] || { mode: 1 },
                                t = e.mode,
                                r = e.onCfg,
                                e = e.offCfg,
                                n = (n || {})[d] || { mode: 2 },
                                i = n.mode,
                                o = n.onCfg,
                                a = n.offCfg,
                                n = !!n.blockCdnCfg,
                                u = xd + d + '.onCfg',
                                c = xd + d + wd,
                                s = i,
                                f = o,
                                l = a;
                              return (
                                n ||
                                  (4 === t || 5 === t
                                    ? ((s = 4 == t ? 3 : 2),
                                      (f = r || o),
                                      (l = e || a))
                                    : 2 === t || 2 === i
                                      ? ((s = 2), (f = o || r), (l = a || e))
                                      : 3 === t
                                        ? ((s = 3), (f = o || r), (l = a || e))
                                        : 1 === t && 1 === i && (s = 1)),
                                ((n = {})[xd + d + '.mode'] = s),
                                (n[u] = f),
                                (n[c] = l),
                                n
                              );
                            })(i.config[gd]);
                          gn(r) ||
                            (B(r, function (n, e) {
                              ut(o, n, e);
                            }),
                            (t = o),
                            (n = r[xd + d + '.mode']),
                            (e = r[xd + d + '.onCfg']),
                            (r = r[xd + d + wd]),
                            (r = 2 === n ? r : 3 === n ? e : null) &&
                              B(r, function (n, e) {
                                ut(t, n, e);
                              }));
                        }),
                        o
                      );
                    } catch (e) {}
                    return null;
                  })(r.parse(e), u.core)) &&
                  a(i, t))
              : _++,
              _ < 3 && h();
          } catch (o) {}
        }
        function g(n, e, t, r) {
          try {
            n(e, t, r);
          } catch (i) {}
        }
        function h() {
          !n &&
            k &&
            (n = gt(function () {
              (n = null), P(I, p, T);
            }, k)).unref();
        }
        function m() {
          n && n.cancel(), (n = null), (_ = 0);
        }
        t(),
          (u.initialize = function (n, e, t, r) {
            var i, o, a;
            c.initialize(n, e, t, r),
              (b = mc(Ro(u.identifier), e.evtNamespace && e.evtNamespace())),
              (o = u.identifier),
              (a = u.core),
              u._addHook(
                Tn((i = n), function () {
                  var n = Eu(null, i, a),
                    n = ((y = n.getExtCfg(o, bd)), S),
                    n =
                      ((S = !!y.blkCdnCfg),
                      gn(n) || n === S || (!S && I ? P && P(I, p, T) : m()),
                      gn(C) && (C = 2 === y.syncMode),
                      gn(T) && (T = 1 === y.syncMode),
                      y.customEvtName || 'ai_cfgsync');
                  w !== n && (C ? l(n) : (s(), (w = n))),
                    (I = gn(I) ? y.cfgUrl : I) || ((x = i), T && f());
                })
              ),
              (N = y.overrideSyncFn),
              (M = y.overrideFetchFn),
              (D = y[hd]),
              (E = y[md]),
              (k = y[yd]),
              gn((t = M)) && (ho() ? (t = d) : mo() && (t = v)),
              (P = t),
              (_ = 0),
              I && !S && P && P(I, p, T);
          }),
          (u.getCfg = function () {
            return x;
          }),
          (u.pause = function () {
            (r = !0), m();
          }),
          (u.resume = function () {
            (r = !1), h();
          }),
          (u.setCfg = function (n) {
            return a(n);
          }),
          (u.sync = f),
          (u.updateEventListenerName = l),
          (u._doTeardown = function (n, e) {
            s(), m(), t();
          }),
          (u._getDbgPlgTargets = function () {
            return [T, C, w, S];
          }),
          (u.processTelemetry = function (n, e) {
            u.processNext(n, e);
          });
      }),
      e
    );
  }
  var Td = 'duration',
    Sd = 'tags',
    kd = 'deviceType',
    _d = 'data',
    Dd = 'name',
    Ed = 'traceID',
    _n = 'length',
    Pd = 'stringify',
    Md = 'measurements',
    Nd = 'dataType',
    Ad = 'envelopeType',
    Rd = 'toString',
    Ud = '_get',
    Ld = 'enqueue',
    qd = 'count',
    Od = 'eventsLimitInMem',
    Fd = 'push',
    Vd = 'emitLineDelimitedJson',
    zd = 'clear',
    Hd = 'batchPayloads',
    jd = 'createNew',
    Bd = 'markAsSent',
    Kd = 'clearSent',
    Xd = 'bufferOverride',
    Wd = 'BUFFER_KEY',
    Jd = 'SENT_BUFFER_KEY',
    Gd = 'concat',
    $d = 'MAX_BUFFER_SIZE',
    Yd = 'sendPOST',
    Qd = 'triggerSend',
    Zd = 'diagLog',
    nv = '_sender',
    ev = 'customHeaders',
    tv = 'maxBatchSizeInBytes',
    rv = 'onunloadDisableBeacon',
    iv = 'isBeaconApiDisabled',
    ov = 'alwaysUseXhrOverride',
    av = 'enableSessionStorageBuffer',
    uv = '_buffer',
    cv = 'onunloadDisableFetch',
    sv = 'disableSendBeaconSplit',
    fv = 'instrumentationKey',
    lv = 'unloadTransports',
    dv = 'convertUndefined',
    vv = 'maxBatchInterval',
    pv = 'serialize',
    gv = '_onError',
    hv = '_onPartialSuccess',
    mv = '_onSuccess',
    yv = 'itemsAccepted',
    xv = 'baseType',
    wv = 'sampleRate',
    bv = 'oriPayload',
    Iv = 'setRequestHeader',
    Cv = 'eventsSendRequest',
    Tv = 'getSamplingScore',
    Sv = 'baseType',
    d = 'baseData',
    kv = 'properties',
    _v = 'true';
  function v(n, e, t) {
    p(n, e, t, rn);
  }
  function Dv(n, t, r) {
    gn(n) ||
      B(n, function (n, e) {
        nn(e) ? (r[n] = e) : G(e) ? (t[n] = e) : fo() && (t[n] = lo()[Pd](e));
      });
  }
  function Ev(t, r) {
    gn(t) ||
      B(t, function (n, e) {
        t[n] = e || r;
      });
  }
  function Pv(n, e, t, r) {
    for (
      var r = new cf(n, r, e),
        e =
          (v(r, 'sampleRate', t[Lc]),
          (t[d] || {}).startTime && (r.time = zi(t[d].startTime)),
          (r.iKey = t.iKey),
          t.iKey.replace(/-/g, '')),
        e = ((r[Dd] = r[Dd].replace('{0}', e)), n),
        n = t,
        i = r,
        o = (i[Sd] = i[Sd] || {}),
        a = (n.ext = n.ext || {}),
        u = (n[Sd] = n[Sd] || []),
        c = a.user,
        c =
          (c &&
            (v(o, l.userAuthUserId, c.authId),
            v(o, l.userId, c.id || c.localId)),
          a.app),
        c = (c && v(o, l.sessionId, c.sesId), a.device),
        c =
          (c &&
            (v(o, l.deviceId, c.id || c.localId),
            v(o, l[kd], c.deviceClass),
            v(o, l.deviceIp, c.ip),
            v(o, l.deviceModel, c.model),
            v(o, l[kd], c[kd])),
          n.ext.web),
        n =
          (c &&
            (v(o, l.deviceLanguage, c.browserLang),
            v(o, l.deviceBrowserVersion, c.browserVer),
            v(o, l.deviceBrowser, c.browser),
            v(
              (n = (n = (n = i[_d] = i[_d] || {})[d] = n[d] || {})[kv] =
                n[kv] || {}),
              'domain',
              c.domain
            ),
            v(n, 'isManual', c.isManual ? _v : null),
            v(n, 'screenRes', c.screenRes),
            v(n, 'userConsent', c.userConsent ? _v : null)),
          a.os),
        c = (n && v(o, l.deviceOS, n[Dd]), a.trace),
        s =
          (c &&
            (v(o, l.operationParentId, c.parentID),
            v(o, l.operationName, L(e, c[Dd])),
            v(o, l.operationId, c[Ed])),
          {}),
        f = u[_n] - 1;
      0 <= f;
      f--
    )
      B(u[f], function (n, e) {
        s[n] = e;
      }),
        u.splice(f, 1);
    B(u, function (n, e) {
      s[n] = e;
    });
    n = Tr(Tr({}, o), s);
    return (
      n[l.internalSdkVersion] ||
        (n[l.internalSdkVersion] = L(e, 'javascript:'.concat(Nv.Version), 64)),
      (i[Sd] = Xi(n)),
      (t[Sd] = t[Sd] || []),
      Xi(r)
    );
  }
  function Mv(n, e) {
    gn(e[d]) && Sn(n, 1, 46, 'telemetryItem.baseData cannot be null.');
  }
  var Nv = { Version: '3.1.0' };
  function Av(n, e, t) {
    Mv(n, e);
    var r = {},
      i = {},
      t =
        (e[Sv] !== sf[Nd] && (r.baseTypeSource = e[Sv]),
        e[Sv] === sf[Nd]
          ? ((r = e[d][kv] || {}), (i = e[d][Md] || {}))
          : e[d] && Dv(e[d], r, i),
        Dv(e[_d], r, i),
        gn(t) || Ev(r, t),
        e[d][Dd]),
      t = new sf(n, t, r, i),
      r = new jf(sf[Nd], t);
    return Pv(n, sf[Ad], e, r);
  }
  Rv.__ieDyn = 1;
  o = Rv;
  function Rv(o, t) {
    var a = [],
      r = !1;
    (this[Ud] = function () {
      return a;
    }),
      (this._set = function (n) {
        return (a = n);
      }),
      In(Rv, this, function (e) {
        (e[Ld] = function (n) {
          e[qd]() >= t[Od]
            ? r ||
              (Sn(
                o,
                2,
                105,
                'Maximum in-memory buffer size reached: ' + e[qd](),
                !0
              ),
              (r = !0))
            : a[Fd](n);
        }),
          (e[qd] = function () {
            return a[_n];
          }),
          (e.size = function () {
            for (var n = a[_n], e = 0; e < a[_n]; e++) n += a[e][_n];
            return t[Vd] || (n += 2), n;
          }),
          (e[zd] = function () {
            r = !(a = []);
          }),
          (e.getItems = function () {
            return a.slice(0);
          }),
          (e[Hd] = function (n) {
            return n && 0 < n[_n]
              ? t[Vd]
                ? n.join('\n')
                : '[' + n.join(',') + ']'
              : null;
          }),
          (e[jd] = function (n, e, t) {
            var r = a.slice(0),
              i = new (t ? Fv : Lv)((n = n || o), (e = e || {}));
            return (
              wn(r, function (n) {
                i[Ld](n);
              }),
              i
            );
          });
      });
  }
  kr(qv, (Uv = o)), (qv.__ieDyn = 1);
  var Uv,
    Lv = qv;
  function qv(n, e) {
    n = Uv.call(this, n, e) || this;
    return (
      In(qv, n, function (n, e) {
        (n[Bd] = function (n) {
          e[zd]();
        }),
          (n[Kd] = function (n) {});
      }),
      n
    );
  }
  kr(g, (Ov = o)),
    (g.BUFFER_KEY = 'AI_buffer'),
    (g.SENT_BUFFER_KEY = 'AI_sentBuffer'),
    (g.MAX_BUFFER_SIZE = 2e3);
  var Ov,
    Fv = g;
  function g(c, n) {
    var e = Ov.call(this, c, n) || this,
      o = !1,
      s = null == n ? void 0 : n.namePrefix,
      n = n[Xd] || { getItem: rf, setItem: of },
      f = n.getItem,
      l = n.setItem;
    return (
      In(g, e, function (a, e) {
        var n = u(g[Wd]),
          t = u(g[Jd]),
          t = a._set(n[Gd](t));
        function r(e, n) {
          var t = [];
          return (
            wn(n, function (n) {
              $(n) || -1 !== Ae(e, n) || t[Fd](n);
            }),
            t
          );
        }
        function u(n) {
          try {
            var e = f(c, (n = s ? s + '_' + n : n));
            if (e) {
              var t = lo().parse(e);
              if ((t = G(t) ? lo().parse(t) : t) && hn(t)) return t;
            }
          } catch (r) {
            Sn(c, 1, 42, ' storage key: ' + n + ', ' + Cn(r), {
              exception: mn(r),
            });
          }
          return [];
        }
        function i(n, e) {
          try {
            var n = s ? s + '_' + n : n,
              t = JSON[Pd](e);
            l(c, n, t);
          } catch (r) {
            l(c, n, JSON[Pd]([])),
              Sn(
                c,
                2,
                41,
                ' storage key: ' + n + ', ' + Cn(r) + '. Buffer cleared',
                { exception: mn(r) }
              );
          }
        }
        t[_n] > g[$d] && (t[_n] = g[$d]),
          i(g[Jd], []),
          i(g[Wd], t),
          (a[Ld] = function (n) {
            a[qd]() >= g[$d]
              ? o ||
                (Sn(c, 2, 67, 'Maximum buffer size reached: ' + a[qd](), !0),
                (o = !0))
              : (e[Ld](n), i(g.BUFFER_KEY, a[Ud]()));
          }),
          (a[zd] = function () {
            e[zd](), i(g.BUFFER_KEY, a[Ud]()), i(g[Jd], []), (o = !1);
          }),
          (a[Bd] = function (n) {
            i(g[Wd], a._set(r(n, a[Ud]())));
            var e = u(g[Jd]);
            e instanceof Array &&
              n instanceof Array &&
              ((e = e[Gd](n))[_n] > g[$d] &&
                (Sn(
                  c,
                  1,
                  67,
                  'Sent buffer reached its maximum size: ' + e[_n],
                  !0
                ),
                (e[_n] = g[$d])),
              i(g[Jd], e));
          }),
          (a[Kd] = function (n) {
            n = r(n, u(g[Jd]));
            i(g[Jd], n);
          }),
          (a[jd] = function (n, e, t) {
            t = !!t;
            var r = a[Ud]().slice(0),
              i = u(g[Jd]).slice(0),
              o =
                ((n = n || c), (e = e || {}), a[zd](), new (t ? g : Lv)(n, e));
            return (
              wn(r, function (n) {
                o[Ld](n);
              }),
              t && o[Bd](i),
              o
            );
          });
      }),
      e
    );
  }
  zv.__ieDyn = 1;
  var Vv = zv;
  function zv(l) {
    In(zv, this, function (n) {
      function s(a, u) {
        var n = '__aiCircularRefCheck',
          c = {};
        if (!a)
          return (
            Sn(
              l,
              1,
              48,
              'cannot serialize object because it is null or undefined',
              { name: u },
              !0
            ),
            c
          );
        if (a[n])
          return (
            Sn(
              l,
              2,
              50,
              'Circular reference detected while serializing object',
              { name: u },
              !0
            ),
            c
          );
        if (a.aiDataContract)
          return (
            (a[n] = !0),
            B(a.aiDataContract, function (n, e) {
              var t = $(e) ? 1 & e() : 1 & e,
                r = $(e) ? 4 & e() : 4 & e,
                e = 2 & e,
                i = a[n] !== undefined,
                o = Dn(a[n]) && null !== a[n];
              !t || i || e
                ? r ||
                  ((t = o ? (e ? f : s)(a[n], n) : a[n]) !== undefined &&
                    (c[n] = t))
                : Sn(
                    l,
                    1,
                    24,
                    'Missing required field specification. The field is required but not present on source',
                    { field: n, name: u }
                  );
            }),
            delete a[n],
            c
          );
        if ('measurements' === u) c = t(a, 'number', u);
        else if ('properties' === u) c = t(a, 'string', u);
        else if ('tags' === u) c = t(a, 'string', u);
        else if (hn(a)) c = f(a, u);
        else {
          Sn(
            l,
            2,
            49,
            'Attempting to serialize an object which does not implement ISerializable',
            { name: u },
            !0
          );
          try {
            lo()[Pd](a), (c = a);
          } catch (e) {
            Sn(
              l,
              1,
              48,
              e && $(e[Rd]) ? e[Rd]() : 'Error serializing object',
              null,
              !0
            );
          }
        }
        return c;
      }
      function f(n, e) {
        if (n)
          if (hn(n))
            for (var t = [], r = 0; r < n[_n]; r++) {
              var i = s(n[r], e + '[' + r + ']');
              t[Fd](i);
            }
          else
            Sn(
              l,
              1,
              54,
              'This field was specified as an array in the contract but the item is not an array.\r\n',
              { name: e },
              !0
            );
        return t;
      }
      function t(n, t, r) {
        var i;
        return (
          n &&
            ((i = {}),
            B(n, function (n, e) {
              'string' === t
                ? e === undefined
                  ? (i[n] = 'undefined')
                  : null === e
                    ? (i[n] = 'null')
                    : e[Rd]
                      ? (i[n] = e[Rd]())
                      : (i[n] = 'invalid field: toString() is not defined.')
                : 'number' === t
                  ? e === undefined
                    ? (i[n] = 'undefined')
                    : (i[n] = null === e ? 'null' : parseFloat(e))
                  : ((i[n] = 'invalid field: ' + r + ' is of unknown type.'),
                    Sn(l, 1, i[n], null, !0));
            })),
          i
        );
      }
      n[pv] = function (n) {
        n = s(n, 'root');
        try {
          return lo()[Pd](n);
        } catch (e) {
          Sn(
            l,
            1,
            48,
            e && $(e[Rd]) ? e[Rd]() : 'Error serializing object',
            null,
            !0
          );
        }
      };
    });
  }
  (jv.prototype.getHashCodeScore = function (n) {
    return (this.getHashCode(n) / jv.INT_MAX_VALUE) * 100;
  }),
    (jv.prototype.getHashCode = function (n) {
      if ('' === n) return 0;
      for (; n[_n] < 8; ) n = n[Gd](n);
      for (var e = 5381, t = 0; t < n[_n]; ++t)
        (e = (e << 5) + e + n.charCodeAt(t)), (e &= e);
      return Math.abs(e);
    }),
    (jv.INT_MAX_VALUE = 2147483647);
  var Hv = jv;
  function jv() {}
  var Bv = function () {
      var e = new Hv(),
        t = new Gf();
      this[Tv] = function (n) {
        return n[Sd] && n[Sd][t.userId]
          ? e.getHashCodeScore(n[Sd][t.userId])
          : n.ext && n.ext.user && n.ext.user.id
            ? e.getHashCodeScore(n.ext.user.id)
            : n[Sd] && n[Sd][t.operationId]
              ? e.getHashCodeScore(n[Sd][t.operationId])
              : n.ext && n.ext.telemetryTrace && n.ext.telemetryTrace[Ed]
                ? e.getHashCodeScore(n.ext.telemetryTrace[Ed])
                : 100 * Math.random();
      };
    },
    Kv =
      ((Xv.prototype.isSampledIn = function (n) {
        var e = this[wv];
        return (
          null === e ||
          e === undefined ||
          100 <= e ||
          n.baseType === Mf[Nd] ||
          this.samplingScoreGenerator[Tv](n) < e
        );
      }),
      Xv);
  function Xv(n, e) {
    this.INT_MAX_VALUE = 2147483647;
    e = e || ya(null);
    (100 < n || n < 0) &&
      (e.throwInternal(
        2,
        58,
        'Sampling rate is out of range (0..100). Sampling will be disabled, you may be sending too much data which may affect your AI service level.',
        { samplingRate: n },
        !0
      ),
      (n = 100)),
      (this[wv] = n),
      (this.samplingScoreGenerator = new Bv());
  }
  var Wv = undefined;
  function Jv(n) {
    try {
      return n.responseText;
    } catch (e) {}
    return null;
  }
  function Gv(n, e) {
    return e && (nn(e) ? (n = [e][Gd](n)) : hn(e) && (n = e[Gd](n))), n;
  }
  var $v = dn(
    (((a = { endpointUrl: aa(rn, Fc + Vc) })[Vd] = i()),
    (a[vv] = 15e3),
    (a[tv] = 102400),
    (a.disableTelemetry = i()),
    (a[av] = i(!0)),
    (a.isRetryDisabled = i()),
    (a[iv] = i(!0)),
    (a[sv] = i(!0)),
    (a.disableXhr = i()),
    (a[cv] = i()),
    (a[rv] = i()),
    (a[fv] = Wv),
    (a.namePrefix = Wv),
    (a.samplingPercentage = aa(function (n) {
      return !isNaN(n) && 0 < n && n <= 100;
    }, 100)),
    (a[ev] = Wv),
    (a[dv] = Wv),
    (a[Od] = 1e4),
    (a[Xd] = !1),
    (a.httpXHROverride = {
      isVal: function (n) {
        return n && n[Yd];
      },
      v: Wv,
    }),
    (a[ov] = i()),
    (a.transports = Wv),
    a)
  );
  ((u = {})[sf.dataType] = Av),
    (u[Ff.dataType] = function (n, e, t) {
      Mv(n, e);
      var r = e[d].message,
        i = e[d].severityLevel,
        o = e[d][kv] || {},
        a = e[d][Md] || {},
        t = (Dv(e[_d], o, a), gn(t) || Ev(o, t), new Ff(n, r, i, o, a)),
        r = new jf(Ff[Nd], t);
      return Pv(n, Ff[Ad], e, r);
    }),
    (u[Uf.dataType] = function (n, e, t) {
      Mv(n, e);
      var r,
        i = e[d],
        i =
          (gn(i) || gn(i[kv]) || gn(i[kv][Td])
            ? gn(e[_d]) || gn(e[_d][Td]) || ((r = e[_d][Td]), delete e[_d][Td])
            : ((r = i[kv][Td]), delete i[kv][Td]),
          e[d]),
        o =
          (((e.ext || {}).trace || {})[Ed] && (o = e.ext.trace[Ed]), i.id || o),
        a = i[Dd],
        u = i.uri,
        c = i[kv] || {},
        s = i[Md] || {},
        i =
          (gn(i.refUri) || (c.refUri = i.refUri),
          gn(i.pageType) || (c.pageType = i.pageType),
          gn(i.isLoggedIn) || (c.isLoggedIn = i.isLoggedIn[Rd]()),
          gn(i[kv]) ||
            B(i[kv], function (n, e) {
              c[n] = e;
            }),
          Dv(e[_d], c, s),
          gn(t) || Ev(c, t),
          new Uf(n, a, u, r, c, s, o)),
        t = new jf(Uf[Nd], i);
      return Pv(n, Uf[Ad], e, t);
    }),
    (u[zf.dataType] = function (n, e, t) {
      Mv(n, e);
      var r = e[d],
        i = r[Dd],
        o = r.uri || r.url,
        a = r[kv] || {},
        u = r[Md] || {},
        t =
          (Dv(e[_d], a, u),
          gn(t) || Ev(a, t),
          new zf(n, i, o, undefined, a, u, r)),
        i = new jf(zf[Nd], t);
      return Pv(n, zf[Ad], e, i);
    }),
    (u[Tf.dataType] = function (n, e, t) {
      Mv(n, e);
      var r = e[d][Md] || {},
        i = e[d][kv] || {},
        t = (Dv(e[_d], i, r), gn(t) || Ev(i, t), e[d]),
        t = Tf.CreateFromInterface(n, t, i, r),
        i = new jf(Tf[Nd], t);
      return Pv(n, Tf[Ad], e, i);
    }),
    (u[Mf.dataType] = function (n, e, t) {
      Mv(n, e);
      var r = e[d],
        i = r[kv] || {},
        o = r[Md] || {},
        t =
          (Dv(e[_d], i, o),
          gn(t) || Ev(i, t),
          new Mf(
            n,
            r[Dd],
            r.average,
            r.sampleCount,
            r.min,
            r.max,
            r.stdDev,
            i,
            o
          )),
        r = new jf(Mf[Nd], t);
      return Pv(n, Mf[Ad], e, r);
    }),
    (u[qf.dataType] = function (n, e, t) {
      Mv(n, e);
      var r = e[d][Md] || {},
        i = e[d][kv] || {},
        t = (Dv(e[_d], i, r), gn(t) || Ev(i, t), e[d]);
      if (gn(t)) return Ia(n, 'Invalid input for dependency data'), null;
      var o = t[kv] && t[kv][Oc] ? t[kv][Oc] : 'GET',
        o = new qf(
          n,
          t.id,
          t.target,
          t[Dd],
          t[Td],
          t.success,
          t.responseCode,
          o,
          t.type,
          t.correlationContext,
          i,
          r
        ),
        t = new jf(qf[Nd], o);
      return Pv(n, qf[Ad], e, t);
    });
  var Yv,
    Qv = u,
    Zv =
      (kr(np, (Yv = s)),
      (np.constructEnvelope = function (n, e, t, r) {
        n = e === n.iKey || gn(e) ? n : Tr(Tr({}, n), { iKey: e });
        return (Qv[n.baseType] || Av)(t, n, r);
      }),
      np);
  function np() {
    var A,
      R,
      U,
      L,
      q,
      O,
      F,
      V,
      z,
      H,
      j,
      B,
      K,
      X,
      W,
      J,
      G,
      $,
      Y,
      Q,
      Z,
      nn,
      en,
      tn,
      rn,
      on,
      an,
      un,
      cn,
      sn,
      fn,
      ln,
      dn = Yv.call(this) || this,
      vn = ((dn.priority = 1001), (dn.identifier = el), 0);
    return (
      In(np, dn, function (v, r) {
        function u(n, e) {
          return !(
            $ ||
            (n
              ? n.baseData && !n[xv]
                ? (e &&
                    Sn(
                      e,
                      1,
                      70,
                      'Cannot send telemetry without baseData and baseType'
                    ),
                  1)
                : (n[xv] || (n[xv] = 'EventData'),
                  v[nv]
                    ? v._sample.isSampledIn(n)
                      ? ((n[Lc] = v._sample[wv]), 0)
                      : (e &&
                          Sn(
                            e,
                            2,
                            33,
                            'Telemetry item was sampled out and not sent',
                            { SampleRate: v._sample[wv] }
                          ),
                        1)
                    : (e && Sn(e, 1, 28, 'Sender was not initialized'), 1))
              : (e && Sn(e, 1, 7, 'Cannot send empty telemetry'), 1))
          );
        }
        function c(n, t) {
          var e = n.iKey || Y,
            r = np.constructEnvelope(n, e, t, Q);
          if (r) {
            var i = !1;
            if (
              (n[Sd] &&
                n[Sd][qc] &&
                (wn(n[Sd][qc], function (n) {
                  try {
                    n &&
                      !1 === n(r) &&
                      ((i = !0),
                      Ia(t, 'Telemetry processor check returns false'));
                  } catch (e) {
                    Sn(
                      t,
                      1,
                      64,
                      'One of telemetry initializers failed, telemetry item will not be sent: ' +
                        Cn(e),
                      { exception: mn(e) },
                      !0
                    );
                  }
                }),
                delete n[Sd][qc]),
              !i)
            )
              return r;
          } else Sn(t, 1, 47, 'Unable to create an AppInsights envelope');
        }
        function e(n) {
          var e = '',
            t = v[Zd]();
          try {
            var r = u(n, t),
              i = null;
            (i = r ? c(n, t) : i) && (e = q[pv](i));
          } catch (o) {}
          return e;
        }
        function t(n) {
          return n && n[_n] ? '[' + n.join(',') + ']' : '';
        }
        function i(n) {
          var e,
            t = F;
          return (
            Os(j) && (t[kn[6]] = kn[7]),
            ((e = { urlString: j })[_d] = n),
            (e.headers = t),
            e
          );
        }
        function p(n, e) {
          for (var t, r, i = null, o = 0; null == i && o < n[_n]; )
            (r = n[o]),
              un || 1 !== r
                ? 2 === r && ho(e)
                  ? (i = s)
                  : 3 === r && (e ? W : J) && (i = x)
                : (ao =
                      null === ao && (ao = typeof XDomainRequest !== xr) && mo()
                        ? ao && !co(xn(to), 'withCredentials')
                        : ao)
                  ? (i = E)
                  : mo() && (i = w),
              o++;
          return i ? (((t = {})[Yd] = i), t) : null;
        }
        function o(n, e, t, r) {
          200 === e && n ? v._onSuccess(n, n[_n]) : r && v[gv](n, r);
        }
        function g(n, r, e, t) {
          void 0 === t && (t = !0);
          var i = a(r),
            n = n && n[Yd];
          return n && i
            ? (t && v._buffer[Bd](r),
              n(
                i,
                function (n, e, t) {
                  return o(r, n, 0, t);
                },
                !e
              ))
            : null;
        }
        function a(n) {
          var e, t;
          return hn(n) && 0 < n[_n]
            ? ((t = v._buffer[Hd](n)),
              ((e = {})[_d] = t),
              (e.urlString = j),
              (e.headers = F),
              (e.disableXhrSync = un),
              (e.disableFetchKeepAlive = !cn),
              (e[bv] = n),
              e)
            : null;
        }
        function s(n, e, t) {
          return I(n, e, !1);
        }
        function h(n) {
          n = n ? n[_n] : 0;
          v[uv].size() + n > K && ((z && !z.isOnline()) || v[Qd](!0, null, 10));
        }
        function m(n, e, t, r, i, o) {
          var a = null;
          v._appId || ((a = C(o)) && a.appId && (v._appId = a.appId)),
            (n < 200 || 300 <= n) && 0 !== n
              ? ((301 !== n && 307 !== n && 308 !== n) || f(t)) && !Z && _(n)
                ? (T(e),
                  Sn(
                    v[Zd](),
                    2,
                    40,
                    '. Response code ' +
                      n +
                      '. Will retry to send ' +
                      e[_n] +
                      ' items.'
                  ))
                : v[gv](e, i)
              : z && !z.isOnline()
                ? Z ||
                  (T(e, 10),
                  Sn(
                    v[Zd](),
                    2,
                    40,
                    '. Offline - Response Code: '
                      .concat(n, '. Offline status: ')
                      .concat(!z.isOnline(), '. Will retry to send ')
                      .concat(e.length, ' items.')
                  ))
                : (f(t),
                  206 === n
                    ? (a = a || C(o)) && !Z
                      ? v[hv](e, a)
                      : v[gv](e, i)
                    : ((A = 0), v[mv](e, r)));
        }
        function f(n) {
          return (
            !(10 <= O) && !gn(n) && '' !== n && n !== j && ((j = n), ++O, 1)
          );
        }
        function y(n, e, t, r) {
          try {
            n(e, t, r);
          } catch (i) {}
        }
        function l(n, e) {
          var t;
          V ? V(n, !1) : ((t = a(n)), v._buffer[Bd](n), x(t));
        }
        function d(n) {
          var e = we(),
            t = j,
            r = v[uv][Hd](n),
            r = new Blob([r], { type: 'text/plain;charset=UTF-8' }),
            t = e.sendBeacon(t, r);
          return t && v._onSuccess(n, n[_n]), t;
        }
        function x(n, e, t) {
          var r = n && n[bv];
          if (hn(r) && 0 < r[_n] && !d(r))
            if (ln)
              fn && fn(r, !0),
                Sn(
                  v[Zd](),
                  2,
                  40,
                  '. Failed to send telemetry with Beacon API, retried with normal sender.'
                );
            else {
              for (var i = [], o = 0; o < r[_n]; o++) {
                var a = r[o];
                d([a]) || i[Fd](a);
              }
              0 < i[_n] &&
                (fn && fn(i, !0),
                Sn(
                  v[Zd](),
                  2,
                  40,
                  '. Failed to send telemetry with Beacon API, retried with normal sender.'
                ));
            }
        }
        function w(n, e, t) {
          var r,
            i,
            o,
            a = n,
            u = new XMLHttpRequest(),
            c = j;
          try {
            u[Uc] = !0;
          } catch (s) {}
          return (
            u.open('POST', c, !t),
            u[Iv]('Content-type', 'application/json'),
            Os(c) && u[Iv](kn[6], kn[7]),
            wn(Mn(F), function (n) {
              u[Iv](n, F[n]);
            }),
            (u.onreadystatechange = function () {
              var n = a[bv];
              v._xhrReadyStateChange(u, n, n[_n]),
                4 === u.readyState && i && i(!0);
            }),
            (u.onerror = function (n) {
              y(e, 400, {}, D(u)), o && o(n);
            }),
            !t &&
              on &&
              (r = pi(function (n, e) {
                (i = n), (o = e);
              })),
            u.send(n[_d]),
            r
          );
        }
        function b(r, n) {
          if (hn(r)) {
            for (var e = r[_n], t = 0; t < r[_n]; t++) e += r[t][_n];
            var i = a(r);
            v._buffer[Bd](r),
              vn + e <= 65e3
                ? I(
                    i,
                    function (n, e, t) {
                      return o(r, n, 0, t);
                    },
                    !0
                  )
                : go()
                  ? x(i)
                  : (fn && fn(r, !0),
                    Sn(
                      v[Zd](),
                      2,
                      40,
                      '. Failed to send telemetry with Beacon API, retried with xhrSender.'
                    ));
          }
        }
        function I(n, e, r) {
          var t,
            i,
            o,
            a = j,
            u = n,
            n = u[_d],
            c = new Blob([n], { type: 'application/json' }),
            s = new Headers(),
            f = n[_n],
            n = !1,
            l = !1,
            a =
              (Os(a) && s.append(kn[6], kn[7]),
              wn(Mn(F), function (n) {
                s.append(n, F[n]);
              }),
              ((c = { method: 'POST', headers: s, body: c })[Uc] = !0),
              r && ((n = c.keepalive = !0), (vn += f)),
              new Request(a, c));
          try {
            a[Uc] = !0;
          } catch (d) {}
          !r &&
            on &&
            (t = pi(function (n, e) {
              (i = n), (o = e);
            }));
          try {
            ei(fetch(a), function (n) {
              var t;
              r && ((vn -= f), (f = 0)),
                l ||
                  ((l = !0),
                  n.rejected
                    ? (y(e, 400, {}, n.reason && n.reason.message),
                      o && o(n.reason))
                    : (t = n.value).ok
                      ? ei(t.text(), function (n) {
                          var e = u[bv];
                          m(
                            t.status,
                            e,
                            t.url,
                            e[_n],
                            t.statusText,
                            n.value || ''
                          ),
                            i && i(!0);
                        })
                      : (y(e, 400, {}, t.statusText), i && i(!1)));
            });
          } catch (d) {
            l || (y(e, 400, {}, mn(d)), o && o(d));
          }
          return n && !l && ((l = !0), y(e, 200, {}), i && i(!0)), t;
        }
        function C(n) {
          try {
            if (n && '' !== n) {
              var e = lo().parse(n);
              if (
                e &&
                e.itemsReceived &&
                e.itemsReceived >= e[yv] &&
                e.itemsReceived - e.itemsAccepted === e.errors[_n]
              )
                return e;
            }
          } catch (t) {
            Sn(v[Zd](), 1, 43, 'Cannot parse the response. ' + Cn(t), {
              response: n,
            });
          }
          return null;
        }
        function T(n, e) {
          if ((void 0 === e && (e = 1), n && 0 !== n[_n])) {
            var t = v[uv];
            t[Kd](n), A++;
            for (var r = 0, i = n; r < i.length; r++) {
              var o = i[r];
              t[Ld](o);
            }
            (e =
              A <= 1
                ? 10
                : ((n =
                    1 +
                    Math.floor(
                      ((Math.pow(2, A) - 1) / 2) * Math.random() * 10
                    )),
                  Math.max(Math.min((n *= e), 3600), 10))),
              (n = He() + 1e3 * e);
            (R = n), S();
          }
        }
        function S() {
          var n;
          L ||
            U ||
            ((n = R ? Math.max(0, R - He()) : 0),
            (L = gt(
              function () {
                (L = null), v[Qd](!0, null, 1);
              },
              Math.max(nn, n)
            )));
        }
        function k() {
          L && L.cancel(), (R = L = null);
        }
        function _(n) {
          return (
            401 === n ||
            403 === n ||
            408 === n ||
            429 === n ||
            500 === n ||
            502 === n ||
            503 === n ||
            504 === n
          );
        }
        function D(n, e) {
          return n
            ? 'XMLHttpRequest,Status:' + n.status + ',Response:' + Jv(n) ||
                n.response ||
                ''
            : e;
        }
        function E(n, e, t) {
          var r = n,
            n = xe(),
            i = new XDomainRequest(),
            o = r[_d],
            n =
              ((i.onload = function () {
                var n = r[bv];
                v._xdrOnLoad(i, n);
              }),
              (i.onerror = function () {
                y(e, 400, {}, P(i));
              }),
              (n && n.location && n.location.protocol) || '');
          if (j.lastIndexOf(n, 0))
            return (
              Sn(
                v[Zd](),
                2,
                40,
                ". Cannot send XDomain request. The endpoint URL protocol doesn't match the hosting page protocol."
              ),
              void v._buffer[zd]()
            );
          n = j.replace(/^(https?:)/, '');
          i.open('POST', n), i.send(o);
        }
        function P(n, e) {
          return n ? 'XDomainRequest,Response:' + Jv(n) || '' : e;
        }
        function M(n, e) {
          var t = 'getNotifyMgr',
            t = v.core[t] ? v.core[t]() : v.core._notificationManager;
          if (t && t[Cv])
            try {
              t[Cv](n, e);
            } catch (r) {
              Sn(v[Zd](), 1, 74, 'send request notification failed: ' + Cn(r), {
                exception: mn(r),
              });
            }
        }
        function N() {
          (v[nv] = null),
            (v[uv] = null),
            (v._appId = null),
            (v._sample = null),
            (K = vn = O = A = 0),
            (rn = Q = Wv),
            (ln = cn = un = Z = $ = X = U = !(F = {})),
            (fn = sn = en = Y = G = B = j = H = V = q = L = R = z = null),
            yn(v, '_senderConfig', {
              g: function () {
                return (function d() {
                  var n = arguments,
                    e = n[0] || {},
                    t = n[bn],
                    r = !1,
                    i = 1;
                  for (
                    0 < t && En(e) && ((r = e), (e = n[i] || {}), i++),
                      Dn(e) || (e = {});
                    i < t;
                    i++
                  ) {
                    var o,
                      a,
                      u,
                      c,
                      s = n[i],
                      f = hn(s),
                      l = Dn(s);
                    for (o in s)
                      ((f && o in s) || (l && Pn(s, o))) &&
                        ((a = s[o]),
                        (u = void 0),
                        r &&
                          a &&
                          ((u = hn(a)) || Ge(a)) &&
                          ((c = e[o]),
                          u ? hn(c) || (c = []) : Ge(c) || (c = {}),
                          (a = d(r, c, a))),
                        a !== undefined && (e[o] = a));
                  }
                  return e;
                })({}, $v);
              },
            });
        }
        N(),
          (v.pause = function () {
            k(), (U = !0);
          }),
          (v.resume = function () {
            U && ((U = !1), (R = null), h(), S());
          }),
          (v.flush = function (n, e, t) {
            if ((void 0 === n && (n = !0), !U)) {
              k();
              try {
                return v[Qd](n, null, t || 1);
              } catch (r) {
                Sn(
                  v[Zd](),
                  1,
                  22,
                  'flush failed, telemetry will not be collected: ' + Cn(r),
                  { exception: mn(r) }
                );
              }
            }
          }),
          (v.onunloadFlush = function () {
            if (!U)
              if (X || an)
                try {
                  return v[Qd](!0, l, 2);
                } catch (n) {
                  Sn(
                    v[Zd](),
                    1,
                    20,
                    'failed to flush with beacon sender on page unload, telemetry will not be collected: ' +
                      Cn(n),
                    { exception: mn(n) }
                  );
                }
              else v.flush(!1);
          }),
          (v.addHeader = function (n, e) {
            F[n] = e;
          }),
          (v.initialize = function (n, f, e, t) {
            v.isInitialized() &&
              Sn(v[Zd](), 1, 28, 'Sender is already initialized'),
              r.initialize(n, f, e, t);
            var l = v.identifier,
              d =
                ((q = new Vv(f.logger)),
                (A = 0),
                (R = null),
                (v[nv] = null),
                (O = 0),
                v[Zd]());
            (H = mc(Ro('Sender'), f.evtNamespace && f.evtNamespace())),
              (z = (function (n) {
                var e,
                  t = ye(),
                  r = we(),
                  i = !1,
                  o = [],
                  a = 1,
                  u = (!r || gn(r.onLine) || r.onLine || (a = 2), 0),
                  c = l(),
                  s = mc(Ro('OfflineListener'), n);
                try {
                  f(xe()) && (i = !0),
                    t && (e = t.body || t).ononline && f(e) && (i = !0);
                } catch (g) {
                  i = !1;
                }
                function f(n) {
                  var e = !1;
                  return (
                    n && (e = yc(n, 'online', v, s)) && yc(n, 'offline', p, s),
                    e
                  );
                }
                function l() {
                  return 2 !== u && 2 !== a;
                }
                function d() {
                  var n = l();
                  c !== n &&
                    ((c = n),
                    wn(o, function (n) {
                      var e = { isOnline: c, rState: a, uState: u };
                      try {
                        n(e);
                      } catch (g) {}
                    }));
                }
                function v() {
                  (a = 1), d();
                }
                function p() {
                  (a = 2), d();
                }
                return {
                  isOnline: function () {
                    return c;
                  },
                  isListening: function () {
                    return i;
                  },
                  unload: function () {
                    var n = xe();
                    n &&
                      i &&
                      (Zf(n, s),
                      t && !pn((n = t.body || t).ononline) && Zf(n, s),
                      (i = !1));
                  },
                  addListener: function (e) {
                    return (
                      o[Wc](e),
                      {
                        rm: function () {
                          var n = o.indexOf(e);
                          if (-1 < n) return o.splice(n, 1);
                        },
                      }
                    );
                  },
                  setOnlineState: function (n) {
                    (u = n), d();
                  },
                };
              })(H)),
              v._addHook(
                Tn(n, function (n) {
                  var n = n.cfg,
                    e =
                      (n.storagePrefix && Ys(n.storagePrefix),
                      Eu(null, n, f).getExtCfg(l, $v)),
                    t =
                      (yn(v, '_senderConfig', {
                        g: function () {
                          return e;
                        },
                      }),
                      B !== e.endpointUrl && (j = B = e.endpointUrl),
                      G &&
                        G !== e[ev] &&
                        wn(G, function (n) {
                          delete F[n.header];
                        }),
                      (K = e[tv]),
                      (X = (!1 === e[rv] || !1 === e[iv]) && go()),
                      (W = !1 === e[rv] && go()),
                      (J = !1 === e[iv] && go()),
                      (an = e[ov]),
                      (un = !!e.disableXhr),
                      e[Xd]),
                    r = !!e[av] && (!!t || tf()),
                    i = e.namePrefix,
                    o = r !== en || (r && rn !== i) || (r && tn !== t);
                  if (v[uv]) {
                    if (o)
                      try {
                        v._buffer = v._buffer[jd](d, e, r);
                      } catch (s) {
                        Sn(
                          v[Zd](),
                          1,
                          12,
                          'failed to transfer telemetry to different buffer storage, telemetry will be lost: ' +
                            Cn(s),
                          { exception: mn(s) }
                        );
                      }
                    h();
                  } else v[uv] = new (r ? Fv : Lv)(d, e);
                  (rn = i),
                    (en = r),
                    (tn = t),
                    (cn = !e[cv] && ho(!0)),
                    (ln = !!e[sv]),
                    (v._sample = new Kv(e.samplingPercentage, d)),
                    (o = Y = e[fv]),
                    (!gn((i = n.disableInstrumentationKeyValidation)) && i) ||
                      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
                        o
                      ) ||
                      Sn(d, 1, 100, 'Invalid Instrumentation key ' + Y),
                    (G = e[ev]),
                    !Os(j) && G && 0 < G[_n]
                      ? wn(G, function (n) {
                          dn.addHeader(n.header, n.value);
                        })
                      : (G = null),
                    (on = e.enableSendPromise);
                  var r = e.httpXHROverride,
                    a = null,
                    u = null,
                    a = p(Gv([3, 1, 2], e.transports), !1),
                    c = { sendPOST: w },
                    t =
                      ((sn = function (n, e) {
                        return g(c, n, e);
                      }),
                      (fn = function (n, e) {
                        return g(c, n, e, !1);
                      }),
                      (a = an ? r : a || r || c),
                      (v[nv] = function (n, e) {
                        return g(a, n, e);
                      }),
                      cn && (V = b),
                      Gv([3, 1], e[lv]));
                  cn ||
                    (t = t.filter(function (n) {
                      return 2 !== n;
                    })),
                    (u = p(t, !0)),
                    (u = (!an && u) || r),
                    (V =
                      (V =
                        (an || e[lv] || !V) && u
                          ? function (n, e) {
                              return g(u, n, e);
                            }
                          : V) || sn),
                    ($ = e.disableTelemetry),
                    (Q = e[dv] || Wv),
                    (Z = e.isRetryDisabled),
                    (nn = e[vv]);
                })
              );
          }),
          (v.processTelemetry = function (n, e) {
            var t = (e = v._getTelCtx(e))[Zd]();
            try {
              if (!u(n, t)) return;
              var r = c(n, t);
              if (!r) return;
              var i = q[pv](r),
                o = v[uv];
              h(i), o[Ld](i), S();
            } catch (a) {
              Sn(
                t,
                2,
                12,
                "Failed adding telemetry to the sender's buffer, some telemetry will be lost: " +
                  Cn(a),
                { exception: mn(a) }
              );
            }
            v.processNext(n, e);
          }),
          (v.isCompletelyIdle = function () {
            return !U && 0 === vn && 0 === v._buffer[qd]();
          }),
          (v._xhrReadyStateChange = function (n, e, t) {
            4 === n.readyState &&
              m(n.status, e, n.responseURL, t, D(n), Jv(n) || n.response);
          }),
          (v[Qd] = function (n, e, t) {
            var r;
            if ((void 0 === n && (n = !0), !U))
              try {
                var i,
                  o = v[uv];
                $
                  ? o[zd]()
                  : 0 < o[qd]() &&
                    ((i = o.getItems()),
                    M(t || 0, n),
                    (r = e ? e.call(v, i, n) : v[nv](i, n))),
                  k();
              } catch (a) {
                o = po();
                (!o || 9 < o) &&
                  Sn(
                    v[Zd](),
                    1,
                    40,
                    'Telemetry transmission failed, some telemetry will be lost: ' +
                      Cn(a),
                    { exception: mn(a) }
                  );
              }
            return r;
          }),
          (v.getOfflineSupport = function () {
            var n = {
              getUrl: function () {
                return j;
              },
              createPayload: i,
            };
            return (
              (n[pv] = e),
              (n.batch = t),
              (n.shouldProcess = function (n) {
                return !!u(n);
              }),
              n
            );
          }),
          (v._doTeardown = function (n, e) {
            v.onunloadFlush(), ta(z, !1), N();
          }),
          (v[gv] = function (n, e, t) {
            Sn(v[Zd](), 2, 26, 'Failed to send telemetry.', { message: e }),
              v._buffer && v._buffer[Kd](n);
          }),
          (v[hv] = function (n, e) {
            for (
              var t = [], r = [], i = 0, o = e.errors.reverse();
              i < o.length;
              i++
            ) {
              var a = o[i],
                u = n.splice(a.index, 1)[0];
              (_(a.statusCode) ? r : t)[Fd](u);
            }
            0 < n[_n] && v[mv](n, e[yv]),
              0 < t[_n] &&
                v[gv](
                  t,
                  D(
                    null,
                    ['partial success', e[yv], 'of', e.itemsReceived].join(' ')
                  )
                ),
              0 < r[_n] &&
                (T(r),
                Sn(
                  v[Zd](),
                  2,
                  40,
                  'Partial success. Delivered: ' +
                    n[_n] +
                    ', Failed: ' +
                    t[_n] +
                    '. Will retry to send ' +
                    r[_n] +
                    ' our of ' +
                    e.itemsReceived +
                    ' items'
                ));
          }),
          (v[mv] = function (n, e) {
            v._buffer && v._buffer[Kd](n);
          }),
          (v._xdrOnLoad = function (n, e) {
            var t = Jv(n);
            !n || (t + '' != '200' && '' !== t)
              ? (t = C(t)) && t.itemsReceived && t.itemsReceived > t[yv] && !Z
                ? v[hv](e, t)
                : v[gv](e, P(n))
              : ((A = 0), v[mv](e, 0));
          });
      }),
      dn
    );
  }
  var ep = 'duration',
    tp = 'properties',
    rp = 'requestUrl',
    ip = 'inst',
    op = 'length',
    ap = 'traceID',
    up = 'spanID',
    cp = 'traceFlags',
    sp = 'context',
    fp = 'aborted',
    lp = 'traceId',
    dp = 'spanId',
    vp = '_addHook',
    pp = 'core',
    gp = 'includeCorrelationHeaders',
    hp = 'getAbsoluteUrl',
    mp = 'headers',
    yp = 'requestHeaders',
    xp = 'setRequestHeader',
    wp = 'trackDependencyDataInternal',
    bp = 'startTime',
    Ip = 'toLowerCase',
    Cp = 'enableRequestHeaderTracking',
    Tp = 'enableAjaxErrorStatusText',
    Sp = 'enableAjaxPerfTracking',
    kp = 'maxAjaxCallsPerView',
    _p = 'excludeRequestFromAutoTrackingPatterns',
    Dp = 'addRequestContext',
    Ep = 'disableAjaxTracking',
    Pp = 'ajaxPerfLookupDelay',
    Mp = 'disableFetchTracking',
    Np = 'enableResponseHeaderTracking',
    Ap = 'status',
    Rp = 'statusText',
    Up = 'headerMap',
    Lp = 'openDone',
    qp = 'sendDone',
    Op = 'requestSentTime',
    Fp = 'abortDone',
    Vp = 'getTraceId',
    zp = 'getTraceFlags',
    Hp = 'method',
    jp = 'errorStatusText',
    Bp = 'stateChangeAttached',
    Kp = 'responseText',
    Xp = 'responseFinishedTime',
    Wp = 'CreateTrackItem',
    Jp = 'response',
    Gp = 'getAllResponseHeaders',
    $p = 'getPartAProps',
    Yp = 'perfMark',
    Qp = 'name',
    Zp = 'perfTiming',
    ng = 'exception',
    eg = 'ajaxDiagnosticsMessage',
    tg = 'correlationContext',
    rg = 'ajaxTotalDuration',
    ig = 'eventTraceCtx';
  function og(n, e, t) {
    (e = n[e]), (t = n[t]);
    return e && t ? Hs(e, t) : 0;
  }
  function ag(n, e, t, r, i) {
    t = og(t, r, i);
    return t ? ug(n, e, Rf(t)) : 0;
  }
  function ug(n, e, t) {
    var r = 0;
    return (
      n && e && t && (((n.ajaxPerf = n.ajaxPerf || {})[e] = t), (r = 1)), r
    );
  }
  var cg = function () {
      (this[Lp] = !1),
        (this.setRequestHeaderDone = !1),
        (this[qp] = !1),
        (this[Fp] = !1),
        (this[Bp] = !1);
    },
    sg = ((fg.__ieDyn = 1), fg);
  function fg(n, e, t, r) {
    var i = this,
      o = t;
    (i[Yp] = null),
      (i.completed = !1),
      (i.requestHeadersSize = null),
      (i[yp] = null),
      (i.responseReceivingDuration = null),
      (i.callbackDuration = null),
      (i[rg] = null),
      (i[fp] = 0),
      (i.pageUrl = null),
      (i[rp] = null),
      (i.requestSize = 0),
      (i[Hp] = null),
      (i[Ap] = null),
      (i[Op] = null),
      (i.responseStartedTime = null),
      (i[Xp] = null),
      (i.callbackFinishedTime = null),
      (i.endTime = null),
      (i.xhrMonitoringState = new cg()),
      (i.clientFailure = 0),
      (i[ap] = n),
      (i[up] = e),
      (i[cp] = null == r ? void 0 : r.getTraceFlags()),
      (i[ig] = r
        ? (((t = {})[lp] = r[Vp]()),
          (t[dp] = r.getSpanId()),
          (t[cp] = r[zp]()),
          t)
        : null),
      In(fg, i, function (m) {
        (m.getAbsoluteUrl = function () {
          return m[rp] ? ((n = Rs(m[rp])) ? n.href : void 0) : null;
          var n;
        }),
          (m.getPathName = function () {
            return m[rp]
              ? ks(
                  o,
                  ((n = m[Hp]), (e = m[rp]), n ? n.toUpperCase() + ' ' + e : e)
                )
              : null;
            var n, e;
          }),
          (m[Wp] = function (n, e, t) {
            if (
              ((m.ajaxTotalDuration =
                Math.round(
                  1e3 * Hs(m.requestSentTime, m.responseFinishedTime)
                ) / 1e3),
              m[rg] < 0)
            )
              return null;
            ((h = { id: '|' + m[ap] + '.' + m[up], target: m[hp]() })[Qp] =
              m.getPathName()),
              (h.type = n),
              (h[bp] = null),
              (h.duration = m[rg]),
              (h.success = 200 <= +m[Ap] && +m[Ap] < 400),
              (h.responseCode = +m[Ap]),
              (h[tp] = { HttpMethod: m[Hp] });
            var r,
              i,
              o,
              a,
              u,
              c,
              s,
              f,
              l,
              d,
              v,
              p,
              g,
              n = h,
              h = n[tp];
            return (
              m[fp] && (h[fp] = !0),
              m[Op] && ((n[bp] = new Date()), n[bp].setTime(m[Op])),
              (a = (r = m)[Zp]),
              (u = (i = n)[tp] || {}),
              (c = 0),
              (p = 'connectEnd'),
              (g = 'requestStart'),
              (v = 'responseEnd'),
              (s = 'transferSize'),
              (f = 'encodedBodySize'),
              (l = 'decodedBodySize'),
              (d = 'serverTiming'),
              a
                ? ((c =
                    (c =
                      (c =
                        (c =
                          (c =
                            (c =
                              (c |= ag(u, 'End', a, 'redirectStart', 'End')) |
                              ag(
                                u,
                                'domainLookup',
                                a,
                                'domainLookupStart',
                                'domainLookupEnd'
                              )) | ag(u, 'connect', a, 'connectStart', p)) |
                          ag(u, 'request', a, g, 'requestEnd')) |
                        ag(u, 'response', a, 'responseStart', v)) |
                      ag(u, 'networkConnect', a, 'startTime', p)) |
                    ag(u, 'sentRequest', a, g, v)),
                  (p = a[ep] || og(a, 'startTime', v) || 0),
                  (c = (c |= ug(u, ep, p)) | ug(u, 'perfTotal', p)),
                  (g = a[d]) &&
                    ((o = {}),
                    wn(g, function (n, e) {
                      var e = Fi(n.name || '' + e),
                        t = o[e] || {};
                      B(n, function (n, e) {
                        !(('name' !== n && G(e)) || nn(e)) ||
                          (!(e = t[n] ? t[n] + ';' + e : e) && G(e)) ||
                          (t[n] = e);
                      }),
                        (o[e] = t);
                    }),
                    (c |= ug(u, d, o))),
                  (c =
                    (c = (c |= ug(u, s, a[s])) | ug(u, f, a[f])) |
                    ug(u, l, a[l])))
                : r[Yp] && (c |= ug(u, 'missing', r.perfAttempts)),
              c && (i[tp] = u),
              e && 0 < Mn(m.requestHeaders)[op] && (h[yp] = m[yp]),
              t &&
                (v = t()) &&
                ((p = v[tg]) && (n.correlationContext = p),
                v[Up] && 0 < Mn(v.headerMap)[op] && (h.responseHeaders = v[Up]),
                m[jp] &&
                  (400 <= m[Ap]
                    ? (('' !== (g = v.type) && 'text' !== g) ||
                        (h.responseText = v.responseText
                          ? v[Rp] + ' - ' + v.responseText
                          : v[Rp]),
                      'json' === g &&
                        (h.responseText = v.response
                          ? v[Rp] + ' - ' + JSON.stringify(v[Jp])
                          : v[Rp]))
                    : 0 === m[Ap] && (h.responseText = v[Rp] || ''))),
              n
            );
          }),
          (m[$p] = function () {
            var n,
              e = null,
              t = m[ig];
            return (
              t &&
                (t[lp] || t[dp]) &&
                ((n = (e = {}).trace =
                  (((n = {})[ap] = t[lp]), (n.parentID = t[dp]), n)),
                gn(t[cp]) || (n[cp] = t[cp])),
              e
            );
          });
      });
  }
  var lg = 'ai.ajxmn.',
    dg = 'diagLog',
    vg = '_ajaxData',
    pg = 'fetch',
    gg = 'Failed to monitor XMLHttpRequest',
    Wf = ', monitoring data for this ajax call ',
    hg = Wf + 'may be incorrect.',
    mg = Wf + "won't be sent.",
    yg =
      'Failed to get Request-Context correlation header as it may be not included in the response or not accessible.',
    xg =
      'Failed to add custom defined request context as configured call back may missing a null check.',
    wg = 'Failed to calculate the duration of the ',
    bg = 0;
  function Ig(n, e) {
    var t,
      r = !1,
      i =
        (mo() &&
          (r = !(
            gn((i = XMLHttpRequest[wr])) ||
            gn(i.open) ||
            gn(i.send) ||
            gn(i.abort)
          )),
        po());
    if ((r = !(i && i < 9) && r))
      try {
        var o = new XMLHttpRequest(),
          a = { xh: [], i: (((t = {})[e] = {}), t) },
          u = ((o[vg] = a), XMLHttpRequest[wr].open);
        XMLHttpRequest[wr].open = u;
      } catch (c) {
        (r = !1),
          kg(
            n,
            15,
            'Failed to enable XMLHttpRequest monitoring, extension is not supported',
            (((i = {})[ng] = mn(c)), i)
          );
      }
    return r;
  }
  var Cg = function (n, e) {
      return n && e && n[vg] ? (n[vg].i || {})[e] : null;
    },
    Tg = function (n, e) {
      var t = !1;
      return (
        n &&
          (n = (n[vg] || {}).xh) &&
          wn(n, function (n) {
            if (n.n === e) return (t = !0), -1;
          }),
        t
      );
    };
  function Sg(n, e) {
    var t = '';
    try {
      var r = Cg(n, e);
      r && r[rp] && (t += "(url: '" + r[rp] + "')");
    } catch (i) {}
    return t;
  }
  function kg(n, e, t, r, i) {
    Sn(n[dg](), 1, e, t, r, i);
  }
  function _g(n, e, t, r, i) {
    Sn(n[dg](), 2, e, t, r, i);
  }
  function Dg(t, r, i) {
    return function (n) {
      var e;
      kg(
        t,
        r,
        i,
        (((e = { ajaxDiagnosticsMessage: Sg(n[ip], t._ajaxDataId) })[ng] = mn(
          n.err
        )),
        e)
      );
    };
  }
  function Eg(n, e) {
    return n && e ? ft(n, e) : -1;
  }
  function Pg(t, n, e) {
    var r = { id: n, fn: e };
    return (
      t.push(r),
      {
        remove: function () {
          wn(t, function (n, e) {
            if (n.id === r.id) return t.splice(e, 1), -1;
          });
        },
      }
    );
  }
  function Mg(r, n, i, o) {
    var a = !0;
    return (
      wn(n, function (n, e) {
        try {
          !1 === n.fn.call(null, i) && (a = !1);
        } catch (t) {
          Sn(
            r && r.logger,
            1,
            64,
            'Dependency ' + o + ' [#' + e + '] failed: ' + Cn(t),
            { exception: mn(t) },
            !0
          );
        }
      }),
      a
    );
  }
  var Ng,
    Jf = '*.blob.core.',
    r = vn([
      Jf + 'windows.net',
      Jf + 'chinacloudapi.cn',
      Jf + 'cloudapi.de',
      Jf + 'usgovcloudapi.net',
    ]),
    Ag = [
      /https:\/\/[^\/]*(\.pipe\.aria|aria\.pipe|events\.data|collector\.azure)\.[^\/]+\/(OneCollector\/1|Collector\/3)\.0/i,
    ],
    Rg = vn(
      (((t = {})[kp] = 500),
      (t[Ep] = !1),
      (t[Mp] = !1),
      (t[_p] = undefined),
      (t.disableCorrelationHeaders = !1),
      (t.distributedTracingMode = 1),
      (t.correlationHeaderExcludedDomains = r),
      (t.correlationHeaderDomains = undefined),
      (t.correlationHeaderExcludePatterns = undefined),
      (t.appId = undefined),
      (t.enableCorsCorrelation = !1),
      (t[Cp] = !1),
      (t[Np] = !1),
      (t[Tp] = !1),
      (t[Sp] = !1),
      (t.maxAjaxPerfLookupAttempts = 3),
      (t[Pp] = 25),
      (t.ignoreHeaders = ['Authorization', 'X-API-Key', 'WWW-Authenticate']),
      (t[Dp] = undefined),
      (t.addIntEndpoints = !0),
      t)
    ),
    Ug =
      (kr(Lg, (Ng = s)),
      (Lg.prototype.processTelemetry = function (n, e) {
        this.processNext(n, e);
      }),
      (Lg.prototype.addDependencyInitializer = function (n) {
        return null;
      }),
      (Lg.identifier = 'AjaxDependencyPlugin'),
      Lg);
  function Lg() {
    var b,
      I,
      C,
      T,
      S,
      k,
      r,
      _,
      D,
      E,
      P,
      M,
      N,
      A,
      R,
      U,
      L,
      q,
      O,
      F,
      V,
      e,
      z,
      H,
      j,
      B,
      K,
      X,
      W,
      J,
      n = Ng.call(this) || this;
    return (
      (n.identifier = Lg.identifier),
      (n.priority = 120),
      In(Lg, n, function (h, o) {
        var a = o[vp];
        function n() {
          var n = so();
          (J = I = b = !1),
            (C = n && n.host && n.host[Ip]()),
            (A = M = E = D = k = S = !1),
            (L = U = !(R = {})),
            (F = O = q = P = _ = T = null),
            (e = N = r = 0),
            (z = []),
            (H = []),
            (V = Ro('ajaxData')),
            (h._ajaxDataId = V),
            (X = K = B = 1),
            (W = j = null);
        }
        function l(e) {
          var t = !0;
          return (
            (e || j) &&
              wn(j, function (n) {
                if (n[Ip]() === e[Ip]()) return (t = !1), -1;
              }),
            t
          );
        }
        function u(n, e, t) {
          a(n ? Nc(n[wr], e, t, !1) : null);
        }
        function d(n, e, t) {
          var r = !1,
            i = ((G(e) ? e : (e || {}).url || '') || '')[Ip]();
          if (
            (wn(q, function (n) {
              var e = n;
              G(n) && (e = RegExp(n)), (r = r || e.test(i));
            }),
            r)
          )
            return r;
          var o = Eg(i, '?'),
            a = Eg(i, '#');
          return (
            -1 !== (o = -1 === o || (-1 !== a && a < o) ? a : o) &&
              (i = i.substring(0, o)),
            gn(n)
              ? gn(e) ||
                (r =
                  ('object' == typeof e && !0 === e[Uc]) ||
                  (!!t && !0 === t[Uc]))
              : (r = !0 === n[Uc] || !0 === i[Uc]),
            (r = !(r || !i || !Os(i)) || r)
              ? R[i] || (R[i] = 1)
              : R[i] && (r = !0),
            r
          );
        }
        function s(n, e, t) {
          var r = !0;
          return gn(n) || (r = !0 === t || !gn(e)), I && r;
        }
        function v() {
          var n = null;
          return !(n =
            h[pp] && h[pp].getTraceCtx ? h[pp].getTraceCtx(!1) : n) &&
            _ &&
            _.telemetryTrace
            ? js(_.telemetryTrace)
            : n;
        }
        function p(r, i) {
          i.xhrMonitoringState[Bp] = yc(
            r,
            'readystatechange',
            function () {
              var n, o, a;
              try {
                r &&
                  4 === r.readyState &&
                  s(r, i) &&
                  (((a = Cg((o = r), V))[Xp] = zs()),
                  (a[Ap] = o[Ap]),
                  f(
                    'xmlhttprequest',
                    a,
                    function () {
                      try {
                        var n,
                          e = a[Wp]('Ajax', S, function () {
                            ((e = { statusText: o[Rp], headerMap: null })[tg] =
                              c(o)),
                              (e.type = o.responseType),
                              (e[Kp] = (function (n) {
                                try {
                                  var e = n.responseType;
                                  if ('' === e || 'text' === e) return n[Kp];
                                } catch (t) {}
                                return null;
                              })(o)),
                              (e.response = o[Jp]);
                            var n, t, e;
                            return (
                              A &&
                                (n = o[Gp]()) &&
                                ((n = Je(n).split(/[\r\n]+/)),
                                (t = {}),
                                wn(n, function (n) {
                                  var n = n.split(': '),
                                    e = n.shift(),
                                    n = n.join(': ');
                                  l(e) && (t[e] = n);
                                }),
                                (e[Up] = t)),
                              e
                            );
                          }),
                          t = void 0;
                        try {
                          O && (t = O({ status: o[Ap], xhr: o }));
                        } catch (i) {
                          _g(h, 104, xg);
                        }
                        e
                          ? (t !== undefined &&
                              (e[tp] = Tr(Tr({}, e.properties), t)),
                            (n = a[$p]()),
                            w(H, h[pp], a, e, null, n))
                          : u(null, {
                              requestSentTime: a[Op],
                              responseFinishedTime: a[Xp],
                            });
                      } finally {
                        try {
                          var r = (o[vg] || { i: {} }).i || {};
                          r[V] && (r[V] = null);
                        } catch (i) {}
                      }
                    },
                    function (n) {
                      u(n, null);
                    }
                  ));
              } catch (t) {
                var e = mn(t);
                (e && -1 !== Eg(e[Ip](), 'c00c023f')) ||
                  kg(
                    h,
                    16,
                    gg + " 'readystatechange' event handler" + hg,
                    (((n = {})[eg] = Sg(r, V)), (n[ng] = e), n)
                  );
              }
              function u(n, e) {
                e = e || {};
                (e.ajaxDiagnosticsMessage = Sg(o, V)),
                  n && (e.exception = mn(n)),
                  _g(h, 14, wg + 'ajax call' + mg, e);
              }
            },
            F
          );
        }
        function c(n) {
          try {
            var e = n[Gp]();
            if (null !== e && -1 !== Eg(e[Ip](), kn[8]))
              return Vs(n.getResponseHeader(kn[0]));
          } catch (t) {
            _g(h, 18, yg, (((e = {})[eg] = Sg(n, V)), (e[ng] = mn(t)), e));
          }
        }
        function g(n, e) {
          var t;
          e[rp] &&
            P &&
            M &&
            (t = ot()) &&
            $(t.mark) &&
            ((n = P + n + '#' + ++bg),
            t.mark(n),
            (n = t.getEntriesByName(n)) && 1 === n[op] && (e[Yp] = n[0]));
        }
        function f(o, a, u, c) {
          var s = a[Yp],
            f = ot(),
            l = B,
            d = K,
            v = a[rp],
            p = 0;
          !(function g() {
            try {
              if (f && s) {
                p++;
                for (
                  var n = null, e = f.getEntries(), t = e[op] - 1;
                  0 <= t;
                  t--
                ) {
                  var r = e[t];
                  if (r) {
                    if ('resource' === r.entryType)
                      r.initiatorType !== o ||
                        (-1 === Eg(r[Qp], v) && -1 === Eg(v, r[Qp])) ||
                        (n = r);
                    else if ('mark' === r.entryType && r[Qp] === s[Qp]) {
                      a[Zp] = n;
                      break;
                    }
                    if (r[bp] < s[bp] - 1e3) break;
                  }
                }
              }
              !s || a[Zp] || l <= p || !1 === a['async']
                ? (s && $(f.clearMarks) && f.clearMarks(s[Qp]),
                  (a.perfAttempts = p),
                  u())
                : gt(g, d);
            } catch (i) {
              c(i);
            }
          })();
        }
        function m(n) {
          var e = '';
          try {
            gn(n) ||
              (e += "(url: '".concat('string' == typeof n ? n : n.url, "')"));
          } catch (t) {
            kg(h, 15, 'Failed to grab failed fetch diagnostics message', {
              exception: mn(t),
            });
          }
          return e;
        }
        function y(n, r, i, o, a, u) {
          function c(n, e, t) {
            t = t || {};
            (t.fetchDiagnosticsMessage = m(i)),
              e && (t.exception = mn(e)),
              _g(h, n, wg + 'fetch call' + mg, t);
          }
          a &&
            ((a[Xp] = zs()),
            (a[Ap] = r),
            f(
              pg,
              a,
              function () {
                var n,
                  e = a[Wp]('Fetch', S, u);
                try {
                  O && (n = O({ status: r, request: i, response: o }));
                } catch (t) {
                  _g(h, 104, xg);
                }
                e
                  ? (n !== undefined && (e[tp] = Tr(Tr({}, e.properties), n)),
                    (n = a[$p]()),
                    w(H, h[pp], a, e, null, n))
                  : c(14, null, {
                      requestSentTime: a[Op],
                      responseFinishedTime: a[Xp],
                    });
              },
              function (n) {
                c(18, n, null);
              }
            ));
        }
        function x(n) {
          if (n && n[mp])
            try {
              return Vs(n[mp].get(kn[0]));
            } catch (e) {
              _g(
                h,
                18,
                yg,
                (((n = { fetchDiagnosticsMessage: m(n) })[ng] = mn(e)), n)
              );
            }
        }
        function w(n, e, t, r, i, o) {
          var a,
            u = !0;
          0 < n[op] &&
            (((a = { item: r })[tp] = i),
            (a.sysProperties = o),
            (a.context = t ? t[sp] : null),
            (a.aborted = !!t && !!t[fp]),
            (u = Mg(e, n, a, 'initializer'))),
            u && h[wp](r, i, o);
        }
        n(),
          (h.initialize = function (n, e, t, r) {
            var i, f;
            h.isInitialized() ||
              (o.initialize(n, e, t, r),
              (F = mc(Ro('ajax'), e && e.evtNamespace && e.evtNamespace())),
              h[vp](
                Tn(n, function (n) {
                  var n = n.cfg,
                    e = Eu(null, n, h[pp]);
                  (T = e.getExtCfg(Lg.identifier, Rg)),
                    (X = T.distributedTracingMode),
                    (S = T[Cp]),
                    (k = T[Tp]),
                    (M = T[Sp]),
                    (N = T[kp]),
                    (q = [].concat(
                      T[_p] || [],
                      !1 !== T.addIntEndpoints ? Ag : []
                    )),
                    (O = T[Dp]),
                    (E = 0 === X || 1 === X),
                    (D = 1 === X || 2 === X),
                    M &&
                      ((e = n.instrumentationKey || 'unkwn'),
                      (P =
                        5 < e[op]
                          ? lg + Xn(e, e[op] - 5) + '.'
                          : lg + e + '.')),
                    (U = !!T[Ep]),
                    (B = T.maxAjaxPerfLookupAttempts),
                    (K = T[Pp]),
                    (j = T.ignoreHeaders),
                    (W = T.appId);
                })
              ),
              Ig(h, V) &&
                h[vp](
                  Tn(T, function () {
                    (U = !!T[Ep]),
                      (S = T[Cp]),
                      U ||
                        I ||
                        (u(XMLHttpRequest, 'open', {
                          ns: F,
                          req: function (n, e, t, r) {
                            var i, o, a, u, c;
                            U ||
                              ((n = n[ip]),
                              (i = Cg(n, V)),
                              !d(n, t) &&
                                s(n, i, !0) &&
                                ((i && i.xhrMonitoringState[Lp]) ||
                                  ((u = n),
                                  (e = e),
                                  (t = t),
                                  (r = r),
                                  (c = ((o = v()) && o[Vp]()) || uu()),
                                  (a = Wn(uu(), 0, 16)),
                                  ((c = (u = (u = u[vg] =
                                    u[vg] || { xh: [], i: {} }).i =
                                    u.i || {})[V] =
                                    u[V] ||
                                    new sg(
                                      c,
                                      a,
                                      h[dg](),
                                      null == (u = h.core)
                                        ? void 0
                                        : u.getTraceCtx()
                                    ))[cp] = o && o[zp]()),
                                  (c[Hp] = e),
                                  (c[rp] = t),
                                  (c.xhrMonitoringState[Lp] = !0),
                                  (c[yp] = {}),
                                  (c['async'] = r),
                                  (c[jp] = k),
                                  (i = c)),
                                p(n, i)));
                          },
                          hkErr: Dg(h, 15, gg + '.open' + hg),
                        }),
                        u(XMLHttpRequest, 'send', {
                          ns: F,
                          req: function (n, e) {
                            var t;
                            U ||
                              (s((n = n[ip]), (t = Cg(n, V))) &&
                                !t.xhrMonitoringState[qp] &&
                                (g('xhr', t),
                                (t[Op] = zs()),
                                h[gp](t, undefined, undefined, n),
                                (t.xhrMonitoringState[qp] = !0)));
                          },
                          hkErr: Dg(h, 17, gg + hg),
                        }),
                        u(XMLHttpRequest, 'abort', {
                          ns: F,
                          req: function (n) {
                            U ||
                              (s((n = n[ip]), (n = Cg(n, V))) &&
                                !n.xhrMonitoringState[Fp] &&
                                ((n[fp] = 1), (n.xhrMonitoringState[Fp] = !0)));
                          },
                          hkErr: Dg(h, 13, gg + '.abort' + hg),
                        }),
                        u(XMLHttpRequest, 'setRequestHeader', {
                          ns: F,
                          req: function (n, e, t) {
                            var r;
                            U ||
                              ((n = n[ip]),
                              (r = Cg(n, V)) &&
                                s(n, r) &&
                                (n &&
                                  (n = (n[vg] || {}).xh) &&
                                  n.push({ n: e, v: t }),
                                S && l(e) && r && (r[yp][e] = t)));
                          },
                          hkErr: Dg(h, 71, gg + '.setRequestHeader' + hg),
                        }),
                        (I = !0));
                  })
                ),
              (r =
                !(t = me()) || gn(t.Request) || gn(t.Request[wr]) || gn(t[pg])
                  ? null
                  : t[pg]) &&
                ((i = me()),
                (f = r.polyfill),
                h[vp](
                  Tn(T, function () {
                    (L = !!T[Mp]),
                      (A = T[Np]),
                      L || b
                        ? f &&
                          !J &&
                          (a(
                            Nc(i, pg, {
                              ns: F,
                              req: function (n, e, t) {
                                d(null, e, t);
                              },
                            })
                          ),
                          (J = !0))
                        : (a(
                            Nc(
                              i,
                              pg,
                              {
                                ns: F,
                                req: function (n, e, t) {
                                  var r, i, o, a, u, c, s;
                                  L ||
                                    !b ||
                                    d(null, e, t) ||
                                    (f && I) ||
                                    ((r = n.ctx()),
                                    (i = e),
                                    (o = t),
                                    (a = ((c = v()) && c[Vp]()) || uu()),
                                    (u = Wn(uu(), 0, 16)),
                                    ((u = new sg(
                                      a,
                                      u,
                                      h[dg](),
                                      null == (a = h.core)
                                        ? void 0
                                        : a.getTraceCtx()
                                    ))[cp] = c && c[zp]()),
                                    (u[Op] = zs()),
                                    (u[jp] = k),
                                    '' ===
                                      (a =
                                        i instanceof Request
                                          ? (i || {}).url || ''
                                          : i) &&
                                      (c = so()) &&
                                      c.href &&
                                      (a = at(c.href, '#')[0]),
                                    (u[rp] = a),
                                    (c = 'GET'),
                                    o && o[Hp]
                                      ? (c = o[Hp])
                                      : i &&
                                        i instanceof Request &&
                                        (c = i[Hp]),
                                    (u[Hp] = c),
                                    (s = {}),
                                    S &&
                                      new Headers(
                                        (o ? o[mp] : 0) ||
                                          (i instanceof Request && i[mp]) ||
                                          {}
                                      ).forEach(function (n, e) {
                                        l(e) && (s[e] = n);
                                      }),
                                    (u[yp] = s),
                                    g(pg, u),
                                    (a = u),
                                    (c = h[gp](a, e, t)) !== t && n.set(1, c),
                                    (r.data = a));
                                },
                                rsp: function (n, t) {
                                  var r;
                                  L ||
                                    ((r = n.ctx().data) &&
                                      (n.rslt = n.rslt
                                        .then(function (e) {
                                          return (
                                            y(
                                              0,
                                              (e || {})[Ap],
                                              t,
                                              e,
                                              r,
                                              function () {
                                                (n = {
                                                  statusText: (e || {})[Rp],
                                                  headerMap: null,
                                                })[tg] = x(e);
                                                var t, n;
                                                return (
                                                  A &&
                                                    e &&
                                                    ((t = {}),
                                                    e.headers.forEach(
                                                      function (n, e) {
                                                        l(e) && (t[e] = n);
                                                      }
                                                    ),
                                                    (n[Up] = t)),
                                                  n
                                                );
                                              }
                                            ),
                                            e
                                          );
                                        })
                                        ['catch'](function (n) {
                                          throw (y(0, 0, t, null, r, null), n);
                                        })));
                                },
                                hkErr: Dg(
                                  h,
                                  15,
                                  'Failed to monitor Window.fetch' + hg
                                ),
                              },
                              !0,
                              Ie()
                            )
                          ),
                          (b = !0));
                  })
                ),
                f && (i[pg].polyfill = f)),
              (e = h[pp].getPlugin(nl)) && (_ = e.plugin[sp]));
          }),
          (h._doTeardown = function () {
            n();
          }),
          (h.trackDependencyData = function (n, e) {
            w(H, h[pp], null, n, e);
          }),
          (h[gp] = function (n, e, t, r) {
            var i,
              o,
              a,
              u,
              c,
              s = h._currentWindowHost || C,
              f = z,
              l = h[pp],
              d = n,
              v = r,
              p = e,
              g = t;
            return (
              0 < f[op] &&
                (((i = {})[pp] = l),
                (i.xhr = v),
                (i.input = p),
                (i.init = g),
                (i.traceId = d[ap]),
                (i.spanId = d[up]),
                (i.traceFlags = d[cp]),
                (i.context = d[sp] || {}),
                (i.aborted = !!d[fp]),
                Mg(l, f, (v = i), 'listener'),
                (d[ap] = v[lp]),
                (d[up] = v[dp]),
                (d[cp] = v[cp]),
                (d[sp] = v[sp])),
              e || '' === e
                ? (Fs(T, n[hp](), s) &&
                    ((t = t || {}),
                    (p = new Headers(
                      t[mp] || (e instanceof Request && e[mp]) || {}
                    )),
                    E &&
                      ((o = '|' + n[ap] + '.' + n[up]),
                      p.set(kn[3], o),
                      S && (n[yp][kn[3]] = o)),
                    (a = W || (_ && _.appId())) &&
                      (p.set(kn[0], kn[2] + a),
                      S && (n[yp][kn[0]] = kn[2] + a)),
                    D &&
                      (gn((u = n[cp])) && (u = 1),
                      (c = xu(gu(n[ap], n[up], u))),
                      p.set(kn[4], c),
                      S && (n[yp][kn[4]] = c)),
                    (t[mp] = p)),
                  t)
                : r
                  ? (Fs(T, n[hp](), s) &&
                      (E &&
                        (Tg(r, kn[3])
                          ? _g(
                              h,
                              71,
                              'Unable to set [' +
                                kn[3] +
                                '] as it has already been set by another instance'
                            )
                          : ((o = '|' + n[ap] + '.' + n[up]),
                            r[xp](kn[3], o),
                            S && (n[yp][kn[3]] = o))),
                      (a = W || (_ && _.appId())) &&
                        (Tg(r, kn[0])
                          ? _g(
                              h,
                              71,
                              'Unable to set [' +
                                kn[0] +
                                '] as it has already been set by another instance'
                            )
                          : (r[xp](kn[0], kn[2] + a),
                            S && (n[yp][kn[0]] = kn[2] + a))),
                      D &&
                        (gn((u = n[cp])) && (u = 1),
                        Tg(r, kn[4])
                          ? _g(
                              h,
                              71,
                              'Unable to set [' +
                                kn[4] +
                                '] as it has already been set by another instance'
                            )
                          : ((c = xu(gu(n[ap], n[up], u))),
                            r[xp](kn[4], c),
                            S && (n[yp][kn[4]] = c)))),
                    r)
                  : undefined
            );
          }),
          (h[wp] = function (n, e, t) {
            -1 === N || r < N
              ? ((2 !== X && 1 !== X) ||
                  'string' != typeof n.id ||
                  '.' === n.id[n.id[op] - 1] ||
                  (n.id += '.'),
                gn(n[bp]) && (n[bp] = new Date()),
                (n = Yf(n, qf.dataType, qf.envelopeType, h[dg](), e, t)),
                h[pp].track(n))
              : r === N &&
                kg(
                  h,
                  55,
                  'Maximum ajax per page view limit reached, ajax monitoring is paused until the next trackPageView(). In order to increase the limit set the maxAjaxCallsPerView configuration parameter.',
                  !0
                ),
              ++r;
          }),
          (h.addDependencyListener = function (n) {
            return Pg(z, e++, n);
          }),
          (h.addDependencyInitializer = function (n) {
            return Pg(H, e++, n);
          });
      }),
      n
    );
  }
  var qg = function () {},
    Og = function () {
      (this.id = 'browser'), (this.deviceClass = 'Browser');
    },
    Fg = function (e, n) {
      var t = this,
        r = Tn(e, function () {
          var n = e.sdkExtension;
          t.sdkVersion = (n ? n + '_' : '') + 'javascript:3.1.0';
        });
      n && n.add(r);
    },
    Vg = function () {},
    zg = 'sessionManager',
    Hg = 'update',
    jg = 'isUserCookieSet',
    Bg = 'isNewUser',
    Kg = 'getTraceCtx',
    Xg = 'telemetryTrace',
    Wg = 'applySessionContext',
    Jg = 'applyApplicationContext',
    Gg = 'applyDeviceContext',
    $g = 'applyOperationContext',
    Yg = 'applyUserContext',
    Qg = 'applyOperatingSystemContxt',
    Zg = 'applyLocationContext',
    n0 = 'applyInternalContext',
    e0 = 'accountId',
    t0 = 'getSessionId',
    r0 = 'namePrefix',
    i0 = 'userCookiePostfix',
    o0 = 'idLength',
    a0 = 'getNewId',
    u0 = 'length',
    c0 = 'automaticSession',
    s0 = 'authenticatedId',
    f0 = 'acquisitionDate',
    l0 = 'renewalDate',
    d0 = 'join',
    v0 = 'cookieSeparator',
    p0 = 'authUserCookieName',
    g0 = function () {},
    h0 = ((m0.__ieDyn = 1), m0);
  function m0(s, n, e) {
    var f,
      l,
      d,
      v,
      p = ya(n),
      g = za(n);
    In(m0, this, function (a) {
      var n = Tn((s = s || {}), function (n) {
        (d = s.sessionExpirationMs || 864e5), (v = s.sessionRenewalMs || 18e5);
        var e = s.sessionCookiePostfix || s[r0] || '';
        f = 'ai_session' + e;
      });
      function u(n, e) {
        var t = !1,
          r = ', session will be reset',
          i = e.split('|');
        if (2 <= i[u0])
          try {
            var o = +i[1] || 0,
              a = +i[2] || 0;
            isNaN(o) || o <= 0
              ? Sn(p, 2, 27, 'AI session acquisition date is 0' + r)
              : isNaN(a) || a <= 0
                ? Sn(p, 2, 27, 'AI session renewal date is 0' + r)
                : i[0] && ((n.id = i[0]), (n[f0] = o), (n[l0] = a), (t = !0));
          } catch (u) {
            Sn(
              p,
              1,
              9,
              'Error parsing ai_session value [' +
                (e || '') +
                ']' +
                r +
                ' - ' +
                Cn(u),
              { exception: mn(u) }
            );
          }
        return t;
      }
      function c(n, e) {
        var t = n[f0],
          r = ((n[l0] = e), v),
          i = t + d - e,
          n = [n.id, t, e],
          t = i < r ? i / 1e3 : r / 1e3,
          i = s.cookieDomain || null;
        g.set(f, n[d0]('|'), 0 < d ? t : null, i), (l = e);
      }
      e && e.add(n),
        (a[c0] = new g0()),
        (a[Hg] = function () {
          var n,
            e,
            t,
            r = He(),
            i = !1,
            o = a[c0];
          !(i = o.id
            ? i
            : ((n = o),
              (e = !1),
              (t = g.get(f)) && $(t.split)
                ? (e = u(n, t))
                : (t = Zs(p, f)) && (e = u(n, t)),
              !(e || n.id))) &&
            0 < d &&
            ((t = r - o[f0]),
            (e = r - o[l0]),
            (i = (i = (i = t < 0 || e < 0) || d < t) || v < e)),
            i
              ? ((n = r),
                (t = s[a0] || Eo),
                (a.automaticSession.id = t(s[o0] || 22)),
                (a[c0][f0] = n),
                c(a[c0], n),
                Qs() ||
                  Sn(
                    p,
                    2,
                    0,
                    'Browser does not support local storage. Session durations will be inaccurate.'
                  ))
              : (!l || 6e4 < r - l) && c(o, r);
        }),
        (a.backup = function () {
          var n = a[c0],
            e = n.id,
            t = n[f0],
            n = n[l0];
          nf(p, f, [e, t, n][d0]('|'));
        });
    });
  }
  var y0 = function (n, e, t, r) {
    (this.traceID = n || uu()), (this.parentID = e);
    n = so();
    !t && n && n.pathname && (t = n.pathname), (this.name = L(r, t));
  };
  function x0(n) {
    return 'string' == typeof n && n && !n.match(/,|;|=| |\|/);
  }
  (b0.cookieSeparator = '|'),
    (b0.userCookieName = 'ai_user'),
    (b0.authUserCookieName = 'ai_authUser');
  var w0 = b0;
  function b0(o, n, a) {
    (this.isNewUser = !1), (this.isUserCookieSet = !1);
    var u,
      c = ya(n),
      s = za(n);
    In(b0, this, function (r) {
      yn(r, 'config', {
        g: function () {
          return o;
        },
      });
      var n = Tn(o, function () {
        var n = o[i0] || '',
          n = ((u = b0.userCookieName + n), s.get(u)),
          n =
            (n &&
              ((r[Bg] = !1),
              0 < (n = n.split(b0[v0]))[u0] &&
                ((r.id = n[0]), (r[jg] = !!r.id))),
            r.id ||
              ((r.id = e()),
              i(t(r.id)[d0](b0[v0])),
              (n = (o[r0] || '') + 'ai_session'),
              ef(c, n)),
            (r[e0] = o[e0] || undefined),
            s.get(b0[p0]));
        n &&
          ((n = (n = decodeURI(n)).split(b0[v0]))[0] && (r[s0] = n[0]),
          1 < n[u0] && n[1] && (r[e0] = n[1]));
      });
      function e() {
        var n = o || {};
        return (n[a0] || Eo)(n[o0] ? o[o0] : 22);
      }
      function t(n) {
        var e = zi(new Date());
        return (r.accountAcquisitionDate = e), (r[Bg] = !0), [n, e];
      }
      function i(n) {
        r[jg] = s.set(u, n, 31536e3);
      }
      a && a.add(n),
        (r.setAuthenticatedUserContext = function (n, e, t) {
          void 0 === t && (t = !1),
            !x0(n) || (e && !x0(e))
              ? Sn(
                  c,
                  2,
                  60,
                  'Setting auth user context failed. User auth/account id should be of type string, and not contain commas, semi-colons, equal signs, spaces, or vertical-bars.',
                  !0
                )
              : ((r[s0] = n),
                (n = r[s0]),
                e && ((r[e0] = e), (n = [r[s0], r.accountId][d0](b0[v0]))),
                t && s.set(b0[p0], encodeURI(n)));
        }),
        (r.clearAuthenticatedUserContext = function () {
          (r[s0] = null), (r[e0] = null), s.del(b0[p0]);
        }),
        (r[Hg] = function (n) {
          (r.id === n && r[jg]) || i(t(n || e())[d0](b0[v0]));
        });
    });
  }
  var I0 = 'ext',
    C0 = 'tags';
  function T0(n, e) {
    n && n[e] && 0 === Mn(n[e])[u0] && delete n[e];
  }
  function S0() {
    return null;
  }
  D0.__ieDyn = 1;
  var k0,
    _0 = D0;
  function D0(r, o, a, u) {
    var c = this,
      s = r.logger;
    In(D0, this, function (i) {
      var n, e, t;
      (i.appId = S0),
        (i[t0] = S0),
        (i.application = new qg()),
        (i.internal = new Fg(o, u)),
        xe() &&
          ((i[zg] = new h0(o, r, u)),
          (i.device = new Og()),
          (i.location = new Vg()),
          (i.user = new w0(o, r, u)),
          (e = n = void 0),
          a && ((n = a.getTraceId()), (e = a.getSpanId()), (t = a.getName())),
          (i[Xg] = new y0(n, e, t, s)),
          (i.session = new g0())),
        (i[t0] = function () {
          var n = i.session;
          return n && G(n.id)
            ? n.id
            : (n = (i[zg] || {})[c0]) && G(n.id)
              ? n.id
              : null;
        }),
        (i[Wg] = function (n, e) {
          p(Hi(n.ext, 'app'), 'sesId', i[t0](), G);
        }),
        (i[Qg] = function (n, e) {
          p(n.ext, 'os', i.os);
        }),
        (i[Jg] = function (n, e) {
          var t = i.application;
          t &&
            (p((n = Hi(n, C0)), l.applicationVersion, t.ver, G),
            p(n, l.applicationBuild, t.build, G));
        }),
        (i[Gg] = function (n, e) {
          var t = i.device;
          t &&
            (p((n = Hi(Hi(n, I0), 'device')), 'localId', t.id, G),
            p(n, 'ip', t.ip, G),
            p(n, 'model', t.model, G),
            p(n, 'deviceClass', t.deviceClass, G));
        }),
        (i[n0] = function (n, e) {
          var t,
            r = i.internal;
          r &&
            (p((t = Hi(n, C0)), l.internalAgentVersion, r.agentVersion, G),
            p(t, l.internalSdkVersion, L(s, r.sdkVersion, 64), G),
            (n.baseType !== ha.dataType && n.baseType !== Uf.dataType) ||
              (p(t, l.internalSnippet, r.snippetVer, G),
              p(t, l.internalSdkSrc, r.sdkSrc, G)));
        }),
        (i[Zg] = function (n, e) {
          var t = c.location;
          t && p(Hi(n, C0, []), l.locationIp, t.ip, G);
        }),
        (i[$g] = function (n, e) {
          var t = i[Xg];
          t &&
            (p(
              (n = Hi(Hi(n, I0), 'trace', {
                traceID: undefined,
                parentID: undefined,
              })),
              'traceID',
              t.traceID,
              G,
              gn
            ),
            p(n, 'name', t.name, G, gn),
            p(n, 'parentID', t.parentID, G, gn));
        }),
        (i.applyWebContext = function (n, e) {
          var t = c.web;
          t && p(Hi(n, I0), 'web', t);
        }),
        (i[Yg] = function (n, e) {
          var t = i.user;
          t &&
            (p(Hi(n, C0, []), l.userAccountId, t[e0], G),
            p((n = Hi(Hi(n, I0), 'user')), 'id', t.id, G),
            p(n, 'authId', t[s0], G));
        }),
        (i.cleanUp = function (n, e) {
          n = n.ext;
          n &&
            (T0(n, 'device'),
            T0(n, 'user'),
            T0(n, 'web'),
            T0(n, 'os'),
            T0(n, 'app'),
            T0(n, 'trace'));
        });
    });
  }
  var E0,
    e = null,
    P0 = dn(
      (((o = {})[e0] = e),
      (o.sessionRenewalMs = 18e5),
      (o.samplingPercentage = 100),
      (o.sessionExpirationMs = 864e5),
      (o.cookieDomain = e),
      (o.sdkExtension = e),
      (o.isBrowserLinkTrackingEnabled = !1),
      (o.appId = e),
      (o[t0] = e),
      (o[r0] = k0),
      (o.sessionCookiePostfix = k0),
      (o[i0] = k0),
      (o[o0] = 22),
      (o[a0] = e),
      o)
    );
  function M0() {
    var s,
      f,
      l,
      d,
      v,
      n = E0.call(this) || this;
    return (
      (n.priority = 110),
      (n.identifier = nl),
      In(M0, n, function (u, c) {
        function t() {
          v = !(d = l = f = s = null);
        }
        t(),
          yn(u, 'context', {
            g: function () {
              return d;
            },
          }),
          (u.initialize = function (n, e, t, r) {
            var i, o, a;
            c.initialize(n, e, t, r),
              (o = u.identifier),
              (a = u.core),
              u._addHook(
                Tn((i = n), function () {
                  var n = Eu(null, i, a);
                  i.storagePrefix && Ys(i.storagePrefix),
                    (v = !1 !== i.disableUserInitMessage),
                    (s = n.getExtCfg(o, P0)),
                    (u._extConfig = s);
                })
              ),
              (l = a[Kg](!1)),
              (d = new _0(a, s, l, u._unloadHooks)),
              (f = js(u.context[Xg], l)),
              a.setTraceCtx(f),
              (u.context.appId = function () {
                var n = a.getPlugin(el);
                return n ? n.plugin._appId : null;
              });
          }),
          (u.processTelemetry = function (n, e) {
            var t, r, i, o;
            gn(n) ||
              ((e = u._getTelCtx(e)),
              n.name === Uf.envelopeType &&
                e.diagLog().resetInternalMessageCount(),
              (i = d || {}).session &&
                'string' != typeof d.session.id &&
                i[zg] &&
                i[zg][Hg](),
              (t = i.user) && !t[jg] && t[Hg](i.user.id),
              (i = e),
              Hi((r = n), 'tags', []),
              Hi(r, 'ext', {}),
              (o = u.context)[Wg](r, i),
              o[Jg](r, i),
              o[Gg](r, i),
              o[$g](r, i),
              o[Yg](r, i),
              o[Qg](r, i),
              o.applyWebContext(r, i),
              o[Zg](r, i),
              o[n0](r, i),
              o.cleanUp(r, i),
              t &&
                t[Bg] &&
                ((t[Bg] = !1),
                v ||
                  ((r = new ha(72, (we() || {}).userAgent || '')),
                  ba(e.diagLog())[ur](1, r))),
              u.processNext(n, e));
          }),
          (u._doTeardown = function (n, e) {
            n = (n || {}).core();
            n && n[Kg] && n[Kg](!1) === f && n.setTraceCtx(l), t();
          });
      }),
      n
    );
  }
  kr(M0, (E0 = s)), (M0.__ieDyn = 1);
  var N0,
    A0 = M0,
    R0 = 'snippet',
    U0 = 'flush',
    L0 = 'pollInternalLogs',
    q0 = 'getPlugin',
    O0 = 'evtNamespace',
    F0 = 'version',
    V0 = 'queue',
    z0 = 'connectionString',
    H0 = 'endpointUrl',
    j0 = 'instrumentationKey',
    B0 = 'onunloadFlush',
    K0 = 'context',
    X0 = 'addHousekeepingBeforeUnload',
    W0 = 'sendMessage',
    J0 = 'updateSnippetDefinitions',
    G0 = [
      R0,
      'dependencies',
      'properties',
      '_snippetVersion',
      'appInsightsNew',
      'getSKUDefaults',
    ],
    $0 = 'iKeyUsage',
    Y0 = 'CdnUsage',
    Q0 = 'SdkLoaderVer',
    a = undefined,
    u = {
      disabled: !0,
      limit: ia({ samplingRate: 100, maxSendNumber: 1 }),
      interval: ia({ monthInterval: 3, daysOfMonth: [28] }),
    },
    Z0 =
      (((Wf = {})[z0] = a),
      (Wf[H0] = a),
      (Wf[j0] = a),
      (Wf.diagnosticLogInterval = aa(function (n) {
        return n && 0 < n;
      }, 1e4)),
      (Wf.featureOptIn =
        (((Jf = {})[$0] = { mode: 2 }),
        (Jf[Y0] = { mode: 2 }),
        (Jf[Q0] = { mode: 2 }),
        Jf)),
      (Wf.throttleMgrCfg = ia(
        (((r = {})[109] = ia(u)),
        (r[106] = ia(u)),
        (r[111] = ia(u)),
        (r[110] = ia(u)),
        r)
      )),
      Wf),
    nh =
      ((eh.prototype.addDependencyInitializer = function (n) {
        return null;
      }),
      eh);
  function eh(n) {
    var u,
      c,
      s,
      d,
      e,
      v,
      p,
      g,
      h,
      m,
      y,
      x,
      w,
      b,
      t = this;
    In(eh, this, function (o) {
      a(),
        yn(o, 'config', {
          g: function () {
            return g;
          },
        }),
        wn(['pluginVersionStringArr', 'pluginVersionString'], function (n) {
          yn(o, n, {
            g: function () {
              return p ? p[n] : null;
            },
          });
        }),
        (d = '' + (n.sv || n[F0] || '')),
        (n[V0] = n[V0] || []),
        (n[F0] = n[F0] || 2);
      var i = ea(n.config || {}, Z0);
      function a() {
        (e = Ro('AISKU')),
          (y = d = s = c = u = v = null),
          (b = w = x = !1),
          (m = new Id());
      }
      function f() {
        var n;
        v &&
          (Cc([oc, 'unload', ic], null, v),
          (n = mc(ac, v)),
          Cc([ic], null, n),
          Cc([rc], null, n));
      }
      function l(n) {
        p.addUnloadHook(n);
      }
      (g = i.cfg),
        (h = new dd()),
        yn(o, 'appInsights', {
          g: function () {
            return h;
          },
        }),
        (c = new A0()),
        (u = new Ug()),
        (s = new Zv()),
        (p = new Gu()),
        yn(o, 'core', {
          g: function () {
            return p;
          },
        }),
        l(
          Tn(i, function () {
            var n, e;
            g[z0] &&
              ((e = (n = (function (n) {
                if (!n) return {};
                var e,
                  n = n[jc](';'),
                  n = Le(
                    n,
                    function (n, e) {
                      var t,
                        e = e[jc]('=');
                      return (
                        2 === e[S] &&
                          ((t = e[0][Bc]()), (e = e[1]), (n[t] = e)),
                        n
                      );
                    },
                    {}
                  );
                return (
                  0 < Mn(n)[S] &&
                    (n.endpointsuffix &&
                      ((e = n.location ? n.location + '.' : ''),
                      (n[Kc] =
                        n[Kc] || 'https://' + e + 'dc.' + n.endpointsuffix)),
                    (n[Kc] = n[Kc] || Fc),
                    ct(n[Kc], '/') && (n[Kc] = n[Kc].slice(0, -1))),
                  n
                );
              })(g[z0])).ingestionendpoint),
              (g[H0] = e ? e + Vc : g[H0]),
              (g[j0] = n.instrumentationkey || g[j0]));
          })
        ),
        (o[R0] = n),
        (o[U0] = function (r, i) {
          var n;
          return (
            au(
              p,
              function () {
                return 'AISKU.flush';
              },
              function () {
                r &&
                  !i &&
                  (n = pi(function (n) {
                    i = n;
                  }));
                var e = 1,
                  t = function () {
                    0 == --e && i();
                  };
                wn(p.getChannels(), function (n) {
                  n && (e++, n[U0](r, t));
                }),
                  t();
              },
              null,
              (r = void 0 === r || r)
            ),
            n
          );
        }),
        (o[B0] = function (e) {
          void 0 === e && (e = !0),
            wn(p.getChannels(), function (n) {
              n[B0] ? n[B0]() : n[U0](e);
            });
        }),
        (o.loadAppInsights = function (n, e, r) {
          return (
            (n = void 0 !== n && n) && ze('Legacy Mode is no longer supported'),
            au(
              o.core,
              function () {
                return 'AISKU.loadAppInsights';
              },
              function () {
                p.initialize(g, [s, c, u, h, m], e, r),
                  yn(o, 'context', {
                    g: function () {
                      return c[K0];
                    },
                  }),
                  (y = y || new uf(p));
                var t,
                  n = (function () {
                    if (N0) return N0;
                    var n = null;
                    try {
                      var e = (document || {}).currentScript;
                      e && (n = e.src);
                    } catch (i) {}
                    if (n) {
                      try {
                        var t,
                          r = n.toLowerCase();
                        r &&
                          ((t = ''),
                          wn(
                            [
                              '://js.monitor.azure.com/',
                              '://az416426.vo.msecnd.net/',
                            ],
                            function (n, e) {
                              if (-1 !== ft(r, n))
                                return (
                                  (t = 'cdn' + (e + 1)),
                                  -1 === ft(r, '/scripts/') &&
                                    (-1 !== ft(r, '/next/')
                                      ? (t += '-next')
                                      : -1 !== ft(r, '/beta/') &&
                                        (t += '-beta')),
                                  (N0 = t + ''),
                                  -1
                                );
                            }
                          ));
                      } catch (i) {}
                      N0 = n;
                    }
                    return N0;
                  })();
                n && o[K0] && (o[K0].internal.sdkSrc = n),
                  (t = o[R0]) &&
                    ((n = ''),
                    gn(d) || (n += d),
                    o[K0] &&
                      o[K0].internal &&
                      (o[K0].internal.snippetVer = n || '-'),
                    B(o, function (n, e) {
                      G(n) &&
                        !$(e) &&
                        n &&
                        '_' !== n[0] &&
                        -1 === Ae(G0, n) &&
                        t[n] !== e &&
                        (t[n] = e);
                    })),
                  o.emptyQueue(),
                  o[L0](),
                  o[X0](o),
                  l(
                    Tn(i, function () {
                      var n = !1;
                      g.throttleMgrCfg[109] &&
                        (n = !g.throttleMgrCfg[109].disabled),
                        !y.isReady() &&
                          g.extensionConfig &&
                          g.extensionConfig[m.identifier] &&
                          n &&
                          y.onReadyState(!0),
                        x ||
                          g[z0] ||
                          !Wi($0, g) ||
                          (y[W0](
                            106,
                            'See Instrumentation key support at aka.ms/IkeyMigrate'
                          ),
                          (x = !0)),
                        !w &&
                          o[K0].internal.sdkSrc &&
                          ~o[K0].internal.sdkSrc.indexOf('az416426') &&
                          Wi(Y0, g) &&
                          (y[W0](
                            110,
                            'See Cdn support notice at aka.ms/JsActiveCdn'
                          ),
                          (w = !0)),
                        !b &&
                          parseInt(d) < 6 &&
                          Wi(Q0, g) &&
                          (y[W0](
                            111,
                            'An updated Sdk Loader is available, see aka.ms/SnippetVer'
                          ),
                          (b = !0));
                    })
                  );
              }
            ),
            o
          );
        }),
        (o[J0] = function (n) {
          var t = n,
            r = o,
            i = function (n) {
              return n && -1 === Ae(G0, n);
            };
          if (t && r && Dn(t) && Dn(r))
            for (var e in r)
              !(function (e) {
                var n;
                G(e) &&
                  ((n = r[e]),
                  $(n)
                    ? i(e) && (t[e] = ji(r, e))
                    : i(e) &&
                      (Pn(t, e) && delete t[e],
                      yn(t, e, {
                        g: function () {
                          return r[e];
                        },
                        s: function (n) {
                          r[e] = n;
                        },
                      })));
              })(e);
        }),
        (o.emptyQueue = function () {
          try {
            if (hn(o.snippet[V0])) {
              for (var n = o.snippet[V0].length, e = 0; e < n; e++)
                (0, o.snippet[V0][e])();
              (o.snippet[V0] = undefined), delete o.snippet[V0];
            }
          } catch (t) {
            t && $(t.toString) && t.toString();
          }
        }),
        (o[X0] = function (u) {
          var c, s;
          (xe() || ye()) &&
            ((s = !(c = function () {
              var n;
              u[B0](!1),
                $(o.core[q0]) &&
                  (n = t.core[q0](nl)) &&
                  (n = n.plugin) &&
                  n[K0] &&
                  n[K0]._sessionManager &&
                  n[K0]._sessionManager.backup();
            })),
            (v = v || mc(e, p[O0] && p[O0]())),
            l(
              Tn(g, function (n) {
                var e,
                  t,
                  r,
                  i,
                  o,
                  n = n.cfg,
                  a = u.appInsights,
                  a = Eu(null, n, a.core).getExtCfg(a.identifier || tl),
                  n = (f(), n.disablePageUnloadEvents);
                a.disableFlushOnBeforeUnload ||
                  ((r = n),
                  (i = v),
                  (o = !(e = [oc, 'unload', ic])),
                  (t = c),
                  (hn(e) && !(o = Ic(e, t, r, i)) && r && 0 < r[bn]
                    ? Ic(e, t, null, i)
                    : o) && (s = !0),
                  (s = !!Tc(c, n, v) || s) ||
                    ((r = we()) && r.product && 'ReactNative' === r.product) ||
                    Sn(
                      p.logger,
                      1,
                      19,
                      'Could not add handler for beforeunload and pagehide'
                    )),
                  s || a.disableFlushOnUnload || Tc(c, n, v);
              })
            ));
        }),
        (o.getSender = function () {
          return s;
        }),
        (o.unload = function (n, e, t) {
          var r,
            i = !1;
          return (
            n &&
              !e &&
              (r = pi(function (n) {
                e = n;
              })),
            o[B0](n),
            f(),
            p.unload &&
              p.unload(
                n,
                function (n) {
                  i || ((i = !0), a(), e && e(n));
                },
                t
              ),
            r
          );
        }),
        Ki(o, h, [
          'getCookieMgr',
          'trackEvent',
          'trackPageView',
          'trackPageViewPerformance',
          'trackException',
          '_onerror',
          'trackTrace',
          'trackMetric',
          'startTrackPage',
          'stopTrackPage',
          'startTrackEvent',
          'stopTrackEvent',
        ]),
        Ki(
          o,
          function () {
            return u;
          },
          [
            'trackDependencyData',
            'addDependencyListener',
            'addDependencyInitializer',
          ]
        ),
        Ki(o, p, [
          'addTelemetryInitializer',
          L0,
          'stopPollingInternalLogs',
          q0,
          'addPlugin',
          O0,
          'addUnloadCb',
          'getTraceCtx',
          'updateCfg',
          'onCfgChange',
        ]),
        Ki(
          o,
          function () {
            var n = c[K0];
            return n ? n.user : null;
          },
          ['setAuthenticatedUserContext', 'clearAuthenticatedUserContext']
        );
    });
  }
  oh.getAppInsights = function (n, e) {
    var t = new nh(n);
    if (2 <= e) return t[J0](n), t.loadAppInsights(!1), t;
    ze('V1 API compatibility is no longer supported');
  };
  var th,
    rh,
    ih,
    t = oh;
  function oh() {}
  function ah(n, e) {
    var t = xn('console');
    t &&
      t.warn &&
      t.warn(
        'Failed to initialize AppInsights JS SDK for instance ' +
          (n || '<unknown>') +
          ' - ' +
          e
      );
  }
  try {
    typeof window !== xr
      ? ((ih = (th = window).appInsightsSDK || 'appInsights'),
        typeof JSON !== xr
          ? th[ih] !== undefined &&
            ((2 <= (rh = th[ih] || { version: 2 })[F0] && th[ih].initialize) ||
              rh[F0] === undefined) &&
            t.getAppInsights(rh, rh[F0])
          : ah(ih, 'Missing JSON - you must supply a JSON polyfill!'))
      : ah(ih, 'Missing window');
  } catch (uh) {
    ah(ih, uh.message);
  }
  (n.AnalyticsPluginIdentifier = tl),
    (n.ApplicationInsights = nh),
    (n.BreezeChannelIdentifier = el),
    (n.DEFAULT_BREEZE_ENDPOINT = Fc),
    (n.DisabledPropertyName = Uc),
    (n.DistributedTracingModes = _),
    (n.LoggingSeverity = q),
    (n.PerfEvent = eu),
    (n.PerfManager = ru),
    (n.PropertiesPluginIdentifier = nl),
    (n.RequestHeaders = kn),
    (n.SeverityLevel = U),
    (n.addEventHandler = wc),
    (n.doPerf = au),
    (n.eventOff = xc),
    (n.eventOn = yc),
    (n.findMetaTag = xo),
    (n.findW3cTraceParent = function (n) {
      var e, t;
      return (
        hu(xo('traceparent'), n) ||
        hu(
          (e = (t = ot())
            ? yo(
                (0 < (t = t.getEntriesByType('navigation') || [])[bn]
                  ? t[0]
                  : {}
                ).serverTiming,
                'traceparent'
              ).description
            : e),
          n
        )
      );
    }),
    (n.generateW3CId = uu),
    (n.isBeaconsSupported = go),
    (n.mergeEvtNamespace = mc),
    (n.newGuid = function () {
      var n = uu();
      return (
        Xn(n, 0, 8) +
        '-' +
        Xn(n, 8, 12) +
        '-' +
        Xn(n, 12, 16) +
        '-' +
        Xn(n, 16, 20) +
        '-' +
        Xn(n, 20)
      );
    }),
    (n.newId = Eo),
    (n.random32 = Do),
    (n.randomValue = _o),
    (n.removeEventHandler = bc);
});
//# sourceMappingURL=ai.3.1.0.gbl.min.js.map
